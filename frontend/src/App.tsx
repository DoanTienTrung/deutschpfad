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
import ReviewPage from './pages/ReviewPage'
import NotFoundPage from './pages/NotFoundPage'
import AccountPage from './pages/AccountPage'
import AppLayout from './components/AppLayout'
import AdminLayout from './components/admin/AdminLayout'
import AdminTopicsPage from './pages/admin/AdminTopicsPage'
import AdminLessonsPage from './pages/admin/AdminLessonsPage'
import AdminVocabularyPage from './pages/admin/AdminVocabularyPage'
import DecksPage from './pages/DecksPage'
import DeckDetailPage from './pages/DeckDetailPage'
import DeckPracticePage from './pages/DeckPracticePage'
import LandingPage from './pages/LandingPage'
import VocabularyHubPage from './pages/VocabularyHubPage'
import PracticePage from './pages/PracticePage'
import ListeningHubPage from './pages/ListeningHubPage'
import ListeningYoutubePage from './pages/ListeningYoutubePage'
import ListeningExamPage from './pages/ListeningExamPage'
import ListeningPracticePage from './pages/ListeningPracticePage'
import AdminListeningPage from './pages/admin/AdminListeningPage'
import AdminSpeakingPage from './pages/admin/AdminSpeakingPage'
import ReadingHubPage from './pages/ReadingHubPage'
import ReadingExamPage from './pages/ReadingExamPage'
import ReadingArticlesPage from './pages/ReadingArticlesPage'
import ReadingPracticePage from './pages/ReadingPracticePage'
import UserReadingHubPage from './pages/UserReadingHubPage'
import AdminReadingPage from './pages/admin/AdminReadingPage'
import ComingSoonPage from './pages/ComingSoonPage'
import AdminTutorKnowledgePage from './pages/admin/AdminTutorKnowledgePage'
import GrammarHubPage from './pages/GrammarHubPage'
import GrammarTopicPage from './pages/GrammarTopicPage'
import GrammarReferencePage from './pages/GrammarReferencePage'
import AdminGrammarPage from './pages/admin/AdminGrammarPage'


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
            <Route path="review" element={<ReviewPage />} />
            <Route path="profile" element={<AccountPage />} />
            <Route path="decks" element={<DecksPage />} />
            <Route path="decks/:deckId" element={<DeckDetailPage />} />
            <Route path="decks/:deckId/practice" element={<DeckPracticePage />} />
            <Route path="vocabulary" element={<VocabularyHubPage />} />
            <Route path="practice/:lessonId" element={<PracticePage />} />
            <Route path="listening" element={<ListeningHubPage />} />
            <Route path="listening/youtube" element={<ListeningYoutubePage />} />
            <Route path="listening/exam" element={<ListeningExamPage />} />
            {/* Nói + Video của tôi chưa hoàn thiện -- chặn tạm bằng ComingSoonPage, đổi lại
                <UserListeningHubPage />/<SpeakingHubPage />... khi xong. */}
            <Route path="listening/mine" element={<ComingSoonPage title="Video của tôi" icon="🎬" />} />
            <Route path="listening/mine/:itemId" element={<ComingSoonPage title="Video của tôi" icon="🎬" />} />
            <Route path="listening/:exerciseId" element={<ListeningPracticePage />} />
            <Route path="speaking" element={<ComingSoonPage title="Luyện nói" icon="🎤" />} />
            <Route path="speaking/:promptId" element={<ComingSoonPage title="Luyện nói" icon="🎤" />} />
            <Route path="grammar" element={<GrammarHubPage />} />
            {/* Đặt trước grammar/:slug — "reference" là slug cấm ở backend nên không đụng nhau. */}
            <Route path="grammar/reference" element={<GrammarReferencePage />} />
            <Route path="grammar/:slug" element={<GrammarTopicPage />} />
            <Route path="reading" element={<ReadingHubPage />} />
            <Route path="reading/exam" element={<ReadingExamPage />} />
            <Route path="reading/articles" element={<ReadingArticlesPage />} />
            <Route path="reading/mine" element={<UserReadingHubPage />} />
            <Route path="reading/:passageId" element={<ReadingPracticePage />} />
            <Route path="reading/:passageId" element={<ReadingPracticePage />} />
            <Route path="*" element={<NotFoundPage />} />
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
            <Route path="reading" element={<AdminReadingPage />} />
            <Route path="grammar" element={<AdminGrammarPage />} />
            <Route path="tutor-knowledge" element={<AdminTutorKnowledgePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Bắt mọi đường dẫn còn lại. Phải đứng cuối cùng. */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
