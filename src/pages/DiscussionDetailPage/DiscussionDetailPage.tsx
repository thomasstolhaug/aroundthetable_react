import React, { useEffect, useState } from "react";
import {
	Typography,
	Breadcrumb,
	Spin,
	Tag,
	Button,
	List,
	Modal,
	Form,
	Input,
	Switch,
	InputNumber,
	DatePicker,
} from "antd";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./DiscussionDetailPage.css";
import { useCsrf } from "../../context/CsrfProvider";
import {
	PlusOutlined,
	DeleteOutlined,
	ShareAltOutlined,
} from "@ant-design/icons";
import { QRCodeSVG } from "qrcode.react";

interface QuestionnaireResponse {
	questionnaire: {
		id: string;
		name: string;
		description: string;
		created_by: number;
		published_at: string | null;
		completed_at: string | null;
		expiration_date: string | null;
		status: "draft" | "published" | "completed";
	};
}

interface Question {
	id: string;
	question: string;
	answer_character_limit: number;
	questionnaire: string;
	required: boolean;
}

interface QuestionResponse {
	questions: Question[];
}

interface ShareQuestionnaire {
	id: string;
	questionnaire: string;
	access_code: string;
	expiration_date: string;
	is_active: boolean;
	created_at: string;
	created_by: number;
	last_accessed: string | null;
	access_count: number;
}

