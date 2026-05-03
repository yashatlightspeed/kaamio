import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const stored = localStorage.getItem('kaamio_user');

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/auth/profile', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: stored ? JSON.parse(stored) : null,
    token: localStorage.getItem('kaamio_token') || null,
    loading: false,
    error: null,
    initialized: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('kaamio_token');
      localStorage.removeItem('kaamio_user');
    },
    clearError: (state) => { state.error = null; },
    setInitialized: (state) => { state.initialized = true; },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => { state.loading = true; state.error = null; };
    const handleRejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(register.pending, handlePending)
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('kaamio_token', action.payload.token);
        localStorage.setItem('kaamio_user', JSON.stringify(action.payload.user));
      })
      .addCase(register.rejected, handleRejected)
      .addCase(login.pending, handlePending)
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('kaamio_token', action.payload.token);
        localStorage.setItem('kaamio_user', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, handleRejected)
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.initialized = true;
        localStorage.setItem('kaamio_user', JSON.stringify(action.payload.user));
      })
      .addCase(getMe.rejected, (state) => {
        state.initialized = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        localStorage.setItem('kaamio_user', JSON.stringify(action.payload.user));
      });
  },
});

export const { logout, clearError, setInitialized } = authSlice.actions;
export default authSlice.reducer;
