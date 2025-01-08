import { useEffect, useState } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;

interface UseCsrfResult {
	csrfToken: string;
	loading: boolean;
	error: Error | null;
}

export function getCsrfToken(): UseCsrfResult {
	const [csrfToken, setCsrfToken] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const fetchCsrf = async () => {
			try {
				setLoading(true);
				const response = await axios.get("/api/get-csrf-token/", {
					withCredentials: true,
				});

				// Assume your endpoint returns { csrfToken: 'abc123' }
				setCsrfToken(response.data.csrf_token);
			} catch (err: unknown) {
				if (err instanceof Error) {
					setError(err);
				} else {
					setError(new Error("An unknown error occurred while fetching CSRF"));
				}
			} finally {
				setLoading(false);
			}
		};

		fetchCsrf();
	}, []);

	return { csrfToken, loading, error };
}
