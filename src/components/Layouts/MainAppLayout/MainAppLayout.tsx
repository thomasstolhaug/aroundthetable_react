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
			<footer className="main-footer">
				<div className="footer-content">
					<div className="footer-text">
						<span>Around the Table - No Idea Left Behind</span>
						<span>&copy; {new Date().getFullYear()}</span>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default MainAppLayout;
