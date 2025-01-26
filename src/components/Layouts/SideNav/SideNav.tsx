import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SideNav.css";
import { Typography, Input } from "antd";
import { Menu } from "antd";
import {
	MessageOutlined,
	SettingOutlined,
	UserOutlined,
	TeamOutlined,
	BarChartOutlined,
	GlobalOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Button } from "antd";
import ProfileEditModal from "../../ProfileEditModal/ProfileEditModal";

const SideNav: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

	const menuItems: MenuProps["items"] = [
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
			onClick: () => navigate("/groups"),
			disabled: true,
		},
		{
			key: "reports",
			icon: <BarChartOutlined />,
			label: "Reports",
			onClick: () => navigate("/reports"),
			disabled: true,
		},
		{
			key: "community",
			icon: <GlobalOutlined />,
			label: "Community",
			onClick: () => navigate("/community"),
			disabled: true,
		},
	];

	return (
		<div className="side-nav">
			<div className="side-nav-header">
				<Input.Search
					placeholder="Search discussions..."
					disabled
					style={{ margin: "10px" }}
				/>
				<Typography.Title level={4} style={{ margin: "16px 16px 0" }}>
					Dashboard
				</Typography.Title>
				<Menu
					mode="inline"
					selectedKeys={[location.pathname.split("/")[1] || "discussions"]}
					items={menuItems}
					className="side-nav-menu"
					style={{ height: "auto", marginTop: "20px" }}
				/>
			</div>

			<div className="side-nav-footer">
				<Button
					type="default"
					block
					onClick={() => setIsProfileModalOpen(true)}
				>
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

			<ProfileEditModal
				isOpen={isProfileModalOpen}
				onClose={() => setIsProfileModalOpen(false)}
			/>
		</div>
	);
};

export default SideNav;
