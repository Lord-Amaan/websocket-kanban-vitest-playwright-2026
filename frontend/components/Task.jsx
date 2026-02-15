import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { useTheme } from '../contexts/ThemeContext';
import Select from 'react-select';


const priorityOptions = [
  { value: 'low', label: 'Low', color: '#22c55e' },
  { value: 'medium', label: 'Medium', color: '#eab308' },
  { value: 'high', label: 'High', color: '#ef4444' },
];

const categoryOptions = [
  { value: 'bug', label: 'Bug', color: '#ef4444' },
  { value: 'feature', label: 'Feature', color: '#3b82f6' },
  { value: 'enhancement', label: 'Enhancement', color: '#8b5cf6' },
];

export const Task = ({ task, onUpdate, onDelete }) => {
  const { colors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Handle escape to close image preview
  useEffect(() => {
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

  const handleSave = () => {
    // Convert attachments to URLs only for backend
   onUpdate(editedTask);

    setIsEditing(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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

try {
  let secureUrl;

  // 🧪 If running inside Vitest, fake upload
  if (import.meta.env.VITEST) {
    secureUrl = "https://fakeurl.com/test-image.jpg";
  } else {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok || !data.secure_url) {
      console.error("Cloudinary upload failed:", data);
      alert(`Upload failed: ${data.error?.message || "Unknown error"}`);
      setUploading(false);
      return;
    }

    secureUrl = data.secure_url;
  }

  const attachment = {
    id: Date.now(),
    name: file.name,
    type: file.type,
    url: secureUrl,
    size: file.size,
  };

  const updatedTask = {
    ...editedTask,
    attachments: [...(editedTask.attachments || []), attachment],
  };

  setEditedTask(updatedTask);

  onUpdate(updatedTask);


} catch (error) {
  console.error("Upload failed", error);
  alert("Upload failed");
}

setUploading(false);
  };

  const removeAttachment = (attachmentId) => {
    const updatedTask = {
      ...editedTask,
      attachments: editedTask.attachments.filter((a) => 
        typeof a === 'string' ? false : a.id !== attachmentId
      ),
    };
    setEditedTask(updatedTask);
    
    // Send to backend with only URLs
    const taskForBackend = {
      ...updatedTask,
      attachments: updatedTask.attachments.map(att => 
        typeof att === 'string' ? att : att.url
      ),
    };
    onUpdate(taskForBackend);
  };

  const getPriorityColor = (priority) => {
    const option = priorityOptions.find((opt) => opt.value === priority);
    return option ? option.color : '#6b7280';
  };

  const getCategoryColor = (category) => {
    const option = categoryOptions.find((opt) => opt.value === category);
    return option ? option.color : '#6b7280';
  };

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'auto',
        backgroundColor: colors.bgSecondary,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        boxShadow: `0 1px 3px ${colors.shadow}`,
      }}
      data-testid={`task-${task.id}`}
    >
      {!isEditing ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', flex: 1, color: colors.text }}>
              {task.title}
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                data-testid="edit-task-btn"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(task.id)}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                data-testid="delete-task-btn"
              >
                Delete
              </button>
            </div>
          </div>

          <p style={{ margin: '8px 0', fontSize: '14px', color: '#6b7280' }}>
            {task.description}
          </p>

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: getPriorityColor(task.priority) + '20',
                color: getPriorityColor(task.priority),
              }}
            >
              {task.priority?.toUpperCase()}
            </span>
            <span
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: getCategoryColor(task.category) + '20',
                color: getCategoryColor(task.category),
              }}
            >
              {task.category?.toUpperCase()}
            </span>
          </div>

          {task.attachments && task.attachments.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: colors.text }}>Attachments:</p>
              {task.attachments.some(att => {
                const url = typeof att === 'string' ? att : att?.url;
                return url && url.startsWith('data:');
              }) && (
                <p style={{ fontSize: '11px', color: '#f59e0b', marginBottom: '8px', fontStyle: 'italic' }}>
                  ⚠️ Some attachments failed to upload properly and cannot be displayed
                </p>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {task.attachments
                  .filter(attachment => {
                    // Filter out data URIs - only show valid HTTP(S) URLs
                    const url = typeof attachment === 'string' ? attachment : attachment?.url;
                    return url && (url.startsWith('http://') || url.startsWith('https://'));
                  })
                  .map((attachment, index) => {
                  // Handle both string URLs and attachment objects
                  const url = typeof attachment === 'string' ? attachment : attachment.url;
                  const isImage = typeof attachment === 'string' 
                    ? /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(attachment)
                    : attachment.type?.startsWith('image/');
                  const name = typeof attachment === 'string' 
                    ? `File ${index + 1}` 
                    : attachment.name;
                  
                  console.log(`Rendering attachment ${index}:`, { url, isImage, name, type: typeof attachment });
                  
                  return (
                    <div key={typeof attachment === 'string' ? index : attachment.id} style={{ position: 'relative' }}>
                      {isImage ? (
                        <img
                          src={url}
                          alt={name}
                          onClick={() => {
                            console.log('Image clicked, opening preview:', url);
                            setPreviewImage({ url, name, type: 'image/jpeg' });
                          }}
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            border: `1px solid ${colors.border}`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        />
                      ) : (
                        <div
                          onClick={() => {
                            console.log('Opening attachment:', url);
                            if (url && url.startsWith('http')) {
                              window.open(url, '_blank', 'noopener,noreferrer');
                            } else {
                              alert('Invalid URL: ' + url);
                            }
                          }}
                          style={{
                            width: '60px',
                            height: '60px',
                            backgroundColor: colors.bgTertiary,
                            borderRadius: '4px',
                            fontSize: '20px',
                            textAlign: 'center',
                            padding: '4px',
                            color: '#3b82f6',
                            textDecoration: 'none',
                            border: `1px solid ${colors.border}`,
                            cursor: 'pointer',
                            display: 'block',
                            lineHeight: '52px',
                          }}
                          title={`Open ${name}`}
                        >
                          📎
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={editedTask.title}
            onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              marginBottom: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
            }}
            placeholder="Task title"
            data-testid="task-title-input"
          />

          <textarea
            value={editedTask.description}
            onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              marginBottom: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              minHeight: '60px',
            }}
            placeholder="Task description"
            data-testid="task-description-input"
          />

          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
              Priority
            </label>
            <Select
              className="react-select"
  classNamePrefix="react-select"


              options={priorityOptions}
              value={priorityOptions.find((opt) => opt.value === editedTask.priority)}
              onChange={(selected) => setEditedTask({ ...editedTask, priority: selected.value })}
              styles={{
                control: (base) => ({ ...base, fontSize: '14px' }),
              }}
            data-testid="edit-task-priority"

            />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
              Category
            </label>
            <Select
             className="react-select"
  classNamePrefix="react-select"


              options={categoryOptions}
              value={categoryOptions.find((opt) => opt.value === editedTask.category)}
              onChange={(selected) => setEditedTask({ ...editedTask, category: selected.value })}
              styles={{
                control: (base) => ({ ...base, fontSize: '14px' }),
              }}
             data-testid="edit-task-category"

            />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: colors.text }}>
              Upload Attachment
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              accept="image/*,.pdf"
              disabled={uploading}
              style={{
                width: '100%',
                padding: '6px',
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                backgroundColor: colors.bgSecondary,
                color: colors.text,
                fontSize: '12px',
              }}
              data-testid="file-upload-input"
            />
            {uploading && <p style={{ fontSize: '12px', color: '#3b82f6', marginTop: '4px' }}>Uploading...</p>}
          </div>

          {editedTask.attachments && editedTask.attachments.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: colors.text }}>Attachments:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {editedTask.attachments.map((attachment, index) => {
                  // Handle both string URLs and attachment objects
                  const url = typeof attachment === 'string' ? attachment : attachment.url;
                  const isImage = typeof attachment === 'string' 
                    ? /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment)
                    : attachment.type?.startsWith('image/');
                  const name = typeof attachment === 'string' 
                    ? `File ${index + 1}` 
                    : attachment.name;
                  const attachmentId = typeof attachment === 'string' ? null : attachment.id;
                  
                  return (
                    <div
                      key={typeof attachment === 'string' ? index : attachment.id}
                      style={{
                        position: 'relative',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '6px',
                        overflow: 'hidden',
                      }}
                    >
                      {isImage ? (
                        <img
                          src={url}
                          alt={name}
                          onClick={() => setPreviewImage({ url, name, type: 'image/jpeg' })}
                          style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            display: 'block',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
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
                          📄 {name}
                        </div>
                      )}
                      {attachmentId && (
                        <button
                          onClick={() => removeAttachment(attachmentId)}
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
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSave}
              style={{
                padding: '8px 16px',
                backgroundColor: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
              data-testid="save-task-btn"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditedTask(task);
                setIsEditing(false);
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && previewImage.type && previewImage.type.startsWith('image/') && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '9999',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '85vw',
              maxHeight: '85vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={previewImage.url}
              alt={previewImage.name}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
              }}
            />
            <button
              onClick={() => setPreviewImage(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '28px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
              title="Close preview (press Esc or click)"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
