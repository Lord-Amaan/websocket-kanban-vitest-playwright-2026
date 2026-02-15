import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { useTheme } from '../contexts/ThemeContext';
import { Task } from './Task';

export const Column = ({ title, status, color, tasks, onUpdate, onDelete, onMove, onDeleteColumn, onEditColumn, isDeletable }) => {
  const { colors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [showMenu, setShowMenu] = useState(false);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item) => {
      if (item.status !== status) {
        onMove(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const columnTasks = tasks.filter((task) => task.status === status);

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      onEditColumn(status, editTitle, color);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setEditTitle(title);
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={drop}
      style={{
        flex: 1,
        minWidth: '300px',
        backgroundColor: isOver ? colors.bgTertiary : colors.bgSecondary,
        borderRadius: '8px',
        padding: '16px',
        border: isOver ? `2px dashed ${color || '#3b82f6'}` : `2px solid ${colors.border}`,
        transition: 'all 0.2s',
      }}
      data-testid={`column-${status}`}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          position: 'relative',
        }}
      >
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{
              fontSize: '18px',
              fontWeight: '700',
              color: colors.text,
              backgroundColor: colors.bgTertiary,
              border: `2px solid ${color || '#3b82f6'}`,
              borderRadius: '4px',
              padding: '4px 8px',
              outline: 'none',
              flex: 1,
              marginRight: '8px',
            }}
          />
        ) : (
          <h2 
            style={{ 
              margin: 0, 
              fontSize: '18px', 
              fontWeight: '700', 
              color: colors.text,
              flex: 1,
            }}
            onDoubleClick={() => setIsEditing(true)}
            title="Double-click to edit"
          >
            {title}
          </h2>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              backgroundColor: color || '#3b82f6',
              color: 'white',
              borderRadius: '12px',
              padding: '2px 8px',
              fontSize: '12px',
              fontWeight: '600',
            }}
          >
            {columnTasks.length}
          </span>

          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: colors.text,
              fontSize: '18px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.bgTertiary}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ⋮
          </button>

          {showMenu && (
            <>
              <div
                onClick={() => setShowMenu(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 999,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '35px',
                  right: '0',
                  backgroundColor: colors.bgSecondary,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  minWidth: '150px',
                }}
              >
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: colors.text,
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    borderRadius: '8px 8px 0 0',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.bgTertiary}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  ✏️ Edit Name
                </button>

                {isDeletable && (
                  <button
                    onClick={() => {
                      onDeleteColumn(status);
                      setShowMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      borderRadius: '0 0 8px 8px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    🗑️ Delete Column
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ minHeight: '200px' }}>
        {columnTasks.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '32px 16px',
              color: '#9ca3af',
              fontSize: '14px',
            }}
          >
            No tasks yet. Drag tasks here or create a new one.
          </div>
        ) : (
          columnTasks.map((task) => (
            <Task
              key={task.id}
              task={task}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};
