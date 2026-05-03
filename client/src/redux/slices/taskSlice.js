import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProjectTasks = createAsyncThunk('tasks/fetchByProject', async ({ projectId, params }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/tasks/project/${projectId}`, { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch tasks');
  }
});

export const fetchMyTasks = createAsyncThunk('tasks/fetchMy', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/tasks/my');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch tasks');
  }
});

export const createTask = createAsyncThunk('tasks/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/tasks', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create task');
  }
});

export const updateTask = createAsyncThunk('tasks/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/tasks/${id}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update task');
  }
});

export const deleteTask = createAsyncThunk('tasks/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/tasks/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete task');
  }
});

export const addComment = createAsyncThunk('tasks/addComment', async ({ taskId, text }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/tasks/${taskId}/comments`, { text });
    return { taskId, comments: res.data.comments };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add comment');
  }
});

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    list: [],
    myTasks: [],
    myStats: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearTasks: (state) => { state.list = []; },
    updateTaskLocally: (state, action) => {
      const idx = state.list.findIndex((t) => t._id === action.payload._id);
      if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload };
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectTasks.pending, (state) => { state.loading = true; })
      .addCase(fetchProjectTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.tasks;
      })
      .addCase(fetchProjectTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.myTasks = action.payload.tasks;
        state.myStats = action.payload.stats;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.list.unshift(action.payload.task);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.list.findIndex((t) => t._id === action.payload.task._id);
        if (idx !== -1) state.list[idx] = action.payload.task;
        const myIdx = state.myTasks.findIndex((t) => t._id === action.payload.task._id);
        if (myIdx !== -1) state.myTasks[myIdx] = action.payload.task;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.list = state.list.filter((t) => t._id !== action.payload);
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const task = state.list.find((t) => t._id === action.payload.taskId);
        if (task) task.comments = action.payload.comments;
      });
  },
});

export const { clearTasks, updateTaskLocally, clearError } = taskSlice.actions;
export default taskSlice.reducer;
