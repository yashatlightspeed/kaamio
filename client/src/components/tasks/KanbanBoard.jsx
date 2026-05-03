import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { updateTask } from '../../redux/slices/taskSlice';
import { updateTaskLocally } from '../../redux/slices/taskSlice';
import api from '../../services/api';
import { PriorityBadge, StatusBadge } from '../common/Badges';
import { format, isPast } from 'date-fns';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'todo', label: 'To Do', icon: '○', color: '#64748b' },
  { id: 'in-progress', label: 'In Progress', icon: '◑', color: '#3b82f6' },
  { id: 'review', label: 'Review', icon: '◕', color: '#f59e0b' },
  { id: 'completed', label: 'Completed', icon: '●', color: '#22c55e' },
];

const TaskCard = ({ task, onClick, isDragging }) => {
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'completed';

  return (
    <div
      onClick={() => onClick(task)}
      className={`
        bg-surface-700 border rounded-xl p-3 cursor-pointer transition-all
        ${isDragging ? 'opacity-50 scale-95' : 'hover:border-brand-500/30 hover:shadow-glow-sm'}
        ${isOverdue ? 'border-red-500/30' : 'border-white/5'}
      `}
    >
      {/* Labels */}
      {task.labels?.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-2">
          {task.labels.slice(0, 3).map((l) => (
            <span key={l} className="text-[10px] bg-brand-600/20 text-brand-300 px-1.5 py-0.5 rounded-full border border-brand-500/20">
              {l}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <p className="text-sm font-medium text-white leading-snug mb-2">{task.title}</p>

      {/* Badges */}
      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        <PriorityBadge priority={task.priority} />
        {isOverdue && <span className="badge bg-red-500/15 text-red-400 border border-red-500/20">Overdue</span>}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        {task.dueDate && (
          <span className={`text-[11px] ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
            📅 {format(new Date(task.dueDate), 'MMM d')}
          </span>
        )}
        {task.assignedTo && (
          <div className="w-6 h-6 rounded-lg bg-brand-600/25 flex items-center justify-center text-[10px] font-bold text-brand-300 ml-auto" title={task.assignedTo.name}>
            {task.assignedTo.name?.charAt(0)}
          </div>
        )}
      </div>

      {/* Subtask progress */}
      {task.subtasks?.length > 0 && (
        <div className="mt-2">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>Subtasks</span>
            <span>{task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}</span>
          </div>
          <div className="h-1 bg-surface-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full"
              style={{ width: `${(task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Comments */}
      {task.comments?.length > 0 && (
        <div className="text-[11px] text-slate-500 mt-1.5">💬 {task.comments.length} comments</div>
      )}
    </div>
  );
};

const SortableTaskCard = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onClick={onClick} isDragging={isDragging} />
    </div>
  );
};

const KanbanBoard = ({ tasks, onTaskClick, isAdmin }) => {
  const dispatch = useDispatch();
  const [activeTask, setActiveTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const tasksByColumn = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter((t) => t.status === col.id);
    return acc;
  }, {});

  const handleDragStart = ({ active }) => {
    setActiveTask(tasks.find((t) => t._id === active.id));
  };

  const handleDragOver = ({ over }) => {
    if (over) {
      const colId = COLUMNS.find((c) => c.id === over.id)?.id ||
        tasks.find((t) => t._id === over.id)?.status;
      setDragOverColumn(colId);
    }
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    setDragOverColumn(null);
    if (!over) return;

    const task = tasks.find((t) => t._id === active.id);
    if (!task) return;

    // Determine target column
    const targetCol = COLUMNS.find((c) => c.id === over.id)?.id ||
      tasks.find((t) => t._id === over.id)?.status;

    if (targetCol && targetCol !== task.status) {
      dispatch(updateTaskLocally({ _id: task._id, status: targetCol }));
      try {
        await api.put(`/tasks/${task._id}`, { status: targetCol });
        toast.success(`Moved to ${COLUMNS.find((c) => c.id === targetCol)?.label}`);
      } catch {
        dispatch(updateTaskLocally({ _id: task._id, status: task.status }));
        toast.error('Failed to update task');
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
        {COLUMNS.map((col) => {
          const colTasks = tasksByColumn[col.id] || [];
          return (
            <div
              key={col.id}
              className={`flex-shrink-0 w-72 flex flex-col rounded-xl border transition-all duration-200 ${
                dragOverColumn === col.id
                  ? 'border-brand-500/40 bg-brand-500/5'
                  : 'border-white/5 bg-surface-800'
              }`}
            >
              {/* Column header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <span style={{ color: col.color }} className="text-lg leading-none">{col.icon}</span>
                <span className="font-semibold text-white text-sm">{col.label}</span>
                <span className="ml-auto w-5 h-5 rounded-full bg-surface-700 flex items-center justify-center text-[11px] font-semibold text-slate-400">
                  {colTasks.length}
                </span>
              </div>

              {/* Cards */}
              <SortableContext items={colTasks.map((t) => t._id)} strategy={verticalListSortingStrategy} id={col.id}>
                <div className="flex-1 p-3 space-y-2 kanban-col">
                  <AnimatePresence>
                    {colTasks.map((task) => (
                      <SortableTaskCard key={task._id} task={task} onClick={onTaskClick} />
                    ))}
                  </AnimatePresence>
                  {colTasks.length === 0 && (
                    <div className="h-20 border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-slate-600 text-xs">
                      Drop here
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeTask && (
          <div className="opacity-90 rotate-2 shadow-2xl">
            <TaskCard task={activeTask} onClick={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
