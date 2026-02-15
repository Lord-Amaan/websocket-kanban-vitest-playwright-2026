import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3002';

export const useWebSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    socketInstance.on('sync:tasks', (syncedTasks) => {
      setTasks(syncedTasks);
    });

    socketInstance.on('task:created', (newTask) => {
      setTasks((prev) => [...prev, newTask]);
    });

    socketInstance.on('task:updated', (updatedTask) => {
      setTasks((prev) =>
        prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
    });

    socketInstance.on('task:moved', (data) => {
      setTasks((prev) =>
        prev.map((task) => (task.id === data.id ? data.task : task))
      );
    });

    socketInstance.on('task:deleted', (taskId) => {
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    });

    socketInstance.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const createTask = (taskData) => {
    if (socket) {
      socket.emit('task:create', taskData);
    }
  };

  const updateTask = (taskData) => {
    if (socket) {
      socket.emit('task:update', taskData);
    }
  };

  const moveTask = (taskId, status) => {
    if (socket) {
      socket.emit('task:move', { id: taskId, status });
    }
  };

  const deleteTask = (taskId) => {
    if (socket) {
      socket.emit('task:delete', taskId);
    }
  };

  return {
    socket,
    isConnected,
    tasks,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
  };
};
