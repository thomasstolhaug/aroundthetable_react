// src/context/CsrfContext.tsx
import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from "react";
import axios from "axios";

axios.defaults.withCredentials = true;

interface CsrfContextProps {
	csrfToken: string;
	tokenLoaded: boolean;
	error: Error | null;
	reloadCsrf: () => Promise<void>;
}

const CsrfContext = createContext<CsrfContextProps>({
	csrfToken: "",
	tokenLoaded: false,
	error: null,
	reloadCsrf: async () => {},
});

export const CsrfProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [csrfToken, setCsrfToken] = useState("");
	const [tokenLoaded, setTokenLoaded] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const fetchCsrfCookie = async () => {
		try {
			// We expect the Django endpoint to return { csrfToken: 'abc123' }
			const res = await axios.get("/api/get-csrf-token");
			const token = res.data.csrf_token;
			setCsrfToken(token || ""); // Store it in state
			setTokenLoaded(true);
		} catch (err) {
			if (err instanceof Error) {
				setError(err);
			} else {
				setError(new Error("Unknown error fetching CSRF cookie"));
			}
		}
	};

	useEffect(() => {
		fetchCsrfCookie();
	}, []);

	// Manual re-fetch if needed
	const reloadCsrf = async () => {
		setTokenLoaded(false);
		setError(null);
		setCsrfToken("");
		await fetchCsrfCookie();
	};

	return (
		<CsrfContext.Provider value={{ csrfToken, tokenLoaded, error, reloadCsrf }}>
			{children}
		</CsrfContext.Provider>
	);
};

export function useCsrf() {
	return useContext(CsrfContext);
}
