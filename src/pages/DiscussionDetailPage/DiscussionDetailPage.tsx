import React, { useEffect, useState } from "react";
import {
	Typography,
	Breadcrumb,
	Spin,
	Button,
	List,
	Modal,
	Form,
	Input,
	Switch,
	DatePicker,
	message,
	Divider,
	Progress, // <-- Import the Ant Design Progress component
} from "antd";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./DiscussionDetailPage.css";
import { useCsrf } from "../../context/CsrfProvider";
import {
	PlusOutlined,
	ShareAltOutlined,
	DeleteOutlined,
} from "@ant-design/icons";
import { QRCodeSVG } from "qrcode.react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useUser } from "../../context/UserContext";

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

// Define the structure of each pipeline’s data from the new endpoint.
interface PipelineInfo {
	pipeline_id: string;
	progress: number;
	status: string;
}

const DiscussionDetailPage: React.FC = () => {
	const { csrfToken } = useCsrf();
	const { socket } = useUser();
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

	// New state for question deletion confirmation
	const [questionDeleteModalVisible, setQuestionDeleteModalVisible] =
		useState(false);
	const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

	// New state: to track if analysis has started
	const [analysisStarted, setAnalysisStarted] = useState(false);
	// New state: to store pipeline details for each question.
	// This maps a question_id to its pipeline info (id, progress, and status).
	const [pipelineData, setPipelineData] = useState<
		Record<string, PipelineInfo>
	>({});

	// -------------------- Fetch Questionnaire --------------------
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

	// -------------------- Fetch Questions --------------------
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

	// -------------------- Fetch Share Info --------------------
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

	// -------------------- Fetch Pipeline Details at Mount --------------------
	useEffect(() => {
		const fetchPipelineDetails = async () => {
			if (!id) return;
			try {
				const response = await axios.post(
					"/api/pipelines/get_pipeline_details",
					{ questionnaire_id: id },
					{
						headers: { "X-CSRFToken": csrfToken },
						withCredentials: true,
					}
				);
				// Expected response: { pipelines: [{ pipeline_id, question_id, progress, status }, ...] }
				const newData: Record<string, PipelineInfo> = {};
				response.data.pipelines.forEach(
					(pipeline: {
						pipeline_id: string;
						question_id: string;
						progress: number;
						status: string;
					}) => {
						newData[pipeline.question_id] = {
							pipeline_id: pipeline.pipeline_id,
							progress: pipeline.progress,
							status: pipeline.status,
						};
					}
				);
				setPipelineData(newData);
			} catch (error) {
				console.error("Error fetching pipeline details:", error);
			}
		};

		fetchPipelineDetails();
	}, [id, csrfToken]);

	// -------------------- WebSocket for Pipeline Progress Updates --------------------
	useEffect(() => {
		if (!socket || !analysisStarted) return;
		const handleMessage = (event: MessageEvent) => {
			try {
				const data = JSON.parse(event.data);
				// Expecting messages with at least: question_id and progress_stage.
				// Optionally, they may include a "status" field.
				if (data && data.question_id && data.progress_stage !== undefined) {
					setPipelineData((prev) => ({
						...prev,
						[data.question_id]: {
							// Preserve existing pipeline_id if available
							pipeline_id: prev[data.question_id]?.pipeline_id || "",
							progress: Number(data.progress_stage),
							status:
								data.status || prev[data.question_id]?.status || "running",
						},
					}));
				}
			} catch (error) {
				console.error("Error parsing WebSocket message", error);
			}
		};

		socket.addEventListener("message", handleMessage);
		return () => {
			socket.removeEventListener("message", handleMessage);
		};
	}, [socket, analysisStarted]);

	// -------------------- Create Question --------------------
	const handleCreateQuestion = async (values: any) => {
		try {
			await axios.post(
				"/api/questionnaires/create_question",
				{
					questionnaire_id: id,
					text: values.question,
					required: values.required || false,
				},
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);

			// Refresh questions list
			const response = await axios.post<QuestionResponse>(
				"/api/questionnaires/get_questionnaire_questions",
				{ questionnaire_id: id },
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

	// -------------------- Delete Question --------------------
	const handleDeleteQuestion = async (questionId: string) => {
		try {
			await axios.post(
				"/api/questionnaires/delete_question",
				{ question_id: questionId },
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);
			const updatedQuestions = questions.filter((q) => q.id !== questionId);
			setQuestions(updatedQuestions);
		} catch (error) {
			console.error("Error deleting question:", error);
		}
	};

	// -------------------- Analyze Questionnaire --------------------
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
			const response = await axios.post(
				"/api/pipelines/analyze_questionnaire",
				{ questionnaire_id: id },
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);
			// Subscribe to the progress updates for this questionnaire via WebSocket
			const groupId = `group_analyze_${id}`;
			socket?.send(
				JSON.stringify({
					action: "subscribe",
					groups: [groupId],
				})
			);
			message.success(
				response.data.message || "Analysis started successfully."
			);
			setAnalysisModalVisible(false);
			// Mark that the analysis has started so we can show progress bars
			setAnalysisStarted(true);
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

	// -------------------- Delete Questionnaire --------------------
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

	// -------------------- Sharing Functions --------------------
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

	// Updated: expiration_date is now optional
	const handleShareQuestionnaire = async (values: {
		expiration_date?: Date;
	}) => {
		if (!id) return;
		setSharing(true);
		try {
			// Only add expiration_date if it exists
			const data: any = { questionnaire_id: id };
			if (values.expiration_date) {
				data.expiration_date = values.expiration_date.toISOString();
			}
			const response = await axios.post("/api/share/enable_sharing", data, {
				headers: { "X-CSRFToken": csrfToken },
				withCredentials: true,
			});
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

	// -------------------- Render --------------------
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
						{ title: <Link to="/discussions">My discussions</Link> },
						{ title: questionnaire.name },
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
					<div
						className="discussion-card"
						style={{ height: "100%", minHeight: "40px" }}
					>
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
						</div>
					</div>
				</div>
			</div>

			{/* If discussion is shared, display the share details box below the discussion */}
			{activeShare && (
				<div className="share-details-container" style={{ marginTop: "24px" }}>
					<div
						className="discussion-card share-box"
						style={{
							minHeight: "40px",
							display: "flex",
							alignItems: "flex-start",
							justifyContent: "space-between",
							flexWrap: "wrap",
						}}
					>
						<div
							className="share-details-left"
							style={{ flex: "1", minWidth: "250px" }}
						>
							<Typography.Title level={4}>Share Details</Typography.Title>
							<div style={{ marginBottom: "16px" }}>
								<Typography.Text strong>Access Code: </Typography.Text>
								<Typography.Text copyable>
									{activeShare.access_code}
								</Typography.Text>
							</div>
							<div>
								<Typography.Text strong>Share Link: </Typography.Text>
								<Typography.Text copyable>
									{`${window.location.origin}/answer?code=${activeShare.access_code}`}
								</Typography.Text>
							</div>
						</div>
						<div className="share-details-right" style={{ marginLeft: "16px" }}>
							<Typography.Text strong>QR Code:</Typography.Text>
							<div style={{ marginTop: "8px" }}>
								<QRCodeSVG
									value={`${window.location.origin}/answer?code=${activeShare.access_code}`}
									size={150}
								/>
							</div>
						</div>
					</div>
				</div>
			)}

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
					renderItem={(question, index) => (
						<List.Item>
							{/* Wrap the card and the progress bar together */}
							<div>
								<div
									className="question-card"
									style={{ position: "relative", minHeight: "40px" }}
									onClick={() =>
										navigate(`/discussions/${id}/questions/${question.id}`)
									}
								>
									{/* Delete Icon positioned at the top right */}
									<Button
										type="text"
										onClick={(e) => {
											e.stopPropagation();
											setQuestionToDelete(question.id);
											setQuestionDeleteModalVisible(true);
										}}
										icon={
											<DeleteOutlined
												style={{ color: "red", fontSize: "16px" }}
											/>
										}
										style={{ position: "absolute", top: "8px", right: "8px" }}
									/>
									<div
										className="question-card-header"
										style={{ display: "flex", alignItems: "center" }}
									>
										<div
											className="question-number"
											style={{
												fontSize: "24px",
												fontWeight: "bold",
												marginRight: "8px",
											}}
										>
											{index + 1}.
										</div>
										<div className="question-title">
											<Typography.Text strong>
												{question.question}
												{question.required && (
													<span style={{ color: "red" }}> *</span>
												)}
											</Typography.Text>
										</div>
									</div>
								</div>
								{/* Render the progress bar below the question card if analysis has started or pipeline data is available */}
								{(analysisStarted ||
									pipelineData[question.id] !== undefined) && (
									<div onClick={(e) => e.stopPropagation()}>
										<Progress
											percent={pipelineData[question.id]?.progress || 0}
											showInfo
											status={
												pipelineData[question.id]?.status === "failed"
													? "exception"
													: pipelineData[question.id]?.status === "completed"
													? "success"
													: "active"
											}
											style={{
												width: "100%",
												marginBottom: "40px",
											}}
										/>
									</div>
								)}
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
							label="Question"
							rules={[
								{ required: true, message: "Please enter the question text" },
							]}
						>
							<Input.TextArea placeholder="How can we improve our service?" />
						</Form.Item>

						{/* Removed the Answer Character Limit field */}

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

			{/* Divider above the tucked-away Delete Discussion button */}
			<Divider />

			{/* Tucked-away Delete Discussion Button at the bottom */}
			<div style={{ textAlign: "center", marginTop: "100px" }}>
				<Button type="link" danger onClick={() => setDeleteModalVisible(true)}>
					Delete Discussion
				</Button>
			</div>

			{/* Share Modal */}
			<Modal
				title="Share Discussion"
				open={shareModalVisible}
				onCancel={() => setShareModalVisible(false)}
				footer={null}
			>
				<Form onFinish={handleShareQuestionnaire} layout="vertical">
					<Form.Item name="expiration_date" label="Expiration Date (Optional)">
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
							{ required: true, message: "Please select an expiration date" },
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
						will not collect answers.
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

			{/* Question Delete Confirmation Modal */}
			<Modal
				title="Delete Question"
				open={questionDeleteModalVisible}
				onOk={() => {
					if (questionToDelete) {
						handleDeleteQuestion(questionToDelete);
					}
					setQuestionDeleteModalVisible(false);
					setQuestionToDelete(null);
				}}
				onCancel={() => {
					setQuestionDeleteModalVisible(false);
					setQuestionToDelete(null);
				}}
				okText="Delete"
				okButtonProps={{ danger: true }}
			>
				<p>
					Are you sure you want to delete this question? This action cannot be
					undone.
				</p>
			</Modal>
		</>
	);
};

export default DiscussionDetailPage;
