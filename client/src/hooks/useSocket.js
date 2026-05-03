import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { addNotification } from '../redux/slices/notificationSlice';
import toast from 'react-hot-toast';

let socketInstance = null;

export const getSocket = () => socketInstance;

const useSocket = (user) => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?._id) return;

    const socket = io('/', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;
    socketInstance = socket;

    socket.on('connect', () => {
      socket.emit('join', user._id);
    });

    socket.on('notification', (data) => {
      dispatch(addNotification({ ...data, read: false, createdAt: new Date().toISOString() }));
      toast(data.message, {
        icon: '🔔',
        style: { background: '#1e2535', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.08)' },
      });
    });

    socket.on('disconnect', () => {
      socketInstance = null;
    });

    return () => {
      socket.disconnect();
      socketInstance = null;
    };
  }, [user?._id]);

  return socketRef.current;
};

export default useSocket;
