import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SideNav.css";
import { Typography } from "antd";
import { Menu } from "antd";
import { MessageOutlined, TeamOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Button } from "antd";
import {
	SettingOutlined,
	UserOutlined,
	DashboardOutlined,
} from "@ant-design/icons";

const SideNav: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const menuItems: MenuProps["items"] = [
		{
			key: "dashboard",
			icon: <DashboardOutlined />,
			label: "Dashboard",
			disabled: true,
			onClick: () => navigate("/dashboard"),
		},
		{
			key: "discussions",
			icon: <MessageOutlined />,
			label: "Discussions",
			onClick: () => navigate("/discussions"),
		},
		{
			key: "groups",
			icon: <TeamOutlined />,
			label: "Groups",
			disabled: true,
			onClick: () => navigate("/groups"),
		},
	];

	return (
		<div className="side-nav">
			<div className="side-nav-header">
				<Typography.Title
					level={5}
					style={{ borderBottom: "1px solid #eee", padding: "20px" }}
				>
					Discussions
				</Typography.Title>
				<Menu
					mode="inline"
					selectedKeys={[location.pathname.split("/")[1] || "discussions"]}
					items={menuItems}
					className="side-nav-menu"
					style={{ height: "auto" }}
				/>
			</div>

			<div className="side-nav-footer">
				<Button type="default" block onClick={() => navigate("/profile")}>
					<UserOutlined /> My account
				</Button>
				<Button
					type="default"
					disabled
					block
					onClick={() => navigate("/settings")}
				>
					<SettingOutlined /> Settings
				</Button>
			</div>
		</div>
	);
};

export default SideNav;
