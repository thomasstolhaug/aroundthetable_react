import AppRoutes from "./routes/AppRoutes";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

function App() {
	return <AppRoutes />;
}
export default App;
