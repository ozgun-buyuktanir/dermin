import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ResultsPage from './pages/ResultsPage'
import AnalysesPage from './pages/AnalysesPage'
import ChatPage from './pages/ChatPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/results/:analysisId" element={<ResultsPage />} />
        <Route path="/analyses" element={<AnalysesPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:analysisId" element={<ChatPage />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

export default App