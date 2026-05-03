import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/notifications'); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const markRead = createAsyncThunk('notifications/markRead', async (id, { rejectWithValue }) => {
  try { await api.put('/notifications/' + id + '/read'); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const markAllRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try { await api.put('/notifications/read-all'); }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteNotification = createAsyncThunk('notifications/delete', async (id, { rejectWithValue }) => {
  try { await api.delete('/notifications/' + id); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { list: [], unreadCount: 0, loading: false },
  reducers: { addNotification: (state, action) => { state.list.unshift(action.payload); state.unreadCount += 1; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => { state.list = action.payload.notifications; state.unreadCount = action.payload.unreadCount; })
      .addCase(markRead.fulfilled, (state, action) => { const n = state.list.find((n) => n._id === action.payload); if (n && !n.read) { n.read = true; state.unreadCount = Math.max(0, state.unreadCount - 1); } })
      .addCase(markAllRead.fulfilled, (state) => { state.list.forEach((n) => { n.read = true; }); state.unreadCount = 0; })
      .addCase(deleteNotification.fulfilled, (state, action) => { state.list = state.list.filter((n) => n._id !== action.payload); });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
