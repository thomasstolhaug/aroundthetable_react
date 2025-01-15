import React, { useState } from "react";
import { Button, Card, Form, Input, Typography } from "antd";
import axios from "axios";
import { useCsrf } from "../../context/CsrfProvider";

axios.defaults.withCredentials = true;

const ResetPassword: React.FC = () => {
	const { tokenLoaded } = useCsrf();
	const [submitting, setSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const onFinish = async (values: { email: string }) => {
		try {
			setSubmitting(true);
			await axios.post("/api/users/request-password-mail/", {
				email: values.email,
			});
			setIsSubmitted(true);
		} catch (err) {
			// We don't want to reveal if the email exists or not for security
			setIsSubmitted(true);
			console.error("Password reset request error:", err);
		} finally {
			setSubmitting(false);
		}
	};

	const renderSuccessMessage = () => (
		<>
			<Typography.Title
				level={3}
				style={{
					marginBottom: 24,
					textAlign: "center",
				}}
			>
				Check Your Email
			</Typography.Title>

			<Typography.Paragraph
				style={{
					textAlign: "center",
					marginBottom: 32,
				}}
			>
				If an account exists with this email address, we've sent instructions to
				reset your password. Please check your inbox and spam folder.
			</Typography.Paragraph>

			<Button
				type="primary"
				href="/"
				block
				style={{
					backgroundColor: "#3f65f3",
					borderColor: "#3f65f3",
				}}
			>
				Return to Home
			</Button>
		</>
	);

	const renderRequestForm = () => (
		<>
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
				Enter your email address and we'll send you instructions to reset your
				password.
			</Typography.Paragraph>

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
						style={{
							backgroundColor: "#3f65f3",
							borderColor: "#3f65f3",
						}}
					>
						{tokenLoaded ? "Send Reset Instructions" : "Waiting for server..."}
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
		</>
	);

	return (
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
				{isSubmitted ? renderSuccessMessage() : renderRequestForm()}
			</Card>
		</div>
	);
};

export default ResetPassword;