const DiscussionDetailPage: React.FC = () => {
	const { csrfToken } = useCsrf();
	const { id } = useParams();
	const [loading, setLoading] = useState(true);
	const [questionnaire, setQuestionnaire] = useState<
		QuestionnaireResponse["questionnaire"] | null
	>(null);
	const [error, setError] = useState<string | null>(null);
	const [questions, setQuestions] = useState<Question[]>([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [form] = Form.useForm();
	const navigate = useNavigate();
	const [analyzing, setAnalyzing] = useState(false);
	const [deleteModalVisible, setDeleteModalVisible] = useState(false);
	const [shareModalVisible, setShareModalVisible] = useState(false);
	const [sharing, setSharing] = useState(false);
	const [shareInfo, setShareInfo] = useState<ShareQuestionnaire | null>(null);

	useEffect(() => {
		const fetchQuestionnaire = async () => {
			try {
				const data = { questionnaire_id: id };

				const response = await axios.post<QuestionnaireResponse>(
					"/api/questionnaires/get_questionnaire_by_id",
					data,
					{
						headers: { "X-CSRFToken": csrfToken },
						withCredentials: true,
					}
				);
				setQuestionnaire(response.data.questionnaire);
				setError(null);
			} catch (err) {
				console.error("Error fetching questionnaire:", err);
				setError("Failed to load discussion");
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			fetchQuestionnaire();
		}
	}, [id, csrfToken]);

	useEffect(() => {
		const fetchQuestions = async () => {
			try {
				const response = await axios.post<QuestionResponse>(
					"/api/questionnaires/get_questionnaire_questions",
					{ questionnaire_id: id },
					{
						headers: { "X-CSRFToken": csrfToken },
						withCredentials: true,
					}
				);
				setQuestions(response.data.questions);
			} catch (error) {
				console.error("Error fetching questions:", error);
			}
		};

		if (id) {
			fetchQuestions();
		}
	}, [id, csrfToken]);

	const fetchShareInfo = async () => {
		if (!id) return;
		try {
			const response = await axios.post<{
				share_questionnaire: ShareQuestionnaire;
			}>(
				"/api/sharing/get_share_questionnaire",
				{ questionnaire_id: id },
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);
			setShareInfo(response.data.share_questionnaire);
		} catch (error) {
			console.error("Error fetching share info:", error);
		}
	};

	useEffect(() => {
		fetchShareInfo();
	}, [id, csrfToken]);

	const handleCreateQuestion = async (values: any) => {
		try {
			await axios.post(
				"/api/questionnaires/create_question",
				{
					questionnaire_id: id,
					text: values.question,
					answer_character_limit: values.answer_character_limit,
					required: values.required || false,
				},
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);

			// Refresh questions list
			const response = await axios.post<QuestionResponse>(
				`/api/questionnaires/get_questionnaire_questions`,
				{
					questionnaire_id: id,
					text: values.question,
					answer_character_limit: values.answer_character_limit,
					required: values.required || false,
				},
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);

			setQuestions(response.data.questions);

			setIsModalVisible(false);
			form.resetFields();
		} catch (error) {
			console.error("Error creating question:", error);
		}
	};

	const handleDeleteQuestion = async (questionId: string) => {
		try {
			await axios.post(
				"/api/questionnaires/delete_question",
				{
					question_id: questionId,
				},
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);

			// Remove the deleted question from state
			const updatedQuestions = questions.filter((q) => q.id !== questionId);
			setQuestions(updatedQuestions);
		} catch (error) {
			console.error("Error deleting question:", error);
		}
	};

	const handleAnalyzeQuestionnaire = async () => {
		if (!id) return;
		setAnalyzing(true);
		try {
			await axios.post(
				"/api/pipelines/analyze_questionnaire",
				{ questionnaire_id: id },
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);
		} catch (error) {
			console.error("Error analyzing questionnaire:", error);
		} finally {
			setAnalyzing(false);
		}
	};

	const handleDeleteQuestionnaire = async () => {
		try {
			await axios.post(
				"/api/questionnaires/delete_questionnaire",
				{ questionnaire_id: id },
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);
			navigate("/discussions");
		} catch (error) {
			console.error("Error deleting questionnaire:", error);
		}
	};

	const handleShareQuestionnaire = async (values: {
		expiration_date: Date;
	}) => {
		if (!id) return;
		setSharing(true);
		try {
			await axios.post(
				"/api/sharing/share_questionnaire",
				{
					questionnaire_id: id,
					expiration_date: values.expiration_date.toISOString().split("T")[0],
				},
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);
			setShareModalVisible(false);
			await fetchShareInfo();
		} catch (error) {
			console.error("Error sharing questionnaire:", error);
		} finally {
			setSharing(false);
		}
	};

	if (loading) {
		return (
			<div className="loading-container">
				<Spin size="large" />
			</div>
		);
	}

	if (error || !questionnaire) {
		return (
			<div className="error-container">
				<Typography.Text type="danger">{error}</Typography.Text>
			</div>
		);
	}

	return (
		<>
			<div className="page-header" style={{ marginBottom: "24px" }}>
				<Breadcrumb
					items={[
						{
							title: <Link to="/discussions">My discussions</Link>,
						},
						{
							title: questionnaire.name,
						},
					]}
				/>
				<div className="page-header-top">
					<Typography.Title level={1} className="page-title">
						{questionnaire?.name || "Discussion"}
					</Typography.Title>
				</div>
			</div>

			<div className="discussion-detail" style={{ marginBottom: "32px" }}>
				<div
					style={{
						display: "flex",
						gap: "48px",
						marginBottom: "24px",
						position: "relative",
					}}
				>
					{/* Left section - Description */}
					<div style={{ flex: 2 }}>
						<Typography.Title level={4} style={{ marginBottom: "16px" }}>
							Description
						</Typography.Title>
						{questionnaire.description && (
							<Typography.Paragraph>
								{questionnaire.description}
							</Typography.Paragraph>
						)}
					</div>

					{/* Right section - Metadata */}
					<div style={{ flex: 1 }}>
						<Typography.Title
							level={4}
							style={{
								marginBottom: "16px",
								textAlign: "right",
								marginRight: "16px",
							}}
						>
							Details
						</Typography.Title>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "8px",
								paddingLeft: "16px",
							}}
						>
							<div
								style={{
									display: "flex",
									gap: "8px",
									justifyContent: "right",
									marginRight: "16px",
								}}
							>
								<Typography.Text type="secondary">Created by:</Typography.Text>
								<Typography.Text>
									User {questionnaire.created_by}
								</Typography.Text>
							</div>
							<div
								style={{
									display: "flex",
									gap: "8px",
									justifyContent: "right",
									marginRight: "16px",
								}}
							>
								<Typography.Text type="secondary">Published:</Typography.Text>
								<Typography.Text>
									{questionnaire.published_at || "Not published"}
								</Typography.Text>
							</div>
							<div
								style={{
									display: "flex",
									gap: "8px",
									justifyContent: "right",
									marginRight: "16px",
								}}
							>
								<Typography.Text type="secondary">Expires:</Typography.Text>
								<Typography.Text>
									{questionnaire.expiration_date || "No expiration date"}
								</Typography.Text>
							</div>

							{shareInfo && (
								<>
									<div
										style={{
											display: "flex",
											gap: "8px",
											justifyContent: "right",
											marginRight: "16px",
											alignItems: "center",
										}}
									>
										<Typography.Text type="secondary">
											Access Code:
										</Typography.Text>
										<Typography.Text copyable>
											{shareInfo.access_code}
										</Typography.Text>
										<QRCodeSVG
											value={`${window.location.origin}/answer?code=${shareInfo.access_code}`}
											size={100}
											style={{ marginLeft: "8px" }}
										/>
									</div>
									<div
										style={{
											display: "flex",
											gap: "8px",
											justifyContent: "right",
											marginRight: "16px",
										}}
									>
										<Typography.Text type="secondary">
											Share Status:
										</Typography.Text>
										<Typography.Text>
											{shareInfo.is_active ? (
												<Tag color="success">Active</Tag>
											) : (
												<Tag color="error">Inactive</Tag>
											)}
										</Typography.Text>
									</div>
									<div
										style={{
											display: "flex",
											gap: "8px",
											justifyContent: "right",
											marginRight: "16px",
										}}
									>
										<Typography.Text type="secondary">
											Share Expires:
										</Typography.Text>
										<Typography.Text>
											{shareInfo.expiration_date}
										</Typography.Text>
									</div>
									<div
										style={{
											display: "flex",
											gap: "8px",
											justifyContent: "right",
											marginRight: "16px",
										}}
									>
										<Typography.Text type="secondary">
											Times Accessed:
										</Typography.Text>
										<Typography.Text>{shareInfo.access_count}</Typography.Text>
									</div>
									{shareInfo.last_accessed && (
										<div
											style={{
												display: "flex",
												gap: "8px",
												justifyContent: "right",
												marginRight: "16px",
											}}
										>
											<Typography.Text type="secondary">
												Last Accessed:
											</Typography.Text>
											<Typography.Text>
												{shareInfo.last_accessed}
											</Typography.Text>
										</div>
									)}
								</>
							)}
						</div>
					</div>
				</div>

				{/* Buttons below both sections */}
				<div style={{ marginTop: "24px" }}>
					<Button
						onClick={() => setShareModalVisible(true)}
						icon={<ShareAltOutlined />}
						style={{ marginRight: "8px" }}
						disabled={shareInfo?.is_active}
						title={
							shareInfo?.is_active
								? "Discussion is already shared"
								: "Share Discussion"
						}
					>
						Share Discussion
					</Button>
					<Button
						onClick={handleAnalyzeQuestionnaire}
						loading={analyzing}
						type="primary"
						style={{ backgroundColor: "#3f65f3", marginRight: "8px" }}
					>
						Analyze Discussion
					</Button>
					<Button danger onClick={() => setDeleteModalVisible(true)}>
						Delete Discussion
					</Button>

					<Modal
						title="Share Discussion"
						open={shareModalVisible}
						onCancel={() => setShareModalVisible(false)}
						footer={null}
					>
						<Form onFinish={handleShareQuestionnaire} layout="vertical">
							<Form.Item
								name="expiration_date"
								label="Expiration Date"
								rules={[
									{
										required: true,
										message: "Please select an expiration date",
									},
								]}
							>
								<DatePicker style={{ width: "100%" }} />
							</Form.Item>
							<Form.Item>
								<Button type="primary" htmlType="submit" loading={sharing}>
									Share
								</Button>
							</Form.Item>
						</Form>
					</Modal>

					<Modal
						title="Delete Discussion"
						open={deleteModalVisible}
						onOk={handleDeleteQuestionnaire}
						onCancel={() => setDeleteModalVisible(false)}
						okText="Delete"
						okButtonProps={{ danger: true }}
					>
						<p>
							Are you sure you want to delete this discussion? This action
							cannot be undone.
						</p>
					</Modal>
				</div>
			</div>

			<div className="questions-section">
				<div
					className="questions-header"
					style={{
						marginBottom: "24px",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Typography.Title level={3} style={{ marginBottom: 0 }}>
						Questions
					</Typography.Title>
					<Button
						type="primary"
						icon={<PlusOutlined />}
						onClick={() => setIsModalVisible(true)}
						style={{ backgroundColor: "#3f65f3" }}
					>
						Add Question
					</Button>
				</div>

				<List
					className="questions-list"
					itemLayout="vertical"
					dataSource={questions}
					style={{ marginTop: "16px" }}
					renderItem={(question) => (
						<List.Item>
							<div
								className="question-item"
								onClick={() =>
									navigate(`/discussions/${id}/questions/${question.id}`)
								}
							>
								<div className="question-content">
									<div className="question-header">
										<Typography.Text strong>
											{question.question}
										</Typography.Text>
										<Button
											type="text"
											danger
											icon={<DeleteOutlined />}
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteQuestion(question.id);
											}}
										/>
									</div>
									<div className="question-meta">
										{question.required && <Tag color="red">Required</Tag>}
										<Typography.Text type="secondary">
											Character limit: {question.answer_character_limit}
										</Typography.Text>
									</div>
								</div>
							</div>
						</List.Item>
					)}
				/>

				<Modal
					title="Add New Question"
					open={isModalVisible}
					onCancel={() => setIsModalVisible(false)}
					footer={null}
				>
					<Form form={form} onFinish={handleCreateQuestion} layout="vertical">
						<Form.Item
							name="question"
							label="Question Text"
							rules={[
								{ required: true, message: "Please enter the question text" },
							]}
						>
							<Input.TextArea />
						</Form.Item>

						<Form.Item
							name="answer_character_limit"
							label="Answer Character Limit"
							rules={[
								{ required: true, message: "Please enter a character limit" },
							]}
						>
							<InputNumber min={1} />
						</Form.Item>

						<Form.Item name="required" valuePropName="checked">
							<Switch checkedChildren="Required" unCheckedChildren="Optional" />
						</Form.Item>

						<Form.Item>
							<Button type="primary" htmlType="submit">
								Create Question
							</Button>
						</Form.Item>
					</Form>
				</Modal>
			</div>
		</>
	);
};

export default DiscussionDetailPage;
