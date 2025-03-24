import { Routes, Route } from "react-router-dom";

// Pages
import HomePage from "../pages/HomePage/HomePage";
import LoginPage from "../pages/LoginPage/LoginPage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import RequestResetPasswordPage from "../pages/RequestResetPasswordPage/RequestResetPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage/ResetPasswordPage";
import SignUpPage from "../pages/SignUpPage/SignUpPage";
import DiscussionsPage from "../pages/DiscussionsPage/DiscussionsPage";
import DiscussionDetailPage from "../pages/DiscussionDetailPage/DiscussionDetailPage";
import QuestionDetailPage from "../pages/QuestionDetailPage/QuestionDetailPage";
import AccessDiscussionPage from "../pages/AccessDiscussionPage/AccessDiscussionPage";
import AnswerQuestionnairePage from "../pages/AnswerQuestionnairePage/AnswerQuestionnairePage";
import EmailVerificationPage from "../pages/EmailVerificationPage/EmailVerificationPage";

// Components
import MainAppLayout from "../components/Layouts/MainAppLayout/MainAppLayout";
import DashboardLayout from "../components/Layouts/DashboardLayout/DashboardLayout";

// Routes
import UserAuthProtectedRoute from "./UserAuthProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import AboutUsPage from "../pages/AboutUsPage/AboutUsPage";
function AppRoutes() {
	return (
		<Routes>
			<Route element={<MainAppLayout />}>
				{/* Protected routes */}
				<Route element={<UserAuthProtectedRoute />}>
					<Route element={<DashboardLayout />}>
						<Route path="/discussions" element={<DiscussionsPage />} />
						<Route path="/discussions/:id" element={<DiscussionDetailPage />} />
						<Route
							path="/discussions/:id/questions/:questionId"
							element={<QuestionDetailPage />}
						/>
					</Route>
				</Route>

				{/* Public-only routes */}
				<Route element={<PublicOnlyRoute />}>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/signup" element={<SignUpPage />} />
				</Route>

				{/* Public routes */}
				<Route path="/" element={<HomePage />} />
				<Route
					path="/request-reset-password"
					element={<RequestResetPasswordPage />}
				/>
				<Route
					path="/reset-password/:uidb64?/:token?"
					element={<ResetPasswordPage />}
				/>
				<Route path="/access" element={<AccessDiscussionPage />} />
				<Route path="/answer" element={<AnswerQuestionnairePage />} />
				<Route
					path="/verify-email/:uidb64/:token"
					element={<EmailVerificationPage />}
				/>
				<Route path="/about-us" element={<AboutUsPage />} />
				<Route path="*" element={<NotFoundPage />} />
			</Route>
		</Routes>
	);
}

export default AppRoutes;
