import React from "react";
import { Typography } from "antd";

const HomePage: React.FC = () => {
	return (
		<div>
			<Typography.Title level={1}>Welcome to Around the Table</Typography.Title>
			<Typography.Paragraph>
				This is the home page of our application. More content will be added
				here soon.
			</Typography.Paragraph>
		</div>
	);
};

export default HomePage;
