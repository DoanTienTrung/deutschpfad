import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import OAuth2CallbackPage from './pages/OAuth2CallbackPage'
import ProfilePage from './pages/ProfilePage'
import AccountPage from './pages/AccountPage'
import AppLayout from './components/AppLayout'
import AdminLayout from './components/admin/AdminLayout'
import AdminTopicsPage from './pages/admin/AdminTopicsPage'
import AdminLessonsPage from './pages/admin/AdminLessonsPage'
import AdminVocabularyPage from './pages/admin/AdminVocabularyPage'
import DecksPage from './pages/DecksPage'
import DeckDetailPage from './pages/DeckDetailPage'
import LandingPage from './pages/LandingPage'
import VocabularyHubPage from './pages/VocabularyHubPage'
import PracticePage from './pages/PracticePage'
import ListeningHubPage from './pages/ListeningHubPage'
import ListeningPracticePage from './pages/ListeningPracticePage'
import AdminListeningPage from './pages/admin/AdminListeningPage'
import UserListeningHubPage from './pages/UserListeningHubPage'
import UserListeningPracticePage from './pages/UserListeningPracticePage'
import SpeakingHubPage from './pages/SpeakingHubPage'
import SpeakingPracticePage from './pages/SpeakingPracticePage'
import AdminSpeakingPage from './pages/admin/AdminSpeakingPage'


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute requiredRole="USER">
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ProfilePage />} />
            <Route path="profile" element={<AccountPage />} />
            <Route path="decks" element={<DecksPage />} />
            <Route path="decks/:deckId" element={<DeckDetailPage />} />
            <Route path="vocabulary" element={<VocabularyHubPage />} />
            <Route path="practice/:lessonId" element={<PracticePage />} />
            <Route path="listening" element={<ListeningHubPage />} />
            <Route path="listening/mine" element={<UserListeningHubPage />} />
            <Route path="listening/mine/:itemId" element={<UserListeningPracticePage />} />
            <Route path="listening/:exerciseId" element={<ListeningPracticePage />} />
            <Route path="speaking" element={<SpeakingHubPage />} />
            <Route path="speaking/:promptId" element={<SpeakingPracticePage />} />
          </Route>
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="vocabulary" element={<AdminVocabularyPage />} />
            <Route path="topics" element={<AdminTopicsPage />} />
            <Route path="lessons" element={<AdminLessonsPage />} />
            <Route path="listening" element={<AdminListeningPage />} />
            <Route path="speaking" element={<AdminSpeakingPage />} />
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
