import React from "react";
import "./TopNavbar.css";
import { Button, Tooltip, Typography, Drawer } from "antd";
import { Link } from "react-router-dom";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useUser } from "../../../context/UserContext";
import logo from "../../../assets/logo_color_st.svg";

const MainNavbar: React.FC = () => {
	const [hamurgerMenuOpen, setHamurgerMenuOpen] = useState(false);
	const { user, logout } = useUser();

	const handleHamurgerMenuOpen = () => {
		setHamurgerMenuOpen(true);
	};

	const handleHamurgerMenuClose = () => {
		setHamurgerMenuOpen(false);
	};

	const handleLogout = () => {
		logout();
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

						<div className="divider" />

						<Link to="/" className="button-no-underline">
							<Typography.Text strong disabled>
								Use cases
							</Typography.Text>
						</Link>

						<div className="divider" />

						<Link to="/" className="button-no-underline">
							<Typography.Text strong disabled>
								Pricing
							</Typography.Text>
						</Link>

						<div className="divider" />

						{user?.email ? (
							<>
								<Link to="/dashboard">
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
										<Button type="primary" disabled>
											Sign Up
										</Button>
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
					<Link
						to="/"
						className="button-no-underline"
						onClick={handleHamurgerMenuClose}
					>
						<Typography.Text strong style={{ fontSize: 16 }}>
							Home
						</Typography.Text>
					</Link>
					<Link
						to="/"
						className="button-no-underline"
						onClick={handleHamurgerMenuClose}
					>
						<Typography.Text strong disabled style={{ fontSize: 16 }}>
							Use cases
						</Typography.Text>
					</Link>
					<Link
						to="/"
						className="button-no-underline"
						onClick={handleHamurgerMenuClose}
					>
						<Typography.Text strong disabled style={{ fontSize: 16 }}>
							Pricing
						</Typography.Text>
					</Link>

					<div className="drawer-divider" />

					<div className="drawer-footer">
						<Link to="/login" onClick={handleHamurgerMenuClose}>
							<Button type="default" block>
								Login
							</Button>
						</Link>
						<Link to="/signup" onClick={handleHamurgerMenuClose}>
							<Tooltip title="Sign ups are currently invite only">
								<Button type="primary" disabled block>
									Sign Up
								</Button>
							</Tooltip>
						</Link>
					</div>
				</div>
			</Drawer>
		</>
	);
};

export default MainNavbar;
