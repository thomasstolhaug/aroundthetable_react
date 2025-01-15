// src/pages/ResetPasswordPage.tsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, Form, Input, Button, Typography, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCsrf } from "../../context/CsrfProvider";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";

const ResetPasswordPage: React.FC = () => {
	const [searchParams] = useSearchParams();
	const uidb64 = searchParams.get("uidb64") || "";
	const token = searchParams.get("token") || "";

	const { csrfToken, tokenLoaded } = useCsrf();
	const navigate = useNavigate();

	const [submitting, setSubmitting] = useState(false);

	// Optionally validate that uidb64/token are present
	useEffect(() => {
		if (!uidb64 || !token) {
			message.error(
				"Invalid or missing reset credentials. Please check your link."
			);
		}
	}, [uidb64, token]);

	const onFinish = async (values: {
		new_password: string;
		confirm_password: string;
	}) => {
		setSubmitting(true);
		try {
			// POST to Django: /api/users/finalize-password-reset/
			const data = {
				uidb64,
				token,
				new_password: values.new_password,
				confirm_password: values.confirm_password,
			};

			const res = await axios.post(
				"/api/users/finalize-password-reset/",
				data,
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);

			message.success(res.data?.message || "Password reset successful!");
			navigate("/login");
		} catch (err: any) {
			if (err.response?.data?.error) {
				message.error(err.response.data.error);
			} else {
				message.error("Failed to reset password. Please try again.");
			}
			console.error("Reset password error:", err);
		} finally {
			setSubmitting(false);
		}
	};

	// Wait until the CSRF token is loaded (or show a spinner otherwise)
	if (!tokenLoaded) {
		return <LoadingScreen />;
	}

	return (
		<div style={containerStyle}>
			<Card title="Reset Your Password" style={{ width: 400 }}>
				<Typography.Paragraph>
					Please enter your new password below.
				</Typography.Paragraph>

				<Form onFinish={onFinish} layout="vertical">
					<Form.Item
						label="New Password"
						name="new_password"
						rules={[
							{ required: true, message: "Please enter your new password" },
						]}
					>
						<Input.Password placeholder="New password" />
					</Form.Item>

					<Form.Item
						label="Confirm New Password"
						name="confirm_password"
						dependencies={["new_password"]}
						rules={[
							{ required: true, message: "Please confirm your new password" },
							({ getFieldValue }) => ({
								validator(_, value) {
									if (!value || getFieldValue("new_password") === value) {
										return Promise.resolve();
									}
									return Promise.reject("Passwords do not match!");
								},
							}),
						]}
					>
						<Input.Password placeholder="Confirm new password" />
					</Form.Item>

					<Button type="primary" htmlType="submit" loading={submitting} block>
						Set New Password
					</Button>
				</Form>
			</Card>
		</div>
	);
};

const containerStyle: React.CSSProperties = {
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	height: "100vh",
	background: "#f0f2f5",
};

export default ResetPasswordPage;
