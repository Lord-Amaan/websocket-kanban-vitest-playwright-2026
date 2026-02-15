import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useWebSocket } from '../hooks/useWebSocket';
import { useTheme } from '../contexts/ThemeContext';
import { Column } from './Column';
import { TaskProgress } from './TaskProgress';
import Select from 'react-select';

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const categoryOptions = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature' },
  { value: 'enhancement', label: 'Enhancement' },
];

export const KanbanBoard = () => {
  try {
    const { isConnected, isLoading, tasks, createTask, updateTask, moveTask, deleteTask } = useWebSocket();
    const { isDark, toggleTheme, colors } = useTheme();
    
    const [showNewTaskForm, setShowNewTaskForm] = useState(false);
    const [newTask, setNewTask] = useState({
      title: '',
      description: '',
      priority: 'medium',
      category: 'feature',
      status: 'todo',
      attachments: [],
    });
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [columns, setColumns] = useState([
      { id: 'todo', title: 'To Do', color: '#3b82f6' },
      { id: 'inprogress', title: 'In Progress', color: '#f59e0b' },
      { id: 'done', title: 'Done', color: '#22c55e' },
    ]);
    const [showColumnForm, setShowColumnForm] = useState(false);
    const [newColumn, setNewColumn] = useState({ title: '', color: '#8b5cf6' });

    // Handle ESC key to close preview
    React.useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && previewImage) {
          setPreviewImage(null);
        }
      };

      if (previewImage) {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
      }
    }, [previewImage]);

    const handleAddColumn = () => {
      if (!newColumn.title.trim()) {
        alert('Please enter a column name');
        return;
      }

      const columnId = newColumn.title.toLowerCase().replace(/\s+/g, '-');
      
      // Check if column already exists
      if (columns.find(col => col.id === columnId)) {
        alert('A column with this name already exists');
        return;
      }

      setColumns([...columns, {
        id: columnId,
        title: newColumn.title,
        color: newColumn.color,
      }]);

      setNewColumn({ title: '', color: '#8b5cf6' });
      setShowColumnForm(false);
    };

    const handleDeleteColumn = (columnId) => {
      // Prevent deleting if there are tasks in this column
      const tasksInColumn = tasks.filter(t => t.status === columnId);
      if (tasksInColumn.length > 0) {
        alert(`Cannot delete column with ${tasksInColumn.length} task(s). Move or delete tasks first.`);
        return;
      }

      if (columns.length <= 1) {
        alert('Cannot delete the last column');
        return;
      }

      if (confirm(`Delete column "${columns.find(c => c.id === columnId)?.title}"?`)) {
        setColumns(columns.filter(col => col.id !== columnId));
      }
    };

    const handleEditColumn = (columnId, newTitle, newColor) => {
      setColumns(columns.map(col => 
        col.id === columnId 
          ? { ...col, title: newTitle, color: newColor }
          : col
      ));
    };

    // ✅ FIXED: Upload to Cloudinary instead of base64
    const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Invalid file type. Please upload an image or PDF.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setUploading(true);

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_UPLOAD_PRESET);

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/auto/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        const data = await response.json();

        if (!response.ok || !data.secure_url) {
          console.error('Cloudinary upload failed:', data);
          alert(`Upload failed: ${data.error?.message || 'Unknown error'}`);
          setUploading(false);
          return;
        }

        console.log('✅ Cloudinary upload successful:', data.secure_url);

        // Store the Cloudinary URL
        const attachment = {
          id: Date.now(),
          name: file.name,
          type: file.type,
          url: data.secure_url, // ✅ Cloudinary URL, not base64!
          size: file.size,
        };

        setNewTask({
          ...newTask,
          attachments: [...(newTask.attachments || []), attachment],
        });

      } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload failed. Please try again.');
      }

      setUploading(false);
    };

    const removeAttachment = (attachmentId) => {
      setNewTask({
        ...newTask,
        attachments: newTask.attachments.filter((a) => a.id !== attachmentId),
      });
    };

    const handleCreateTask = () => {
      if (!newTask.title.trim()) {
        alert('Please enter a task title');
        return;
      }

      // Extract only the URLs from attachments for backend
      const taskData = {
        ...newTask,
        attachments: newTask.attachments.map(att => att.url), // ✅ Send only URLs
      };

      console.log('Creating task with data:', taskData);
      createTask(taskData);
      
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        category: 'feature',
        status: 'todo',
        attachments: [],
      });
      setShowNewTaskForm(false);
    };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ padding: '24px', backgroundColor: colors.bg, minHeight: '100vh', color: colors.text }}>
        {/* Header */}
        <div
          style={{
            backgroundColor: colors.bgSecondary,
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: `0 1px 3px ${colors.shadow}`,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700', color: colors.text }}>
                Kanban Board
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: isConnected ? '#22c55e' : '#ef4444',
                  }}
                />
                <span style={{ fontSize: '14px', color: colors.textSecondary }}>
                  {isConnected ? 'Connected to server' : 'Disconnected from server'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={toggleTheme}
                style={{
                  padding: '12px 16px',
                  backgroundColor: colors.bgTertiary,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  fontSize: '18px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                }}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
              {isDark ? '☀️' : '🌙'}

              </button>

              <button
                onClick={() => setShowColumnForm(!showColumnForm)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(139,92,246,0.3)',
                }}
              >
                {showColumnForm ? 'Cancel' : 'Create Column'}
              </button>

              <button
                onClick={() => setShowNewTaskForm(!showNewTaskForm)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(59,130,246,0.3)',
                }}
                data-testid="new-task-btn"
              >
                {showNewTaskForm ? 'Cancel' : '+ New Task'}
              </button>
            </div>
          </div>

          {showNewTaskForm && (
            <div
              style={{
                marginTop: '24px',
                padding: '20px',
                backgroundColor: colors.bgTertiary,
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
              }}
              data-testid="new-task-form"
            >
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: colors.text }}>
                Create New Task
              </h3>

              <input
                type="text"
                placeholder="Task title *"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: colors.bgSecondary,
                  color: colors.text,
                }}
                data-testid="new-task-title"
              />

              <textarea
                placeholder="Task description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  minHeight: '80px',
                  resize: 'vertical',
                  backgroundColor: colors.bgSecondary,
                  color: colors.text,
                }}
                data-testid="new-task-description"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: colors.text }}>
                    Status
                  </label>
                  <Select
                    className="react-select"
  classNamePrefix="react-select"
                    options={columns.map(col => ({ value: col.id, label: col.title }))}
                    value={{ value: newTask.status, label: columns.find(c => c.id === newTask.status)?.title || 'To Do' }}
                    onChange={(selected) => setNewTask({ ...newTask, status: selected.value })}
                    styles={{
                      control: (base) => ({
                        ...base,
                        fontSize: '14px',
                        backgroundColor: colors.bgSecondary,
                        borderColor: colors.border,
                        color: colors.text,
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: colors.bgSecondary,
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected ? '#3b82f6' : colors.bgSecondary,
                        color: state.isSelected ? 'white' : colors.text,
                        cursor: 'pointer',
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: colors.text,
                      }),
                    }}
                    data-testid="new-task-status"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: colors.text }}>
                    Priority
                  </label>
                  <Select
                    className="react-select"
  classNamePrefix="react-select"
                    options={priorityOptions}
                    value={priorityOptions.find((opt) => opt.value === newTask.priority)}
                    onChange={(selected) => setNewTask({ ...newTask, priority: selected.value })}
                    styles={{
                      control: (base) => ({
                        ...base,
                        fontSize: '14px',
                        backgroundColor: colors.bgSecondary,
                        borderColor: colors.border,
                        color: colors.text,
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: colors.bgSecondary,
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected ? '#3b82f6' : colors.bgSecondary,
                        color: state.isSelected ? 'white' : colors.text,
                        cursor: 'pointer',
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: colors.text,
                      }),
                    }}
                    data-testid="new-task-priority"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: colors.text }}>
                    Category
                  </label>
                  <Select
                    className="react-select"
  classNamePrefix="react-select"
                    options={categoryOptions}
                    value={categoryOptions.find((opt) => opt.value === newTask.category)}
                    onChange={(selected) => setNewTask({ ...newTask, category: selected.value })}
                    styles={{
                      control: (base) => ({
                        ...base,
                        fontSize: '14px',
                        backgroundColor: colors.bgSecondary,
                        borderColor: colors.border,
                        color: colors.text,
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: colors.bgSecondary,
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected ? '#3b82f6' : colors.bgSecondary,
                        color: state.isSelected ? 'white' : colors.text,
                        cursor: 'pointer',
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: colors.text,
                      }),
                    }}
                    data-testid="new-task-category"
                  />
                </div>
              </div>

              {/* File Upload */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: colors.text }}>
                  Upload Attachment
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept="image/*,.pdf"
                  disabled={uploading}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '6px',
                    backgroundColor: colors.bgSecondary,
                    color: colors.text,
                    fontSize: '12px',
                  }}
                />
                {uploading && (
                  <p style={{ fontSize: '12px', color: '#3b82f6', marginTop: '4px' }}>Uploading to Cloudinary...</p>
                )}
              </div>

              {/* Show attachments if any */}
              {newTask.attachments && newTask.attachments.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: colors.text }}>
                    Attachments:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {newTask.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        style={{
                          position: 'relative',
                          border: `1px solid ${colors.border}`,
                          borderRadius: '6px',
                          overflow: 'hidden',
                        }}
                      >
                        {attachment.type.startsWith('image/') ? (
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            onClick={() => setPreviewImage({ url: attachment.url, name: attachment.name })}
                            style={{
                              width: '80px',
                              height: '80px',
                              objectFit: 'cover',
                              borderRadius: '6px',
                              display: 'block',
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          />
                        ) : (
                          <div
                            style={{
                              width: '80px',
                              height: '80px',
                              backgroundColor: colors.bgTertiary,
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '9px',
                              textAlign: 'center',
                              padding: '4px',
                              color: colors.text,
                              wordBreak: 'break-word',
                            }}
                          >
                            📄 {attachment.name}
                          </div>
                        )}
                        <button
                          onClick={() => removeAttachment(attachment.id)}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Remove attachment"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleCreateTask}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
                data-testid="create-task-btn"
              >
                Create Task
              </button>
            </div>
          )}

          {showColumnForm && (
            <div
              style={{
                marginTop: '24px',
                padding: '20px',
                backgroundColor: colors.bgTertiary,
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
              }}
            >
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: colors.text }}>
                Create New Column
              </h3>

              <input
                type="text"
                placeholder="Column name *"
                value={newColumn.title}
                onChange={(e) => setNewColumn({ ...newColumn, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: colors.bgSecondary,
                  color: colors.text,
                }}
              />

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: colors.text }}>
                  Column Color
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'].map(color => (
                    <div
                      key={color}
                      onClick={() => setNewColumn({ ...newColumn, color })}
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: color,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: newColumn.color === color ? '3px solid white' : '2px solid transparent',
                        boxShadow: newColumn.color === color ? '0 0 0 2px ' + color : 'none',
                        transition: 'all 0.2s',
                      }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleAddColumn}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Create Column
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {!isConnected && (
          <div
            style={{
              textAlign: 'center',
              padding: '48px',
              backgroundColor: 'white',
              borderRadius: '8px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                margin: '0 auto 16px',
                animation: 'spin 1s linear infinite',
              }}
            />
            <p style={{ color: '#6b7280', fontSize: '16px' }}>Connecting to server...</p>
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && isConnected && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
              backgroundColor: colors.bgSecondary,
              borderRadius: '8px',
              marginBottom: '24px',
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  border: `4px solid ${colors.border}`,
                  borderTop: '4px solid #3b82f6',
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <p style={{ fontSize: '16px', fontWeight: '600', color: colors.text, margin: '0' }}>
                Syncing tasks from server...
              </p>
              <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '4px 0 0 0' }}>
                Please wait
              </p>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          </div>
        )}

        {/* Kanban Columns */}
        {isConnected && !isLoading && (
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '24px',
              overflowX: 'auto',
              paddingBottom: '8px',
            }}
          >
            {columns.map((column) => (
              <Column
                key={column.id}
                title={column.title}
                status={column.id}
                color={column.color}
                tasks={tasks}
                onUpdate={updateTask}
                onDelete={deleteTask}
                onMove={moveTask}
                onDeleteColumn={handleDeleteColumn}
                onEditColumn={handleEditColumn}
                isDeletable={columns.length > 1}
              />
            ))}
          </div>
        )}

        {/* Task Progress  */}
      {isConnected && tasks.length > 0 && (
  <TaskProgress tasks={tasks} />
)}


        {/* Image Preview Modal */}
        {previewImage && (
          <div
            onClick={() => setPreviewImage(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              cursor: 'pointer',
              padding: '40px',
            }}
          >
            <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
              <img
                src={previewImage.url}
                alt={previewImage.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '90vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={() => setPreviewImage(null)}
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  color: 'black',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                ×
              </button>
              <p
                style={{
                  position: 'absolute',
                  bottom: '-35px',
                  left: '0',
                  right: '0',
                  textAlign: 'center',
                  color: 'white',
                  fontSize: '14px',
                  margin: 0,
                }}
              >
                {previewImage.name}
              </p>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
  } catch (error) {
    console.error('KanbanBoard Error:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Error in KanbanBoard</h2>
        <p>{error?.message}</p>
      </div>
    );
  }
};
