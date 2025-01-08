import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../context/UserContext";
import LoadingScreen from "../components/LoadingScreen/LoadingScreen";

function PublicOnlyRoute() {
	const { user, loadingUser } = useUser();

	if (loadingUser) {
		return <LoadingScreen />;
	}

	if (user) {
		return <Navigate to="/discussions" replace />;
	}
	return <Outlet />;
}

export default PublicOnlyRoute;
