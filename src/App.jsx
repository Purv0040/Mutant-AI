import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import AskAI from './pages/AskAI'
import Summarization from './pages/Summarization'
import Categorization from './pages/Categorization'

function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/ask-ai" replace />} />
          <Route path="/ask-ai" element={<AskAI />} />
          <Route path="/summarization" element={<Summarization />} />
          <Route path="/categorization" element={<Categorization />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
