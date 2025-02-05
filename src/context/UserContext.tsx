import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCsrf } from "./CsrfProvider";

interface User {
	email: string;
	firstName: string;
	lastName: string;
}

interface UserContextProps {
	user: User | null;
	loadingUser: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	socket: WebSocket | null;
}

const UserContext = createContext<UserContextProps>({
	user: null,
	loadingUser: true,
	login: async () => {},
	logout: () => {},
	socket: null,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [loadingUser, setLoadingUser] = useState(true);
	const [socket, setSocket] = useState<WebSocket | null>(null);

	const navigate = useNavigate();
	const { csrfToken, reloadCsrf } = useCsrf();

	// 1) On mount, check if user is already authenticated
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

	// 2) Open/close the WebSocket when `user` changes
	useEffect(() => {
		if (user) {
			// Dynamically figure out ws or wss based on the current protocol
			// const baseUrl = import.meta.env.VITE_WS_BASE_URL;
			// const socketUrl = `${baseUrl}/ws/pipeline_progress`;

			const socketUrlProd =
				"wss://aroundthewebapp-hydncfeeemfvcqga.norwayeast-01.azurewebsites.net/api/ws/pipeline_progress";
			//const socketUrlProd = "ws://127.0.0.1:8000/api/ws/pipeline_progress";

			const newSocket = new WebSocket(socketUrlProd);

			newSocket.onopen = () => {
				console.log("WebSocket connected");
				// Example: subscribe to a group if needed
				// newSocket.send(JSON.stringify({ command: "subscribe", groups: ["some_group"] }));
			};

			newSocket.onmessage = (e) => {
				console.log("WebSocket message:", e.data);
				// Handle parsed messages if needed
				// const data = JSON.parse(e.data);
			};

			newSocket.onerror = (error) => {
				console.error("WebSocket error:", error);
			};

			newSocket.onclose = () => {
				console.log("WebSocket closed");
			};

			setSocket(newSocket);

			// Cleanup if user changes or component unmounts
			return () => {
				newSocket.close();
				setSocket(null);
			};
		} else {
			// If no user, close any existing WebSocket
			if (socket) {
				socket.close();
			}
			setSocket(null);
		}
	}, [user]);

	// 3) Login logic
	const login = async (email: string, password: string) => {
		setLoadingUser(true);
		try {
			await axios.post(
				"/api/users/user_login",
				{ email, password },
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);

			// Check current user again
			const whoamiResponse = await axios.get("/api/users/whoami", {
				withCredentials: true,
			});

			// Reload CSRF
			await reloadCsrf();

			setUser({
				email: whoamiResponse.data.email,
				firstName: whoamiResponse.data.first_name,
				lastName: whoamiResponse.data.last_name,
			});
		} finally {
			setLoadingUser(false);
		}
	};

	// 4) Logout logic
	const logout = async () => {
		setLoadingUser(true);
		try {
			await axios.post(
				"/api/users/user_logout",
				{},
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);
			setUser(null);
			navigate("/", { replace: true });
		} finally {
			setLoadingUser(false);
		}
	};

	return (
		<UserContext.Provider
			value={{
				user,
				loadingUser,
				login,
				logout,
				socket,
			}}
		>
			{children}
		</UserContext.Provider>
	);
};

// 5) Hook to consume the context
export function useUser() {
	return useContext(UserContext);
}
