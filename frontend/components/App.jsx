import React, { Suspense } from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';

const KanbanBoard = React.lazy(() => import('./KanbanBoard').then(m => ({ default: m.KanbanBoard })));

function App() {
  return (
    <ThemeProvider>
      <Suspense fallback={<div style={{ padding: '20px' }}>Loading Kanban Board...</div>}>
        <KanbanBoard />
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
