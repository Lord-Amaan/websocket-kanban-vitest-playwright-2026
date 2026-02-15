import { describe, it, expect, vi } from 'vitest';
import { render, screen } from './test-utils';
import { Column } from '../components/Column';

const mockTasks = [
  {
    id: '1',
    title: 'Task 1',
    description: 'Description 1',
    status: 'todo',
    priority: 'high',
    category: 'feature',
    attachments: [],
  },
  {
    id: '2',
    title: 'Task 2',
    description: 'Description 2',
    status: 'todo',
    priority: 'medium',
    category: 'bug',
    attachments: [],
  },
  {
    id: '3',
    title: 'Task 3',
    description: 'Description 3',
    status: 'inprogress',
    priority: 'low',
    category: 'enhancement',
    attachments: [],
  },
];

describe('Column Component', () => {
  it('renders column with correct title', () => {
    const onUpdate = vi.fn();
    const onDelete = vi.fn();
    const onMove = vi.fn();

    render(
      <Column
        title="To Do"
        status="todo"
        color="#3b82f6"
        tasks={mockTasks}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onMove={onMove}
        onDeleteColumn={vi.fn()}
        onEditColumn={vi.fn()}
        isDeletable={true}
      />
    );

    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  it('displays correct number of tasks in column', () => {
    const onUpdate = vi.fn();
    const onDelete = vi.fn();
    const onMove = vi.fn();

    render(
      <Column
        title="To Do"
        status="todo"
        color="#3b82f6"
        tasks={mockTasks}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onMove={onMove}
        onDeleteColumn={vi.fn()}
        onEditColumn={vi.fn()}
        isDeletable={true}
      />
    );

    // Should show 2 (tasks with status 'todo')
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('filters and displays only tasks with matching status', () => {
    const onUpdate = vi.fn();
    const onDelete = vi.fn();
    const onMove = vi.fn();

    render(
      <Column
        title="To Do"
        status="todo"
        color="#3b82f6"
        tasks={mockTasks}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onMove={onMove}
        onDeleteColumn={vi.fn()}
        onEditColumn={vi.fn()}
        isDeletable={true}
      />
    );

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.queryByText('Task 3')).not.toBeInTheDocument();
  });

  it('displays empty state when no tasks match status', () => {
    const onUpdate = vi.fn();
    const onDelete = vi.fn();
    const onMove = vi.fn();

    render(
      <Column
        title="Done"
        status="done"
        color="#22c55e"
        tasks={mockTasks}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onMove={onMove}
        onDeleteColumn={vi.fn()}
        onEditColumn={vi.fn()}
        isDeletable={true}
      />
    );

    expect(screen.getByText(/No tasks yet/i)).toBeInTheDocument();
  });

  it('renders with correct data-testid', () => {
    const onUpdate = vi.fn();
    const onDelete = vi.fn();
    const onMove = vi.fn();

    render(
      <Column
        title="To Do"
        status="todo"
        color="#3b82f6"
        tasks={mockTasks}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onMove={onMove}
        onDeleteColumn={vi.fn()}
        onEditColumn={vi.fn()}
        isDeletable={true}
      />
    );

    expect(screen.getByTestId('column-todo')).toBeInTheDocument();
  });
});
