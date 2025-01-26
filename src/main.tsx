//import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { CsrfProvider } from "./context/CsrfProvider";
import { UserProvider } from "./context/UserContext";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
	//<StrictMode>
	<CsrfProvider>
		<BrowserRouter>
			<UserProvider>
				<App />
			</UserProvider>
		</BrowserRouter>
	</CsrfProvider>
	//</StrictMode>
);
