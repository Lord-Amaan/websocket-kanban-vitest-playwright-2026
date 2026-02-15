# WebSocket-Powered Kanban Board

A real-time Kanban board application built with React, WebSockets (Socket.IO), and comprehensive testing using Vitest and Playwright.

Before accessing the Kanban first invoke backend services from this Url : <a href="https://websocket-kanban-vitest-playwright-2026-wpss.onrender.com/">Backend</a>


## Features

- Real-time Updates: WebSocket-powered synchronization across multiple clients
- Kanban Workflow: Three columns (To Do, In Progress, Done)
- Drag & Drop: Move tasks between columns with React DnD
- Task Management: Create, update, delete tasks with priority and category
- File Attachments: Upload images and PDFs to tasks
- Progress Visualization: Interactive charts showing task distribution and completion
- Comprehensive Testing: Unit, integration, and E2E tests

## Project Structure

```
websocket-kanban-vitest-playwright/
├── backend/                      # Node.js + Express + Socket.IO server
│   ├── server.js                 # WebSocket server implementation
│   └── package.json              # Backend dependencies
│
├── frontend/                     # React application
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── KanbanBoard.jsx   # Main board component
│   │   │   ├── Column.jsx        # Column component with drop zone
│   │   │   ├── Task.jsx          # Task card with drag functionality
│   │   │   └── TaskProgress.jsx  # Progress chart component
│   │   ├── hooks/
│   │   │   └── useWebSocket.js   # WebSocket hook
│   │   ├── tests/
│   │   │   ├── unit/             # Unit tests (Vitest)
│   │   │   ├── integration/      # Integration tests (Vitest)
│   │   │   └── e2e/              # E2E tests (Playwright)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── playwright.config.js
│
└── README.md
```

## Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
npm start
```

The backend server will start on `http://localhost:3001`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

## Testing

### Unit & Integration Tests (Vitest)

```bash
cd frontend

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
cd frontend

# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific test file
npx playwright test src/tests/e2e/kanban.spec.js
```

## Test Coverage

### Unit Tests
- Task component rendering and interactions
- Column component filtering and display
- TaskProgress chart calculations and rendering
- File upload validation
- Priority and category selection

### Integration Tests
- WebSocket connection establishment
- Event listeners registration
- Task creation, update, move, and delete operations
- Real-time synchronization across clients
- KanbanBoard component integration

### E2E Tests
- Complete user workflows
- Task CRUD operations
- Drag and drop functionality
- Dropdown selections (priority, category)
- File upload and attachment management
- Real-time chart updates
- Form validation

## Key Features Explained

### WebSocket Implementation

The application uses Socket.IO for real-time bidirectional communication:

**Server Events:**
- `sync:tasks` - Send all tasks to newly connected clients
- `task:created` - Broadcast new task creation
- `task:updated` - Broadcast task updates
- `task:moved` - Broadcast task status changes
- `task:deleted` - Broadcast task deletion

**Client Events:**
- `task:create` - Create new task
- `task:update` - Update existing task
- `task:move` - Move task between columns
- `task:delete` - Delete task

### Drag & Drop

Using React DnD with HTML5 backend:
- Tasks are draggable between columns
- Visual feedback during drag operation
- Real-time updates broadcast to all clients

### File Attachments

- Supports image files (JPEG, PNG, GIF) and PDFs
- File type validation
- File size limit (5MB)
- Image preview in task cards
- Base64 encoding for storage (demo purposes)

### Progress Visualization

Using Recharts library:
- **Bar Chart**: Task distribution across statuses
- **Pie Chart**: Completion overview
- **Stat Cards**: Real-time counts for each status
- **Completion Percentage**: Overall progress tracking

## Configuration

### Backend Configuration

Edit `backend/server.js` to configure:
- Port (default: 3001)
- CORS settings
- Initial sample tasks

### Frontend Configuration

Edit `frontend/vite.config.js` for:
- Development server port
- Test configuration
- Build settings

Edit `frontend/playwright.config.js` for:
- E2E test settings
- Browser configurations
- Timeouts and retries

## WebSocket Flow

```
Client A                 Server                  Client B
   |                        |                        |
   |---- task:create ------>|                        |
   |                        |                        |
   |<--- task:created ------|---- task:created ----->|
   |                        |                        |
   |                        |<---- task:move --------|
   |                        |                        |
   |<---- task:moved -------|---- task:moved ------->|
```

## UI Components

### KanbanBoard
Main container component that:
- Manages WebSocket connection
- Handles new task creation form
- Displays connection status
- Renders columns and progress chart

### Column
Drop zone component that:
- Filters tasks by status
- Accepts dropped tasks
- Shows task count
- Provides visual feedback

### Task
Draggable card component featuring:
- Edit mode with inline form
- Priority and category badges
- File attachment display
- Delete and edit actions

### TaskProgress
Chart component showing:
- Task distribution bar chart
- Completion percentage pie chart
- Status-based stat cards
- Real-time updates

## Running the Full Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. In a new terminal, start the frontend:
```bash
cd frontend
npm run dev
```

3. Open multiple browser windows at `http://localhost:5173` to test real-time synchronization

4. Create, edit, move, and delete tasks - all changes will sync in real-time!

## Debugging

### WebSocket Connection Issues

Check browser console for connection status:
```javascript
// Should see:
Connected to WebSocket server
```

### Test Failures

For Vitest tests:
```bash
npm test -- --reporter=verbose
```

For Playwright tests:
```bash
npx playwright test --debug
```

## Development Notes

- The backend uses in-memory storage (tasks reset on server restart)
- For production, implement proper database (MongoDB recommended)
- File uploads use base64 encoding (for production, use cloud storage)
- WebSocket reconnection logic can be enhanced for production use

## Learning Resources

- [React DnD Documentation](https://react-dnd.github.io/react-dnd/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Recharts Documentation](https://recharts.org/)

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!

---

Built using React, Socket.IO, Vitest, and Playwright
