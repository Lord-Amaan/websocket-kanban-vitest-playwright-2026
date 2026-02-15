import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from './test-utils';
import { KanbanBoard } from '../components/KanbanBoard';
import * as useWebSocketModule from '../hooks/useWebSocket';

describe('KanbanBoard Integration Tests', () => {
  const mockWebSocket = {
    isConnected: true,
    isLoading: false,
    tasks: [
      {
        id: '1',
        title: 'Test Task 1',
        description: 'Description 1',
        status: 'todo',
        priority: 'high',
        category: 'feature',
        attachments: [],
      },
      {
        id: '2',
        title: 'Test Task 2',
        description: 'Description 2',
        status: 'inprogress',
        priority: 'medium',
        category: 'bug',
        attachments: [],
      },
    ],
    createTask: vi.fn(),
    updateTask: vi.fn(),
    moveTask: vi.fn(),
    deleteTask: vi.fn(),
  };

  beforeEach(() => {
    vi.spyOn(useWebSocketModule, 'useWebSocket').mockReturnValue(mockWebSocket);
  });

  it('renders all three columns', () => {
    render(<KanbanBoard />);

    expect(screen.getByTestId('column-todo')).toBeInTheDocument();
    expect(screen.getByTestId('column-inprogress')).toBeInTheDocument();
    expect(screen.getByTestId('column-done')).toBeInTheDocument();
  });

  it('displays connection status', () => {
    render(<KanbanBoard />);

    expect(screen.getByText('Connected to server')).toBeInTheDocument();
  });

  it('shows loading state when disconnected', () => {
    vi.spyOn(useWebSocketModule, 'useWebSocket').mockReturnValue({
      ...mockWebSocket,
      isConnected: false,
    });

    render(<KanbanBoard />);

    expect(screen.getByText('Connecting to server...')).toBeInTheDocument();
  });

  it('displays tasks in correct columns', () => {
    render(<KanbanBoard />);

    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
  });

  it('opens new task form when button is clicked', () => {
    render(<KanbanBoard />);

    const newTaskButton = screen.getByTestId('new-task-btn');
    fireEvent.click(newTaskButton);

    expect(screen.getByTestId('new-task-form')).toBeInTheDocument();
  });

  it('creates new task with form data', async () => {
    render(<KanbanBoard />);

    // Open form
    const newTaskButton = screen.getByTestId('new-task-btn');
    fireEvent.click(newTaskButton);

    // Fill form
    const titleInput = screen.getByTestId('new-task-title');
    const descriptionInput = screen.getByTestId('new-task-description');

    fireEvent.change(titleInput, { target: { value: 'New Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });

    // Submit
    const createButton = screen.getByTestId('create-task-btn');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockWebSocket.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Task',
          description: 'New Description',
          priority: 'medium',
          category: 'feature',
          status: 'todo',
        })
      );
    });
  });

  it('shows alert when creating task without title', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<KanbanBoard />);

    // Open form
    const newTaskButton = screen.getByTestId('new-task-btn');
    fireEvent.click(newTaskButton);

    // Try to create without title
    const createButton = screen.getByTestId('create-task-btn');
    fireEvent.click(createButton);

    expect(alertSpy).toHaveBeenCalledWith('Please enter a task title');

    alertSpy.mockRestore();
  });

  it('renders task progress chart when tasks exist', () => {
    render(<KanbanBoard />);

    expect(screen.getByTestId('task-progress-chart')).toBeInTheDocument();
  });

  it('does not render task progress chart when no tasks', () => {
    vi.spyOn(useWebSocketModule, 'useWebSocket').mockReturnValue({
      ...mockWebSocket,
      tasks: [],
    });

    render(<KanbanBoard />);
expect(screen.queryByTestId('task-progress-chart')).toBeNull();

  });

  it('closes form after creating task', async () => {
    render(<KanbanBoard />);

    // Open form
    const newTaskButton = screen.getByTestId('new-task-btn');
    fireEvent.click(newTaskButton);

    expect(screen.getByTestId('new-task-form')).toBeInTheDocument();

    // Fill and submit
    const titleInput = screen.getByTestId('new-task-title');
    fireEvent.change(titleInput, { target: { value: 'New Task' } });

    const createButton = screen.getByTestId('create-task-btn');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.queryByTestId('new-task-form')).toBeNull();
    });
  });
});
