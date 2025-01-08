import React, { useState } from "react";
import { Button, Card, Form, Input, Typography, message } from "antd";
import axios from "axios";
import { useCsrf } from "../../context/CsrfProvider";
import { useUser } from "../../context/UserContext";
import { Link } from "react-router-dom";
import "./LoginPage.css";

axios.defaults.withCredentials = true;

const Login: React.FC = () => {
	const { tokenLoaded } = useCsrf();
	const { login } = useUser();

	// Local state to track if we're currently submitting
	const [loggingIn, setLoggingIn] = useState(false);

	const onFinish = async (values: { email: string; password: string }) => {
		try {
			setLoggingIn(true);
			await login(values.email, values.password);
			console.log("User logged in successfully!");
		} catch (err: any) {
			if (axios.isAxiosError(err)) {
				const errorMessage = err.response?.data?.error;
				if (errorMessage) {
					message.error(errorMessage);
				} else {
					message.error("Login failed. Please try again.");
				}
			} else {
				message.error("Something went wrong. Please try again.");
			}
			console.error("Login error:", err);
		} finally {
			setLoggingIn(false);
		}
	};

	return (
		<>
			<div className="login-page">
				<Card style={{ width: 350, maxWidth: "90%" }} bordered={false}>
					<div style={{ textAlign: "center", marginBottom: 24 }}>
						<Typography.Title level={3}>
							Welcome to
							<br /> Around the Table
						</Typography.Title>
					</div>

					<Form
						name="loginForm"
						layout="vertical"
						autoComplete="off"
						onFinish={onFinish}
						initialValues={{ email: "", password: "" }}
					>
						<Form.Item
							label="Email"
							name="email"
							rules={[
								{ required: true, message: "Please enter your email" },
								{
									type: "email",
									message: "Please enter a valid email address",
								},
							]}
						>
							<Input placeholder="Email" type="email" autoComplete="email" />
						</Form.Item>

						<Form.Item
							label="Password"
							name="password"
							rules={[
								{ required: true, message: "Please enter your password" },
							]}
						>
							<Input.Password
								placeholder="Password"
								type="password"
								autoComplete="current-password"
							/>
						</Form.Item>

						<Form.Item style={{ marginTop: 24 }}>
							<Button
								type="primary"
								htmlType="submit"
								block
								disabled={!tokenLoaded}
								loading={loggingIn}
								style={{ backgroundColor: "#3f65f3" }}
							>
								{tokenLoaded ? "Log In" : "Waiting for server..."}
							</Button>
						</Form.Item>
					</Form>

					<Link to="/signup">
						<Button
							type="text"
							href="/signup"
							block
							style={{ backgroundColor: "#f5f5f5", marginBottom: "8px" }}
						>
							Don't have an account? Sign up
						</Button>
					</Link>
					<Button
						type="text"
						href="/request-reset-password"
						block
						style={{ backgroundColor: "#f5f5f5" }}
					>
						Forgot your password?
					</Button>
				</Card>
			</div>
		</>
	);
};

export default Login;
