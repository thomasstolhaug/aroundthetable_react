import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Typography, Button, message } from "antd";
import axios from "axios";
import { useCsrf } from "../../context/CsrfProvider";

const { Title, Paragraph } = Typography;

const EmailVerificationPage: React.FC = () => {
	const { csrfToken } = useCsrf();
	const { uidb64, token } = useParams();
	const navigate = useNavigate();
	const [verifying, setVerifying] = useState(true);
	const [verified, setVerified] = useState(false);

	useEffect(() => {
		const verifyEmail = async () => {
			try {
				const data = {
					uidb64,
					token,
				};
				const response = await axios.post(
					"/api/users/finalize-password-reset/",
					data,
					{
						headers: { "X-CSRFToken": csrfToken },
						withCredentials: true,
					}
				);

				setVerified(true);
				message.success(
					response.data?.message || "Email verified successfully!"
				);
			} catch (err: any) {
				message.error(err.response?.data?.error || "Email verification failed");
				console.error("Email verification error:", err);
			} finally {
				setVerifying(false);
			}
		};

		if (uidb64 && token) {
			verifyEmail();
		} else {
			setVerifying(false);
			message.error("Invalid verification link");
		}
	}, [uidb64, token]);

	return (
		<div style={containerStyle}>
			<Card style={{ width: 400, textAlign: "center" }}>
				{verifying ? (
					<Title level={3}>Verifying your email...</Title>
				) : verified ? (
					<>
						<Title level={3}>Email Verified!</Title>
						<Paragraph>
							Your email has been successfully verified. You can now proceed to
							login.
						</Paragraph>
						<Button type="primary" onClick={() => navigate("/login")}>
							Go to Login
						</Button>
					</>
				) : (
					<>
						<Title level={3}>Verification Failed</Title>
						<Paragraph>
							We couldn't verify your email. The link might be expired or
							invalid.
						</Paragraph>
						<Button type="primary" onClick={() => navigate("/")}>
							Go to Homepage
						</Button>
					</>
				)}
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

export default EmailVerificationPage;
