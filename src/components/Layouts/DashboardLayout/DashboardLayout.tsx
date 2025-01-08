import React from "react";
import "./DashboardLayout.css";
import SideNav from "../SideNav/SideNav";
import { Outlet } from "react-router-dom";

const DashboardLayout: React.FC = () => {
	return (
		<div className="dashboard-layout">
			<SideNav />
			<div className="dashboard-content">
				<div className="dashboard-content-inner">
					<Outlet />
				</div>
			</div>
		</div>
	);
};

export default DashboardLayout;
