import React from "react";
import { Typography, Button } from "antd";
import { useNavigate } from "react-router-dom";

const NotFoundPage: React.FC = () => {
	const navigate = useNavigate();

	return (
		<div
			style={{
				padding: "2rem",
				maxWidth: "1200px",
				margin: "0 auto",
				textAlign: "center",
			}}
		>
			<Typography.Title level={1}>404 - Page Not Found</Typography.Title>
			<Typography.Paragraph>
				The page you are looking for does not exist.
			</Typography.Paragraph>
			<Button type="primary" onClick={() => navigate("/")}>
				Return to Home
			</Button>
		</div>
	);
};

export default NotFoundPage;
