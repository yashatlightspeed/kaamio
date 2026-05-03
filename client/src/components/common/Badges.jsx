export const PriorityBadge = ({ priority }) => {
  const map = {
    low: 'priority-low',
    medium: 'priority-medium',
    high: 'priority-high',
    critical: 'priority-critical',
  };
  return (
    <span className={`badge ${map[priority] || 'priority-medium'} capitalize`}>
      {priority}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const map = {
    'todo': 'status-todo',
    'in-progress': 'status-in-progress',
    'review': 'status-review',
    'completed': 'status-completed',
  };
  const labels = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'review': 'Review',
    'completed': 'Completed',
  };
  return (
    <span className={`badge ${map[status] || 'status-todo'}`}>
      {labels[status] || status}
    </span>
  );
};

export const ProjectStatusBadge = ({ status }) => {
  const map = {
    active: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    completed: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    'on-hold': 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    archived: 'bg-slate-500/15 text-slate-400 border border-slate-500/20',
  };
  return (
    <span className={`badge ${map[status] || ''} capitalize`}>
      {status}
    </span>
  );
};
