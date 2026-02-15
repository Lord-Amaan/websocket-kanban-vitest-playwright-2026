import { describe, it, expect } from 'vitest';
import { render, screen } from './test-utils';
import { TaskProgress } from '../components/TaskProgress';

const mockTasks = [
  { id: '1', status: 'todo', title: 'Task 1' },
  { id: '2', status: 'todo', title: 'Task 2' },
  { id: '3', status: 'inprogress', title: 'Task 3' },
  { id: '4', status: 'done', title: 'Task 4' },
  { id: '5', status: 'done', title: 'Task 5' },
  { id: '6', status: 'done', title: 'Task 6' },
];

describe('TaskProgress Component', () => {
  it('renders task progress dashboard', () => {
    render(<TaskProgress tasks={mockTasks} />);
    expect(screen.getByText('Task Progress Dashboard')).toBeInTheDocument();
  });

  it('displays correct task counts for each status', () => {
    render(<TaskProgress tasks={mockTasks} />);

    // Should show correct counts
    const todoCount = screen.getAllByText('2')[0]; // 2 tasks in todo
    const inProgressCount = screen.getAllByText('1')[0]; // 1 task in progress
    const doneCount = screen.getAllByText('3')[0]; // 3 tasks done

    expect(todoCount).toBeInTheDocument();
    expect(inProgressCount).toBeInTheDocument();
    expect(doneCount).toBeInTheDocument();
  });

  it('calculates completion percentage correctly', () => {
    render(<TaskProgress tasks={mockTasks} />);

    // 3 done out of 6 total = 50%
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('handles empty task list', () => {
    render(<TaskProgress tasks={[]} />);

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
  });

  it('updates when tasks change', () => {
    const { rerender } = render(<TaskProgress tasks={mockTasks} />);
    expect(screen.getByText('50%')).toBeInTheDocument();

    // Update with all tasks done
    const allDone = mockTasks.map(task => ({ ...task, status: 'done' }));
    rerender(<TaskProgress tasks={allDone} />);

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders chart container with correct test id', () => {
    render(<TaskProgress tasks={mockTasks} />);
    expect(screen.getByTestId('task-progress-chart')).toBeInTheDocument();
  });
});
