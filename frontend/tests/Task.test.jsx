import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from './test-utils';
import { Task } from '../components/Task';

const mockTask = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  status: 'todo',
  priority: 'high',
  category: 'feature',
  attachments: [],
};

describe('Task Component', () => {
  it('renders task with correct title and description', () => {
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    render(<Task task={mockTask} onUpdate={onUpdate} onDelete={onDelete} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('displays priority and category badges', () => {
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    render(<Task task={mockTask} onUpdate={onUpdate} onDelete={onDelete} />);

    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('FEATURE')).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', () => {
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    render(<Task task={mockTask} onUpdate={onUpdate} onDelete={onDelete} />);

    const deleteButton = screen.getByTestId('delete-task-btn');
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('enters edit mode when edit button is clicked', () => {
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    render(<Task task={mockTask} onUpdate={onUpdate} onDelete={onDelete} />);

    const editButton = screen.getByTestId('edit-task-btn');
    fireEvent.click(editButton);

    expect(screen.getByTestId('task-title-input')).toBeInTheDocument();
    expect(screen.getByTestId('task-description-input')).toBeInTheDocument();
  });

  it('updates task when save button is clicked', async () => {
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    render(<Task task={mockTask} onUpdate={onUpdate} onDelete={onDelete} />);

    // Enter edit mode
    const editButton = screen.getByTestId('edit-task-btn');
    fireEvent.click(editButton);

    // Update title
    const titleInput = screen.getByTestId('task-title-input');
    fireEvent.change(titleInput, { target: { value: 'Updated Task' } });

    // Save changes
    const saveButton = screen.getByTestId('save-task-btn');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled();
      const updatedTask = onUpdate.mock.calls[0][0];
      expect(updatedTask.title).toBe('Updated Task');
    });
  });

  it('validates file upload type', async () => {
    const onUpdate = vi.fn();
    const onDelete = vi.fn();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<Task task={mockTask} onUpdate={onUpdate} onDelete={onDelete} />);

    // Enter edit mode
    const editButton = screen.getByTestId('edit-task-btn');
    fireEvent.click(editButton);

    // Try to upload invalid file
    const fileInput = screen.getByTestId('file-upload-input');
    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Invalid file type. Please upload an image or PDF.');
    });

    alertSpy.mockRestore();
  });

  it('handles valid image upload', async () => {
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    render(<Task task={mockTask} onUpdate={onUpdate} onDelete={onDelete} />);

    // Enter edit mode
    const editButton = screen.getByTestId('edit-task-btn');
    fireEvent.click(editButton);

    // Upload valid image
    const fileInput = screen.getByTestId('file-upload-input');
    const validFile = new File(['image content'], 'test.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled();
      const updatedTask = onUpdate.mock.calls[0][0];
      expect(updatedTask.attachments).toHaveLength(1);
      expect(updatedTask.attachments[0].name).toBe('test.png');
    }, { timeout: 3000 });
  });
});
