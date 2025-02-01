import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCsrf } from "./CsrfProvider";
import { useEffect } from "react";

interface User {
	email: string;
	firstName: string;
	lastName: string;
}

// Define the UserContextProps interface
interface UserContextProps {
	user: User | null;
	loadingUser: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
}

// Create the UserContext
const UserContext = createContext<UserContextProps>({
	user: null,
	loadingUser: true,
	login: async () => {},
	logout: () => {},
});

// Create the UserProvider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [loadingUser, setLoadingUser] = useState(true);

	const navigate = useNavigate();
	const { csrfToken, reloadCsrf } = useCsrf();

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const res = await axios.get("/api/users/whoami", {
					withCredentials: true,
				});
				if (!res.data.email) {
					setUser(null);
				} else {
					setUser({
						email: res.data.email,
						firstName: res.data.first_name,
						lastName: res.data.last_name,
					});
				}
			} catch (error) {
				setUser(null);
			} finally {
				setLoadingUser(false);
			}
		};

		checkAuth();
	}, []);

	// Simple login method
	const login = async (email: string, password: string) => {
		setLoadingUser(true); // Set loading before the request
		try {
			const res = await axios.post(
				"/api/users/user_login/",
				{ email, password },
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);

			const whoamiResponse = await axios.get("/api/users/whoami", {
				withCredentials: true,
			});

			// Reload CSRF token before updating user state
			await reloadCsrf();
			console.log("login response data:", res.data);

			setUser({
				email: whoamiResponse.data.email,
				firstName: whoamiResponse.data.first_name,
				lastName: whoamiResponse.data.last_name,
			});
		} finally {
			setLoadingUser(false);
		}
	};

	console.log(user);

	// Simple logout method
	const logout = async () => {
		setLoadingUser(true);
		try {
			await axios.post(
				"/api/users/user_logout/",
				{},
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);
			navigate("/", { replace: true });
			setUser(null);
		} finally {
			setLoadingUser(false);
		}
	};

	return (
		<UserContext.Provider value={{ user, loadingUser, login, logout }}>
			{children}
		</UserContext.Provider>
	);
};

// A custom hook to consume the UserContext easily
export function useUser() {
	return useContext(UserContext);
}
