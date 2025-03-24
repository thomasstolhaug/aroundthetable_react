import React, { useState, useEffect } from "react";
import "./TopNavbar.css";
import { Button, Tooltip, Typography, Drawer } from "antd";
import { Link } from "react-router-dom";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { useUser } from "../../../context/UserContext";
import logo from "../../../assets/logo_color_st.svg";
import ProfileEditModal from "../../ProfileEditModal/ProfileEditModal";
import { useNavigate } from "react-router-dom";

const MainNavbar: React.FC = () => {
	const [hamurgerMenuOpen, setHamurgerMenuOpen] = useState(false);
	const { user, logout } = useUser();
	const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

	const navigate = useNavigate();
	useEffect(() => {
		console.log("User state changed:", user);
	}, [user]);

	const handleHamurgerMenuOpen = () => {
		setHamurgerMenuOpen(true);
	};

	const handleHamurgerMenuClose = () => {
		setHamurgerMenuOpen(false);
	};

	const handleLogout = () => {
		logout();
	};

	const handleProfileClick = () => {
		setHamurgerMenuOpen(false);
		setTimeout(() => {
			setIsProfileModalOpen(true);
		}, 500); // 500ms = 0.5 seconds
	};

	return (
		<>
			<div className="desktop-navbar">
				<div className="desktop-navbar-left">
					<Link to="/">
						<img
							src={logo}
							alt="Around The Table Logo"
							style={{ height: "28px" }}
						/>
					</Link>
				</div>

				<div className="desktop-navbar-right">
					<div className="desktop-navbar-right-items">
						<div className="divider" />

						<Link to="/" className="button-no-underline">
							<Typography.Text strong>Home</Typography.Text>
						</Link>

						<Link to="/about-us" className="button-no-underline">
							<Typography.Text strong>About Us</Typography.Text>
						</Link>

						<div className="divider" />

						{user?.email ? (
							<>
								<Link to="/discussions">
									<Button type="primary" style={{ backgroundColor: "#3f65f3" }}>
										Dashboard
									</Button>
								</Link>
								<Link to="/">
									<Button type="default" onClick={handleLogout}>
										Log out
									</Button>
								</Link>
							</>
						) : (
							<>
								<Link to="/login">
									<Button type="default">Login</Button>
								</Link>
								<Link to="/signup">
									<Tooltip title="Sign ups are currently invite only">
										<Button type="primary">Sign Up</Button>
									</Tooltip>
								</Link>
							</>
						)}
					</div>
				</div>
			</div>

			{/* Mobile Navbar */}
			<div className="mobile-navbar">
				<div className="mobile-navbar-left">
					<Link to="/">
						<img
							src={logo}
							alt="Around The Table Logo"
							style={{ height: "28px" }}
						/>
					</Link>
				</div>
				<div className="mobile-navbar-right">
					<Button
						type="text"
						size="large"
						icon={<MenuOutlined />}
						onClick={handleHamurgerMenuOpen}
					/>
				</div>
			</div>

			{/* Mobile Drawer */}
			<Drawer
				open={hamurgerMenuOpen}
				placement="top"
				height="auto"
				closable={false}
				onClose={handleHamurgerMenuClose}
				title={
					<div style={{ display: "flex", justifyContent: "space-between" }}>
						<Link to="/">
							<img
								src={logo}
								alt="Around The Table Logo"
								style={{ height: "28px" }}
							/>
						</Link>
						<CloseOutlined
							style={{ fontSize: 18, cursor: "pointer" }}
							onClick={handleHamurgerMenuClose}
						/>
					</div>
				}
			>
				<div className="mobile-drawer-content">
					{user?.email && (
						<>
							<div className="drawer-divider" />
							<Button
								type="text"
								block
								style={{ textAlign: "left", height: "auto" }}
								onClick={() => {
									handleHamurgerMenuClose();
									navigate("/");
								}}
							>
								<Typography.Text strong style={{ fontSize: 16 }}>
									Home
								</Typography.Text>
							</Button>

							<Button
								type="text"
								block
								style={{ textAlign: "left", height: "auto" }}
								onClick={() => {
									handleHamurgerMenuClose();
									navigate("/discussions");
								}}
							>
								<Typography.Text strong style={{ fontSize: 16 }}>
									Discussions
								</Typography.Text>
							</Button>

							<Tooltip title="Coming soon">
								<Button
									type="text"
									block
									disabled
									style={{
										textAlign: "left",
										height: "auto",
									}}
								>
									<Typography.Text style={{ fontSize: 16, color: "#bfbfbf" }}>
										Groups
									</Typography.Text>
								</Button>
							</Tooltip>

							<Tooltip title="Coming soon">
								<Button
									type="text"
									block
									disabled
									style={{
										textAlign: "left",
										height: "auto",
										padding: "8px 0",
									}}
								>
									<Typography.Text style={{ fontSize: 16, color: "#bfbfbf" }}>
										Reports
									</Typography.Text>
								</Button>
							</Tooltip>

							<Tooltip title="Coming soon">
								<Button
									type="text"
									block
									disabled
									style={{
										textAlign: "left",
										height: "auto",
										padding: "8px 0",
									}}
								>
									<Typography.Text style={{ fontSize: 16, color: "#bfbfbf" }}>
										Community
									</Typography.Text>
								</Button>
							</Tooltip>
							<Button
								type="text"
								block
								style={{ textAlign: "left", height: "auto" }}
								onClick={handleProfileClick}
							>
								<Typography.Text strong style={{ fontSize: 16 }}>
									Profile Settings
								</Typography.Text>
							</Button>
						</>
					)}

					<div className="drawer-divider" />

					<div className="drawer-footer">
						{user?.email ? (
							<>
								<Link to="/discussions" onClick={handleHamurgerMenuClose}>
									<Button
										type="primary"
										block
										style={{ backgroundColor: "#3f65f3" }}
									>
										Dashboard
									</Button>
								</Link>
								<Link to="/" onClick={handleHamurgerMenuClose}>
									<Button type="default" block onClick={handleLogout}>
										Log out
									</Button>
								</Link>
							</>
						) : (
							<>
								<Link to="/login" onClick={handleHamurgerMenuClose}>
									<Button type="default" block>
										Login
									</Button>
								</Link>
								<Link to="/signup" onClick={handleHamurgerMenuClose}>
									<Tooltip title="Sign ups are currently invite only">
										<Button type="primary" block>
											Sign Up
										</Button>
									</Tooltip>
								</Link>
							</>
						)}
					</div>
				</div>
			</Drawer>

			<ProfileEditModal
				isOpen={isProfileModalOpen}
				onClose={() => setIsProfileModalOpen(false)}
			/>
		</>
	);
};

export default MainNavbar;
