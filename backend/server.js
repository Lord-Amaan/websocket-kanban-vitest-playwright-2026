import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Task } from './models/Task.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors());
app.use(express.json());

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"], // Vite default and fallback ports
    methods: ["GET", "POST"]
  },
  maxHttpBufferSize: 50 * 1024 * 1024 // 50MB to support large image attachments
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kanban-board')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.error('Make sure MongoDB is running or MONGODB_URI is set in .env');
  });

// Initialize sample tasks if none exist
const initializeSampleTasks = async () => {
  try {
    const existingTasks = await Task.countDocuments();
    if (existingTasks === 0) {
      const sampleTasks = [
        {
          id: uuidv4(),
          title: 'Fix login issue',
          description: 'Users report auth fails on certain browsers',
          status: 'todo',
          priority: 'high',
          category: 'bug',
          attachments: [],
        },
        {
          id: uuidv4(),
          title: 'Add search functionality',
          description: 'Implement task search feature',
          status: 'inprogress',
          priority: 'medium',
          category: 'feature',
          attachments: [],
        },
        {
          id: uuidv4(),
          title: 'Update documentation',
          description: 'Update API docs and examples',
          status: 'done',
          priority: 'low',
          category: 'enhancement',
          attachments: [],
        },
      ];
      await Task.insertMany(sampleTasks);
      console.log('Sample tasks initialized');
    }
  } catch (error) {
    console.error('Error initializing sample tasks:', error);
  }
};

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Load tasks for new client
  (async () => {
    try {
      const tasks = await Task.find().sort({ createdAt: -1 });
      socket.emit('sync:tasks', tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      socket.emit('error', { message: 'Failed to fetch tasks' });
    }
  })();

  socket.on('error', (error) => {
    console.error(`Socket error: ${socket.id}`, error);
  });
socket.on('task:create', async (taskData) => {
  try {
    let attachments = [];
if (Array.isArray(taskData.attachments)) {
  attachments = taskData.attachments.map(att =>
    typeof att === 'string' ? att : att.url
  );
}


    const newTask = new Task({
      id: uuidv4(),
      title: taskData.title || 'Untitled Task',
      description: taskData.description || '',
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      category: taskData.category || 'feature',
      attachments: attachments,
    });

    await newTask.save();

    io.emit('task:created', newTask);
    console.log(`Task created: ${newTask.id}`);

  } catch (error) {
    console.error("CREATE ERROR:", error);
    socket.emit('error', {
      message: 'Failed to create task',
      error: error.message
    });
  }
});

socket.on('task:update', async (updateData) => {
  try {
    if (!updateData || !updateData.id) {
      socket.emit('error', { message: 'Invalid task data' });
      return;
    }

    const task = await Task.findOne({ id: updateData.id });

    if (!task) {
      socket.emit('error', { message: 'Task not found' });
      return;
    }

    // ---- Update fields safely ----
    task.title = updateData.title ?? task.title;
    task.description = updateData.description ?? task.description;
    task.status = updateData.status ?? task.status;
    task.priority = updateData.priority ?? task.priority;
    task.category = updateData.category ?? task.category;

    // ---- FIXED ATTACHMENTS HANDLING ----
    if (updateData.attachments !== undefined) {
      if (Array.isArray(updateData.attachments)) {
        task.attachments = updateData.attachments.map(att =>
          typeof att === 'string' ? att : att.url
        );
      } else {
        console.warn("Attachments received as non-array. Ignored.");
      }
    }

    await task.save();

    io.emit('task:updated', task);
    console.log(`Task updated: ${task.id}`);

  } catch (error) {
    console.error('Error updating task:', error);
    socket.emit('error', {
      message: 'Failed to update task',
      error: error.message
    });
  }
});


  socket.on('task:move', async (moveData) => {
    try {
      const task = await Task.findOne({ id: moveData.id });
      
      if (!task) {
        socket.emit('error', { message: 'Task not found' });
        return;
      }

      task.status = moveData.status;
      await task.save();

      io.emit('task:moved', {
        id: moveData.id,
        status: moveData.status,
        task: task
      });
      console.log(`Task moved: ${moveData.id} to ${moveData.status}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to move task', error: error.message });
    }
  });

  socket.on('task:delete', async (taskId) => {
    try {
      const task = await Task.findOneAndDelete({ id: taskId });
      
      if (!task) {
        socket.emit('error', { message: 'Task not found' });
        return;
      }

      io.emit('task:deleted', taskId);
      console.log(`Task deleted: ${taskId}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to delete task', error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const taskCount = await Task.countDocuments();
    res.json({ status: 'OK', tasks: taskCount, database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', database: 'disconnected' });
  }
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeSampleTasks();
});

export { app, server, io };

