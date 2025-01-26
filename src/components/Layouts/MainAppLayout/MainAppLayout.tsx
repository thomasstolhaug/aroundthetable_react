import React from "react";
import "./MainAppLayout.css";
import TopNavbar from "../TopNavbar/TopNavbar";
import { Outlet } from "react-router-dom";

const MainAppLayout: React.FC = () => {
	return (
		<div className="main-app-layout">
			<TopNavbar />
			<div className="main-content">
				<Outlet />
			</div>
		</div>
	);
};

export default MainAppLayout;
