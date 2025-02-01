//import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { CsrfProvider } from "./context/CsrfProvider";
import { UserProvider } from "./context/UserContext";
import { BrowserRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

createRoot(document.getElementById("root")!).render(
	//<StrictMode>
	<CsrfProvider>
		<BrowserRouter>
			<UserProvider>
				<App />
				<Analytics /> {/* Vercel Analytics */}
				<SpeedInsights /> {/* Vercel Speed Insights */}
			</UserProvider>
		</BrowserRouter>
	</CsrfProvider>
	//</StrictMode>
);
