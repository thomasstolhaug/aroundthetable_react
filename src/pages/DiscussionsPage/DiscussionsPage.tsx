import React, { useEffect, useState } from "react";
import {
	Typography,
	List,
	Button,
	Space,
	Breadcrumb,
	Spin,
	Modal,
	Form,
	Input,
} from "antd";
import axios from "axios";
import { PlusOutlined } from "@ant-design/icons";
import "./DiscussionsPage.css";
import { useNavigate } from "react-router-dom";
import { useCsrf } from "../../context/CsrfProvider";

interface Questionnaire {
	id: string;
	name: string;
	description: string;
	created_at: string;
	updated_at: string;
	published_at: string | null;
	completed_at: string | null;
	expiration_date: string | null;
	status: string;
	created_by: number;
}

interface CreateDiscussionValues {
	title: string;
	description: string;
}

const truncateTitle = (title: string, limit: number = 50) => {
	if (title.length <= limit) return title;
	return `${title.slice(0, limit)}...`;
};

const truncateDescription = (description: string, limit: number = 200) => {
	if (description.length <= limit) return description;
	return `${description.slice(0, limit)}...`;
};

const DiscussionsPage: React.FC = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [form] = Form.useForm();
	const { csrfToken } = useCsrf();
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

	useEffect(() => {
		const fetchQuestionnaires = async () => {
			try {
				const response = await axios.get(
					"/api/questionnaires/get_questionnaires_all"
				);
				setQuestionnaires(response.data.questionnaires);
			} catch (error) {
				console.error("Error fetching questionnaires:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchQuestionnaires();
	}, []);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 768);
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const handleCreateDiscussion = async (values: CreateDiscussionValues) => {
		try {
			await axios.post(
				"/api/questionnaires/create_questionnaire",
				{
					title: values.title,
					description: values.description,
				},
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);

			const updatedResponse = await axios.get(
				"/api/questionnaires/get_questionnaires_all"
			);
			setQuestionnaires(updatedResponse.data.questionnaires);

			setIsModalOpen(false);
			form.resetFields();
		} catch (error) {
			console.error("Error creating discussion:", error);
		}
	};

	return (
		<div>
			{loading ? (
				<div className="loading-container">
					<Spin size="large" />
				</div>
			) : (
				<div className="page-container">
					<div className="page-header">
						<div className="page-header-content">
							<div style={{ marginBottom: "16px" }}>
								<Breadcrumb items={[{ title: "My discussions" }]} />
								<Typography.Title level={1}>Discussions</Typography.Title>
							</div>
							<Button
								type="primary"
								icon={<PlusOutlined />}
								style={{ marginBottom: "16px", backgroundColor: "#3f65f3" }}
								onClick={() => setIsModalOpen(true)}
							>
								New Discussion
							</Button>
						</div>
					</div>
					<List
						dataSource={questionnaires}
						renderItem={(item: Questionnaire) => (
							<List.Item
								className="discussion-item"
								onClick={() => navigate(`/discussions/${item.id}`)}
								style={{ cursor: "pointer", minHeight: "180px" }}
							>
								<div
									className="discussion-content"
									style={{
										display: "flex",
										flexDirection: "column",
										justifyContent: "center",
									}}
								>
									<Typography.Title level={3} className="discussion-title">
										{isMobile ? truncateTitle(item.name) : item.name}
									</Typography.Title>
									<Typography.Paragraph className="discussion-description">
										{isMobile
											? truncateDescription(item.description)
											: item.description}
									</Typography.Paragraph>
								</div>
							</List.Item>
						)}
					/>
					<Modal
						title="Create New Discussion"
						open={isModalOpen}
						onCancel={() => setIsModalOpen(false)}
						footer={null}
					>
						<Form
							form={form}
							onFinish={handleCreateDiscussion}
							layout="vertical"
						>
							<Form.Item
								name="title"
								label="Title"
								rules={[
									{
										required: true,
										message: "Please input the discussion title!",
									},
								]}
							>
								<Input placeholder="Lets talk about..." />
							</Form.Item>
							<Form.Item
								name="description"
								label="Description"
								rules={[
									{
										required: false,
										message: "Please input the discussion description!",
									},
								]}
							>
								<Input.TextArea rows={4} placeholder="The purpose of this" />
							</Form.Item>
							<Form.Item>
								<Space>
									<Button type="primary" htmlType="submit">
										Create
									</Button>
									<Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
								</Space>
							</Form.Item>
						</Form>
					</Modal>
				</div>
			)}
		</div>
	);
};

export default DiscussionsPage;
