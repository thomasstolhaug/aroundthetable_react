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
	message,
} from "antd";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./DiscussionDetailPage.css";
import { useCsrf } from "../../context/CsrfProvider";
import {
	PlusOutlined,
	DeleteOutlined,
	ShareAltOutlined,
	EditOutlined,
	QrcodeOutlined,
} from "@ant-design/icons";
import { QRCodeSVG } from "qrcode.react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface QuestionnaireResponse {
	questionnaire: {
		id: string;
		name: string;
		description: string;
		completed_at: string | null;
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
	questionnaire_id: string;
	access_code: string;
	expiration_date: string;
	is_active: boolean;
	created_at: string;
	created_by: number;
}

interface ShareResponse {
	active_share: ShareQuestionnaire | null;
}

interface AnalysisResponse {
	message: string;
	questions_not_answered?: string[];
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
	const [activeShare, setActiveShare] = useState<ShareQuestionnaire | null>(
		null
	);
	const [sharing, setSharing] = useState(false);
	const [editExpirationModalVisible, setEditExpirationModalVisible] =
		useState(false);
	const [updatingExpiration, setUpdatingExpiration] = useState(false);
	const [analysisModalVisible, setAnalysisModalVisible] = useState(false);
	const [analysisResponse, setAnalysisResponse] =
		useState<AnalysisResponse | null>(null);
	const [startingAnalysis, setStartingAnalysis] = useState(false);
	const [qrModalVisible, setQrModalVisible] = useState(false);

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
			const response = await axios.post<ShareResponse>(
				"/api/share/get_share_info",
				{ questionnaire_id: id },
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);
			setActiveShare(response.data.active_share);
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
			const response = await axios.post<AnalysisResponse>(
				"/api/pipelines/pre_analyze_control",
				{ questionnaire_id: id },
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);

