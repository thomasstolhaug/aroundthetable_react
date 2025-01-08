import React, { useState } from "react";
import { Button, Card, Form, Input, Typography, message } from "antd";
import axios from "axios";
import { useCsrf } from "../../context/CsrfProvider";

axios.defaults.withCredentials = true;

const ResetPassword: React.FC = () => {
	const { tokenLoaded } = useCsrf();
	const [submitting, setSubmitting] = useState(false);

	const onFinish = async (values: { email: string }) => {
		try {
			setSubmitting(true);
			await axios.post("/api/users/forgot_password/", {
				email: values.email,
			});
			message.success(
				"If an account exists with this email, you will receive password reset instructions."
			);
		} catch (err) {
			// We don't want to reveal if the email exists or not for security
			message.success(
				"If an account exists with this email, you will receive password reset instructions."
			);
			console.error("Password reset request error:", err);
		} finally {
			setSubmitting(false);
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
			<Card style={{ width: 350, maxWidth: "90%" }} bordered={false}>
				<div style={{ textAlign: "center", marginBottom: 24 }}>
					<Typography.Title level={3}>Reset Password</Typography.Title>
					<Typography.Text type="secondary">
						Enter your email address and we'll send you instructions to reset
						your password.
					</Typography.Text>
				</div>

				<Form
					name="resetPasswordForm"
					layout="vertical"
					autoComplete="off"
					onFinish={onFinish}
					initialValues={{ email: "" }}
				>
					<Form.Item
						label="Email"
						name="email"
						rules={[
							{ required: true, message: "Please enter your email" },
							{ type: "email", message: "Please enter a valid email address" },
						]}
					>
						<Input placeholder="Email" type="email" autoComplete="email" />
					</Form.Item>

					<Form.Item style={{ marginTop: 24 }}>
						<Button
							type="primary"
							htmlType="submit"
							block
							disabled={!tokenLoaded}
							loading={submitting}
						>
							{tokenLoaded
								? "Send Reset Instructions"
								: "Waiting for server..."}
						</Button>
					</Form.Item>
				</Form>

				<Button
					type="text"
					href="/login"
					block
					style={{ backgroundColor: "#f5f5f5" }}
				>
					Back to Login
				</Button>
			</Card>
		</div>
	);
};

export default ResetPassword;
