import { configureStore } from '@reduxjs/toolkit';
import authReducer from './redux/slices/authSlice';
import projectReducer from './redux/slices/projectSlice';
import taskReducer from './redux/slices/taskSlice';
import notificationReducer from './redux/slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    tasks: taskReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
