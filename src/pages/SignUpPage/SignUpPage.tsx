// src/pages/SignUpPage.tsx
import React, { useState } from "react";
import {
	Card,
	Form,
	Input,
	Button,
	Typography,
	message,
	Space,
	Tooltip,
} from "antd";
import axios from "axios";
import { Link } from "react-router-dom";

const SignUpPage: React.FC = () => {
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
			// Make a POST request to your Django endpoint
			const res = await axios.post("/api/users/create_user_disabled", {
				email: values.email.trim(),
				password: values.password.trim(),
				first_name: values.first_name.trim(),
				last_name: values.last_name.trim(),
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
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				background: "#f0f2f5",
			}}
		>
			<Card
				style={{
					width: 350,
					maxWidth: "90%",
					boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
				}}
				bordered={false}
			>
				<Typography.Title level={3}>Sign Up</Typography.Title>

				<Typography.Paragraph>
					Please fill out the form to create a new account.
				</Typography.Paragraph>

				<Form layout="vertical" onFinish={onFinish}>
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
						rules={[{ required: true, message: "Please enter your last name" }]}
					>
						<Input placeholder="e.g. Doe" />
					</Form.Item>

					<Form.Item
						label="Email"
						name="email"
						rules={[
							{ required: true, message: "Please enter your email" },
							{ type: "email", message: "Please enter a valid email address" },
						]}
					>
						<Input placeholder="e.g. john.doe@example.com" />
					</Form.Item>

					<Form.Item
						label="Password"
						name="password"
						rules={[{ required: true, message: "Please enter your password" }]}
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

					<Form.Item>
						<Space direction="vertical" style={{ width: "100%" }}>
							<Tooltip title="Sign up is currently invite-only">
								<Button
									type="primary"
									htmlType="submit"
									loading={loading}
									block
									disabled
								>
									Create Account
								</Button>
							</Tooltip>
							<Link to="/login">
								<Button block>Back to Login</Button>
							</Link>
						</Space>
					</Form.Item>
				</Form>
			</Card>
		</div>
	);
};

export default SignUpPage;
