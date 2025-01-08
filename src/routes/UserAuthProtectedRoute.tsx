// UserAuthProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../context/UserContext";
import LoadingScreen from "../components/LoadingScreen/LoadingScreen";

function UserAuthProtectedRoute() {
	const { user, loadingUser } = useUser();

	// Show loading screen while checking auth status
	if (loadingUser) {
		return <LoadingScreen />;
	}

	// If no user after loading, redirect to login
	if (!user) {
		return <Navigate to="/login" replace />;
	}

	// Otherwise, render the protected content
	return <Outlet />;
}

export default UserAuthProtectedRoute;
