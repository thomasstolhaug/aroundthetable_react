import React, { useEffect, useState } from "react";
import {
	Typography,
	List,
	Button,
	Space,
	Tag,
	Breadcrumb,
	Spin,
	Modal,
	Form,
	Input,
} from "antd";
import axios from "axios";
import { format } from "date-fns";
import { RightOutlined, PlusOutlined } from "@ant-design/icons";
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

const DiscussionsPage: React.FC = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [form] = Form.useForm();
	const { csrfToken } = useCsrf();

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
								<Breadcrumb
									items={[
										{
											title: "My discussions",
										},
									]}
								/>
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
							<List.Item className="discussion-item">
								<div className="discussion-content">
									<div className="discussion-status">
										<Tag color={item.status === "draft" ? "blue" : "green"}>
											{item.status.charAt(0).toUpperCase() +
												item.status.slice(1)}
										</Tag>
									</div>
									<div className="discussion-main">
										<Typography.Title level={3} className="discussion-title">
											{item.name}
										</Typography.Title>
										<Typography.Paragraph className="discussion-description">
											{item.description}
										</Typography.Paragraph>
										<div className="discussion-responses">
											<span className="responses-count">x responses</span>
										</div>
									</div>
									<div className="discussion-meta">
										<Space
											direction="vertical"
											size="small"
											style={{ width: "100%" }}
										>
											<div className="meta-dates">
												<div className="meta-item">
													<span className="meta-label">Created:</span>
													<span>
														{format(new Date(item.created_at), "MMM d, yyyy")}
													</span>
												</div>
												<div className="meta-item">
													<span className="meta-label">Updated:</span>
													<span>
														{format(new Date(item.updated_at), "MMM d, yyyy")}
													</span>
												</div>
											</div>
											<Button
												type="default"
												className="view-button"
												onClick={() => navigate(`/discussions/${item.id}`)}
											>
												View Discussion <RightOutlined />
											</Button>
										</Space>
									</div>
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
								<Input />
							</Form.Item>
							<Form.Item
								name="description"
								label="Description"
								rules={[
									{
										required: true,
										message: "Please input the discussion description!",
									},
								]}
							>
								<Input.TextArea rows={4} />
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
