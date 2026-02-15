import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = 'https://websocket-kanban-vitest-playwright-2026-wpss.onrender.com';

export const useWebSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
      setIsLoading(false);
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
      console.error('Error details:', error);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      console.error('Connect error reason:', error.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const createTask = (taskData) => {
    if (socket) {
      try {
        socket.emit('task:create', taskData, (error) => {
          if (error) {
            console.error('Failed to create task:', error);
          }
        });
      } catch (error) {
        console.error('Error creating task:', error);
      }
    }
  };

  const updateTask = (taskData) => {
    // TODO: Add optimistic updates
    if (socket) {
      try {
        socket.emit('task:update', taskData, (error) => {
          if (error) {
            console.error('Failed to update:', error);
          }
        });
      } catch (error) {
        console.error('Update error:', error);
      }
    }
  };

  const moveTask = (taskId, status) => {
    if (socket) {
      try {
        socket.emit('task:move', { id: taskId, status }, (error) => {
          if (error) {
            console.error('Move failed:', error);
          }
        });
      } catch (error) {
        console.error('Error moving task:', error);
      }
    }
  };

  const deleteTask = (taskId) => {
    if (socket) {
      try {
        socket.emit('task:delete', taskId, (error) => {
          if (error) {
            console.error('Delete failed:', error);
          }
        });
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  return {
    socket,
    isConnected,
    isLoading,
    tasks,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
  };
};
