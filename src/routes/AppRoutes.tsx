import { Routes, Route } from "react-router-dom";

// Pages
import HomePage from "../pages/HomePage/HomePage";
import LoginPage from "../pages/LoginPage/LoginPage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import AboutUs from "../pages/AboutUs/AboutUs";
import RequestResetPasswordPage from "../pages/RequestResetPasswordPage/RequestResetPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage/ResetPasswordPage";
import SignUpPage from "../pages/SignUpPage/SignUpPage";
import DashboardPage from "../pages/DashboardPage/DashboardPage";
import DiscussionsPage from "../pages/DiscussionsPage/DiscussionsPage";
import DiscussionDetailPage from "../pages/DiscussionDetailPage/DiscussionDetailPage";
import QuestionDetailPage from "../pages/QuestionDetailPage/QuestionDetailPage";
import ProfileEditPage from "../pages/ProfileEditPage/ProfileEditPage";
import AccessDiscussionPage from "../pages/AccessDiscussionPage/AccessDiscussionPage";
import AnswerQuestionnairePage from "../pages/AnswerQuestionnairePage/AnswerQuestionnairePage";

// Components
import MainAppLayout from "../components/Layouts/MainAppLayout/MainAppLayout";
import DashboardLayout from "../components/Layouts/DashboardLayout/DashboardLayout";

// Routes
import UserAuthProtectedRoute from "./UserAuthProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";

function AppRoutes() {
	return (
		<Routes>
			<Route element={<MainAppLayout />}>
				{/* Protected routes */}
				<Route element={<UserAuthProtectedRoute />}>
					<Route element={<DashboardLayout />}>
						<Route path="/dashboard" element={<DashboardPage />} />
						<Route path="/discussions" element={<DiscussionsPage />} />
						<Route path="/discussions/:id" element={<DiscussionDetailPage />} />
						<Route
							path="/discussions/:id/questions/:questionId"
							element={<QuestionDetailPage />}
						/>
						<Route path="/profile" element={<ProfileEditPage />} />
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
				<Route path="/reset-password" element={<ResetPasswordPage />} />
				<Route path="/about" element={<AboutUs />} />
				<Route path="/access" element={<AccessDiscussionPage />} />
				<Route path="/answer" element={<AnswerQuestionnairePage />} />

				<Route path="*" element={<NotFoundPage />} />
			</Route>
		</Routes>
	);
}

export default AppRoutes;
