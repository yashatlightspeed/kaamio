import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/projects', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch projects');
  }
});

export const fetchProject = createAsyncThunk('projects/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch project');
  }
});

export const createProject = createAsyncThunk('projects/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/projects', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create project');
  }
});

export const updateProject = createAsyncThunk('projects/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/projects/${id}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update project');
  }
});

export const deleteProject = createAsyncThunk('projects/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/projects/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete project');
  }
});

export const addMember = createAsyncThunk('projects/addMember', async ({ projectId, userId }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/projects/${projectId}/members`, { userId });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add member');
  }
});

export const fetchAnalytics = createAsyncThunk('projects/analytics', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/projects/analytics/summary');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch analytics');
  }
});

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    list: [],
    current: null,
    analytics: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrent: (state) => { state.current = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => { state.loading = true; })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.projects;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProject.pending, (state) => { state.loading = true; })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.list.unshift(action.payload.project);
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const idx = state.list.findIndex((p) => p._id === action.payload.project._id);
        if (idx !== -1) state.list[idx] = action.payload.project;
        if (state.current?.project?._id === action.payload.project._id) {
          state.current.project = action.payload.project;
        }
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p._id !== action.payload);
      })
      .addCase(addMember.fulfilled, (state, action) => {
        const idx = state.list.findIndex((p) => p._id === action.payload.project._id);
        if (idx !== -1) state.list[idx] = action.payload.project;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload.analytics;
      });
  },
});

export const { clearCurrent, clearError } = projectSlice.actions;
export default projectSlice.reducer;
