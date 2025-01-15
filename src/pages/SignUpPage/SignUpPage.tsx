// src/pages/SignUpPage.tsx
import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, message, Tooltip } from "antd";
import axios from "axios";
import { Link } from "react-router-dom";
import { useCsrf } from "../../context/CsrfProvider";
import NavBar from "../../components/Layouts/TopNavbar/TopNavbar";
import "./SignUpPage.css";

const SignUpPage: React.FC = () => {
	const { csrfToken } = useCsrf();
	const [loading, setLoading] = useState(false);

	// Called when the user submits the form
	const onFinish = async (values: {
		email: string;
		password: string;
		first_name: string;
		last_name: string;
	}) => {
		setLoading(true);
		try {
			const userData = {
				email: values.email.trim(),
				password: values.password.trim(),
				first_name: values.first_name.trim(),
				last_name: values.last_name.trim(),
			};

			// Make a POST request to your Django endpoint
			const res = await axios.post("/api/users/create_user", userData, {
				headers: { "X-CSRFToken": csrfToken },
				withCredentials: true,
			});

			message.success(res.data?.message || "User created successfully!");
		} catch (err: any) {
			if (err.response?.data?.error) {
				message.error(err.response.data.error);
			} else {
				message.error("Failed to create user. Please try again.");
			}
			console.error("Sign Up error:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<NavBar />
			<div
				style={{
					position: "fixed",
					top: 64,
					left: 0,
					right: 0,
					bottom: 0,
					display: "flex",
					justifyContent: "center",
					alignItems: "flex-start",
					background: "#ffffff",
					padding: "40px 16px",
					overflowY: "auto",
				}}
			>
				<Card
					style={{
						width: "100%",
						maxWidth: "450px",
						boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
						marginTop: "2vh",
					}}
					bordered={false}
				>
					<Typography.Title
						level={3}
						style={{
							marginBottom: 24,
							textAlign: "center",
						}}
					>
						Welcome to
						<br /> Around the Table
					</Typography.Title>

					<Typography.Paragraph
						style={{
							textAlign: "center",
							marginBottom: 32,
						}}
					>
						Please fill out the form to create a new account.
					</Typography.Paragraph>

					<Form
						layout="vertical"
						onFinish={onFinish}
						autoComplete="off"
						initialValues={{
							email: "",
							password: "",
							first_name: "",
							last_name: "",
						}}
					>
						<Form.Item
							label="First Name"
							name="first_name"
							rules={[
								{ required: true, message: "Please enter your first name" },
							]}
						>
							<Input placeholder="e.g. John" />
						</Form.Item>

						<Form.Item
							label="Last Name"
							name="last_name"
							rules={[
								{ required: true, message: "Please enter your last name" },
							]}
						>
							<Input placeholder="e.g. Doe" />
						</Form.Item>

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
							<Input placeholder="e.g. john.doe@example.com" />
						</Form.Item>

						<Form.Item
							label="Password"
							name="password"
							rules={[
								{ required: true, message: "Please enter your password" },
							]}
						>
							<Input.Password placeholder="••••••" />
						</Form.Item>

						<Form.Item
							label="Confirm Password"
							name="confirm_password"
							dependencies={["password"]}
							rules={[
								{ required: true, message: "Please confirm your password" },
								({ getFieldValue }) => ({
									validator(_, value) {
										if (!value || getFieldValue("password") === value) {
											return Promise.resolve();
										}
										return Promise.reject("Passwords do not match!");
									},
								}),
							]}
						>
							<Input.Password placeholder="••••••" />
						</Form.Item>

						<Form.Item style={{ marginTop: 24 }}>
							<Tooltip title="Sign ups are invite-only at this time">
								<Button
									type="primary"
									htmlType="submit"
									loading={loading}
									block
									style={{
										backgroundColor: "#3f65f3",
										borderColor: "#3f65f3",
									}}
									disabled
								>
									Create Account
								</Button>
							</Tooltip>
						</Form.Item>
					</Form>

					<Link to="/login">
						<Button type="text" block style={{ backgroundColor: "#f5f5f5" }}>
							Already have an account? Log in
						</Button>
					</Link>
				</Card>
			</div>
		</>
	);
};

export default SignUpPage;
