import React, { useState } from "react";
import { Card, Form, Input, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCsrf } from "../../context/CsrfProvider";
import "./AccessDiscussionPage.css";

const AccessDiscussionPage: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { csrfToken } = useCsrf();
	const [form] = Form.useForm();

	const onFinish = async (values: { access_code: string }) => {
		setLoading(true);
		try {
			await axios.post(
				"/api/sharing/validate_access_code",
				{ access_code: values.access_code },
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);

			message.success("Access granted!");
			navigate(`/answer?code=${values.access_code}`);
		} catch (error: any) {
			message.error(error.response?.data?.error || "Invalid access code");
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = (value: string) => {
		if (value) {
			form.validateFields().then(() => {
				onFinish({ access_code: value });
			});
		}
	};

	return (
		<div className="access-discussion-page">
			<Card style={{ width: 400, maxWidth: "90%" }} bordered={false}>
				<Typography.Title
					level={2}
					style={{ textAlign: "center", marginBottom: 24 }}
				>
					Access Discussion
				</Typography.Title>

				<Typography.Paragraph style={{ textAlign: "center", marginBottom: 24 }}>
					Enter your access code to view the discussion.
				</Typography.Paragraph>

				<Form form={form} onFinish={onFinish} layout="vertical">
					<Form.Item
						name="access_code"
						rules={[
							{ required: true, message: "Please enter the access code" },
						]}
					>
						<Input.Search
							placeholder="Enter access code"
							enterButton="Access"
							size="large"
							loading={loading}
							onSearch={handleSearch}
						/>
					</Form.Item>
				</Form>
			</Card>
		</div>
	);
};

export default AccessDiscussionPage;
