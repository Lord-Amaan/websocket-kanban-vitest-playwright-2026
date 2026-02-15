import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useWebSocket } from '../frontend/useWebSocket';
import { io } from 'socket.io-client';

// Mock socket.io-client
vi.mock('socket.io-client');

describe('WebSocket Integration Tests', () => {
  let mockSocket;

  beforeEach(() => {
    mockSocket = {
      on: vi.fn(),
      emit: vi.fn(),
      disconnect: vi.fn(),
    };

    io.mockReturnValue(mockSocket);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('establishes WebSocket connection on mount', () => {
    renderHook(() => useWebSocket());

    expect(io).toHaveBeenCalledWith('http://localhost:3001', {
      transports: ['websocket', 'polling'],
    });
  });

  it('registers event listeners for WebSocket events', () => {
    renderHook(() => useWebSocket());

    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('sync:tasks', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('task:created', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('task:updated', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('task:moved', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('task:deleted', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('updates connection status on connect event', async () => {
    const { result } = renderHook(() => useWebSocket());

    // Simulate connect event
    const connectHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'connect'
    )[1];
    connectHandler();

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
  });

  it('updates tasks on sync:tasks event', async () => {
    const { result } = renderHook(() => useWebSocket());

    const mockTasks = [
      { id: '1', title: 'Task 1', status: 'todo' },
      { id: '2', title: 'Task 2', status: 'inprogress' },
    ];

    // Simulate sync:tasks event
    const syncHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'sync:tasks'
    )[1];
    syncHandler(mockTasks);

    await waitFor(() => {
      expect(result.current.tasks).toEqual(mockTasks);
    });
  });

  it('adds new task on task:created event', async () => {
    const { result } = renderHook(() => useWebSocket());

    const existingTask = { id: '1', title: 'Task 1', status: 'todo' };
    const newTask = { id: '2', title: 'Task 2', status: 'todo' };

    // Set initial tasks
    const syncHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'sync:tasks'
    )[1];
    syncHandler([existingTask]);

    // Simulate task:created event
    const createdHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'task:created'
    )[1];
    createdHandler(newTask);

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(2);
      expect(result.current.tasks).toContainEqual(newTask);
    });
  });

  it('updates task on task:updated event', async () => {
    const { result } = renderHook(() => useWebSocket());

    const originalTask = { id: '1', title: 'Original Title', status: 'todo' };
    const updatedTask = { id: '1', title: 'Updated Title', status: 'todo' };

    // Set initial tasks
    const syncHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'sync:tasks'
    )[1];
    syncHandler([originalTask]);

    // Simulate task:updated event
    const updatedHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'task:updated'
    )[1];
    updatedHandler(updatedTask);

    await waitFor(() => {
      expect(result.current.tasks[0].title).toBe('Updated Title');
    });
  });

  it('moves task on task:moved event', async () => {
    const { result } = renderHook(() => useWebSocket());

    const task = { id: '1', title: 'Task 1', status: 'todo' };

    // Set initial tasks
    const syncHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'sync:tasks'
    )[1];
    syncHandler([task]);

    // Simulate task:moved event
    const movedHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'task:moved'
    )[1];
    movedHandler({
      id: '1',
      status: 'done',
      task: { ...task, status: 'done' },
    });

    await waitFor(() => {
      expect(result.current.tasks[0].status).toBe('done');
    });
  });

  it('deletes task on task:deleted event', async () => {
    const { result } = renderHook(() => useWebSocket());

    const tasks = [
      { id: '1', title: 'Task 1', status: 'todo' },
      { id: '2', title: 'Task 2', status: 'todo' },
    ];

    // Set initial tasks
    const syncHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'sync:tasks'
    )[1];
    syncHandler(tasks);

    // Simulate task:deleted event
    const deletedHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'task:deleted'
    )[1];
    deletedHandler('1');

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].id).toBe('2');
    });
  });

  it('emits task:create event when createTask is called', () => {
    const { result } = renderHook(() => useWebSocket());

    const newTask = {
      title: 'New Task',
      description: 'Description',
      priority: 'high',
      category: 'feature',
    };

    result.current.createTask(newTask);

    expect(mockSocket.emit).toHaveBeenCalledWith('task:create', newTask);
  });

  it('emits task:update event when updateTask is called', () => {
    const { result } = renderHook(() => useWebSocket());

    const updatedTask = {
      id: '1',
      title: 'Updated Task',
      description: 'Updated Description',
    };

    result.current.updateTask(updatedTask);

    expect(mockSocket.emit).toHaveBeenCalledWith('task:update', updatedTask);
  });

  it('emits task:move event when moveTask is called', () => {
    const { result } = renderHook(() => useWebSocket());

    result.current.moveTask('1', 'done');

    expect(mockSocket.emit).toHaveBeenCalledWith('task:move', {
      id: '1',
      status: 'done',
    });
  });

  it('emits task:delete event when deleteTask is called', () => {
    const { result } = renderHook(() => useWebSocket());

    result.current.deleteTask('1');

    expect(mockSocket.emit).toHaveBeenCalledWith('task:delete', '1');
  });

  it('disconnects socket on unmount', () => {
    const { unmount } = renderHook(() => useWebSocket());

    unmount();

    expect(mockSocket.disconnect).toHaveBeenCalled();
  });
});