			// If server returned success data, proceed
			setAnalysisResponse(response.data);
			setAnalysisModalVisible(true);
		} catch (error: any) {
			console.error("Error checking questionnaire readiness:", error);
			if (axios.isAxiosError(error) && error.response?.data?.error) {
				message.error(error.response.data.error);
			} else {
				message.error("Failed to check questionnaire status.");
			}
		} finally {
			setAnalyzing(false);
		}
	};

	const handleStartAnalysis = async () => {
		if (!id) return;
		setStartingAnalysis(true);

		try {
			// Make the POST request to analyze_questionnaire
			const response = await axios.post(
				"/api/pipelines/analyze_questionnaire",
				{ questionnaire_id: id },
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);

			message.success(
				response.data.message || "Analysis started successfully."
			);
			setAnalysisModalVisible(false);
		} catch (error: any) {
			console.error("Error starting analysis:", error);

			if (axios.isAxiosError(error) && error.response?.data?.error) {
				message.error(error.response.data.error);
			} else {
				message.error("Failed to start analysis.");
			}
		} finally {
			setStartingAnalysis(false);
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

	const handleDisableSharing = async () => {
		if (!id) return;
		try {
			await axios.post(
				"/api/share/disable_sharing",
				{ questionnaire_id: id },
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);
			await fetchShareInfo();
		} catch (error) {
			console.error("Error disabling share:", error);
		}
	};

	const handleShareQuestionnaire = async (values: {
		expiration_date: Date;
	}) => {
		if (!id) return;
		setSharing(true);

		try {
			const response = await axios.post(
				"/api/share/enable_sharing",
				{
					questionnaire_id: id,
					expiration_date: values.expiration_date.toISOString(),
				},
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);

			if (response.data.cannot_share) {
				message.error(response.data.cannot_share);
			} else {
				if (response.data.message) {
					message.success(response.data.message);
				}
				await fetchShareInfo();
			}

			setShareModalVisible(false);
		} catch (error) {
			console.error("Error sharing questionnaire:", error);
			message.error("Failed to share questionnaire");
		} finally {
			setSharing(false);
		}
	};

	const handleUpdateShareExpiration = async (values: {
		expiration_date: Date;
	}) => {
		if (!id) return;
		setUpdatingExpiration(true);
		try {
			await axios.post(
				"/api/share/update_share_expiration_date",
				{
					questionnaire_id: id,
					expiration_date: values.expiration_date.toISOString(),
				},
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);
			setEditExpirationModalVisible(false);
			await fetchShareInfo();
		} catch (error) {
			console.error("Error updating expiration date:", error);
		} finally {
			setUpdatingExpiration(false);
		}
	};

	const disablePastDates = (current: dayjs.Dayjs) => {
		return current && current < dayjs().startOf("day");
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
			<div className="page-header">
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

			{/* Grid layout with 2 columns on desktop, 1 column below 1050px */}
			<div className="discussion-layout">
				{/* Main content */}
				<div className="discussion-container">
					<div className="discussion-card" style={{ height: "100%" }}>
						<Typography.Title level={4} style={{ marginBottom: "16px" }}>
							Description
						</Typography.Title>
						{questionnaire.description && (
							<Typography.Paragraph>
								{questionnaire.description}
							</Typography.Paragraph>
						)}

						<div style={{ marginTop: "24px" }} className="discussion-actions">
							{activeShare ? (
								<Button
									onClick={handleDisableSharing}
									icon={<ShareAltOutlined />}
									danger
								>
									Stop Sharing Discussion
								</Button>
							) : (
								<Button
									onClick={() => setShareModalVisible(true)}
									icon={<ShareAltOutlined />}
								>
									Share Discussion
								</Button>
							)}

							<Button
								onClick={handleAnalyzeQuestionnaire}
								loading={analyzing}
								type="primary"
								style={{ backgroundColor: "#3f65f3" }}
							>
								Analyze Discussion
							</Button>

							<Button danger onClick={() => setDeleteModalVisible(true)}>
								Delete Discussion
							</Button>
						</div>
					</div>
				</div>

				{/* Sidebar/Details */}
				<div className="discussion-container">
					{activeShare && (
						<div className="discussion-card" style={{ height: "100%" }}>
							<Typography.Title level={4} className="share-details-title">
								Share Details
							</Typography.Title>

							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "8px",
									alignItems: "center",
								}}
							>
								{/* Access Code */}
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										width: "100%",
									}}
								>
									<Typography.Text type="secondary">
										Access Code:
									</Typography.Text>
									<Typography.Text copyable>
										{activeShare.access_code}
									</Typography.Text>
								</div>

								{/* QR Code (button) */}
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										width: "100%",
									}}
								>
									<Typography.Text type="secondary">
										QR Code (click):
									</Typography.Text>
									<Button
										type="text"
										icon={<QrcodeOutlined />}
										onClick={() => setQrModalVisible(true)}
									/>
								</div>

								{/* Expiration Date with Edit */}
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										width: "100%",
									}}
								>
									<Typography.Text type="secondary">Expires:</Typography.Text>
									<div style={{ display: "flex", alignItems: "center" }}>
										<Typography.Text>
											{dayjs(activeShare.expiration_date).format("MMM D, YYYY")}
										</Typography.Text>
										<Button
											type="text"
											icon={<EditOutlined />}
											onClick={(e) => {
												e.stopPropagation();
												setEditExpirationModalVisible(true);
											}}
										/>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Questions Section */}
			<div className="questions-section">
				<div className="questions-header">
					<Typography.Title level={3} style={{ marginBottom: 0 }}>
						Questions
					</Typography.Title>
					<Button
						type="primary"
						icon={<PlusOutlined />}
						onClick={() => setIsModalVisible(true)}
						style={{ backgroundColor: "#3f65f3", marginRight: "16px" }}
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

				{/* Add Question Modal */}
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

			{/* Share Modal */}
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
						<DatePicker
							style={{ width: "100%" }}
							disabledDate={disablePastDates}
						/>
					</Form.Item>
					<Form.Item>
						<Button type="primary" htmlType="submit" loading={sharing}>
							Share
						</Button>
					</Form.Item>
				</Form>
			</Modal>

			{/* Delete Discussion Modal */}
			<Modal
				title="Delete Discussion"
				open={deleteModalVisible}
				onOk={handleDeleteQuestionnaire}
				onCancel={() => setDeleteModalVisible(false)}
				okText="Delete"
				okButtonProps={{ danger: true }}
			>
				<p>
					Are you sure you want to delete this discussion? This action cannot be
					undone.
				</p>
			</Modal>

			{/* Update Share Expiration Modal */}
			<Modal
				title="Update Share Expiration"
				open={editExpirationModalVisible}
				onCancel={() => setEditExpirationModalVisible(false)}
				footer={null}
			>
				<Form onFinish={handleUpdateShareExpiration} layout="vertical">
					<Form.Item
						name="expiration_date"
						label="New Expiration Date"
						rules={[
							{
								required: true,
								message: "Please select an expiration date",
							},
						]}
					>
						<DatePicker
							style={{ width: "100%" }}
							disabledDate={disablePastDates}
						/>
					</Form.Item>
					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							loading={updatingExpiration}
						>
							Update Expiration
						</Button>
					</Form.Item>
				</Form>
			</Modal>

			{/* Analysis Confirmation Modal */}
			<Modal
				title="Are you sure you want to analyze the discussion?"
				open={analysisModalVisible}
				onCancel={() => setAnalysisModalVisible(false)}
				footer={[
					<Button key="cancel" onClick={() => setAnalysisModalVisible(false)}>
						Cancel
					</Button>,
					<Button
						key="analyze"
						type="primary"
						loading={startingAnalysis}
						onClick={handleStartAnalysis}
					>
						Start Analysis
					</Button>,
				]}
			>
				<div style={{ marginBottom: 16 }}>
					<Typography.Text>
						Once the analysis is started, the discussion is marked as closed and
						will not collect answers.{" "}
					</Typography.Text>
					<br />
					<br />
					<Typography.Text>{analysisResponse?.message}</Typography.Text>
				</div>
				{analysisResponse?.questions_not_answered &&
					analysisResponse.questions_not_answered.length > 0 && (
						<div>
							<Typography.Text strong>
								Questions without answers:
							</Typography.Text>
							<ul>
								{analysisResponse.questions_not_answered.map(
									(question, idx) => (
										<li key={idx}>{question}</li>
									)
								)}
							</ul>
						</div>
					)}
			</Modal>

			{/* QR Code Modal */}
			<Modal
				title="QR Code"
				open={qrModalVisible}
				onCancel={() => setQrModalVisible(false)}
				footer={null}
				centered
			>
				<div
					style={{ display: "flex", justifyContent: "center", padding: "24px" }}
				>
					<QRCodeSVG
						value={`${window.location.origin}/answer?code=${activeShare?.access_code}`}
						size={200}
					/>
				</div>
			</Modal>
		</>
	);
};

export default DiscussionDetailPage;
