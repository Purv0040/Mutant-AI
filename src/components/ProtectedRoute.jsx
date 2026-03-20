import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Wraps a route and redirects to /login if there is no valid token.
 * Usage:
 *   <Route path="/ask-ai" element={<ProtectedRoute><AskAI /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}
