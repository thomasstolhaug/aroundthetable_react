import React, { useEffect, useState } from "react";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import {
	Typography,
	Breadcrumb,
	Spin,
	Tag,
	Card,
	Table,
	Button,
	Popconfirm,
	List,
	Collapse,
	Modal,
	Form,
	Input,
	Divider,
} from "antd";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useCsrf } from "../../context/CsrfProvider";
import "./QuestionDetailPage.css";
import type { TableProps } from "antd";

interface Question {
	id: string;
	question: string;
	answer_character_limit: number;
	questionnaire: string;
	required: boolean;
}

interface Answer {
	id: string;
	question: string;
	answer: string;
	created_at: string;
	created_by: number;
}

interface Component {
	component_id: string;
	text: string;
	improved_text: string | null;
	index: number;
	categories: {
		name: string;
		category_summary: string;
	}[];
}

interface AnswerWithComponents {
	answer_id: string;
	answer_text: string;
	components: Component[];
}

interface Questionnaire {
	id: string;
	name: string;
}

const QuestionDetailPage: React.FC = () => {
	const { csrfToken } = useCsrf();
	const { questionId } = useParams();
	const [loading, setLoading] = useState(true);
	const [question, setQuestion] = useState<Question | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [answers, setAnswers] = useState<Answer[]>([]);
	const [loadingAnswers, setLoadingAnswers] = useState(false);
	const [summary, setSummary] = useState<string | null>(null);
	const [loadingSummary, setLoadingSummary] = useState(false);
	const [answersWithComponents, setAnswersWithComponents] = useState<
		AnswerWithComponents[]
	>([]);
	const [loadingComponents, setLoadingComponents] = useState(false);
	const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(
		null
	);
	const [loadingQuestionnaire, setLoadingQuestionnaire] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [form] = Form.useForm();
	const [submitting, setSubmitting] = useState(false);
	// New state to control the number of answers shown
	const [showAllAnswers, setShowAllAnswers] = useState(false);

	useEffect(() => {
		const fetchQuestion = async () => {
			try {
				if (!csrfToken) return;

				const response = await axios.post(
					"/api/questionnaires/get_question_by_id",
					{ question_id: questionId },
					{
						headers: { "X-CSRFToken": csrfToken },
						withCredentials: true,
					}
				);
				setQuestion(response.data.question);
			} catch (err) {
				console.error("Error fetching question:", err);
				setError("Failed to load question");
			} finally {
				setLoading(false);
			}
		};

		if (questionId) {
			fetchQuestion();
		}
	}, [questionId, csrfToken]);

	useEffect(() => {
		const fetchAnswers = async () => {
			if (!csrfToken || !questionId) return;
			setLoadingAnswers(true);

			try {
				const response = await axios.post(
					"/api/questionnaires/get_answers_to_question",
					{ question_id: questionId },
					{
						headers: { "X-CSRFToken": csrfToken },
						withCredentials: true,
					}
				);
				setAnswers(response.data.answers);
			} catch (error) {
				console.error("Error fetching answers:", error);
			} finally {
				setLoadingAnswers(false);
			}
		};

		fetchAnswers();
	}, [questionId, csrfToken]);

	useEffect(() => {
		const fetchSummary = async () => {
			if (!csrfToken || !questionId) return;
			setLoadingSummary(true);

			try {
				const response = await axios.post(
					"/api/summaries/get_answer_summary",
					{ question_id: questionId },
					{
						headers: { "X-CSRFToken": csrfToken },
						withCredentials: true,
					}
				);
				setSummary(response.data.summary);
			} catch (error) {
				console.error("Error fetching summary:", error);
			} finally {
				setLoadingSummary(false);
			}
		};

		fetchSummary();
	}, [questionId, csrfToken]);

	useEffect(() => {
		const fetchAnswersWithComponents = async () => {
			if (!csrfToken || !questionId) return;
			setLoadingComponents(true);

			try {
				const response = await axios.post(
					"/api/components/get_answers_with_components_and_categories",
					{ question_id: questionId },
					{
						headers: { "X-CSRFToken": csrfToken },
						withCredentials: true,
					}
				);
				setAnswersWithComponents(response.data.answers);
			} catch (error) {
				console.error("Error fetching components:", error);
			} finally {
				setLoadingComponents(false);
			}
		};

		fetchAnswersWithComponents();
	}, [questionId, csrfToken]);

	useEffect(() => {
		const fetchQuestionnaire = async () => {
			if (!csrfToken || !question?.questionnaire) return;
			setLoadingQuestionnaire(true);

			try {
				const response = await axios.post(
					"/api/questionnaires/get_questionnaire_by_id",
					{ questionnaire_id: question.questionnaire },
					{
						headers: { "X-CSRFToken": csrfToken },
						withCredentials: true,
					}
				);
				setQuestionnaire(response.data.questionnaire);
			} catch (error) {
				console.error("Error fetching questionnaire:", error);
			} finally {
				setLoadingQuestionnaire(false);
			}
		};

		fetchQuestionnaire();
	}, [question?.questionnaire, csrfToken]);

	const handleDeleteAnswer = async (answerId: string) => {
		try {
			await axios.post(
				"/api/questionnaires/delete_answer",
				{ answer_id: answerId },
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);
			setAnswers(answers.filter((a) => a.id !== answerId));
		} catch (error) {
			console.error("Error deleting answer:", error);
		}
	};

	const columns: TableProps<Answer>["columns"] = [
		{
			title: "Answer",
			dataIndex: "answer",
			key: "answer",
			ellipsis: true,
			width: "90%",
		},
		{
			title: "",
			key: "actions",
			width: "10%",
			render: (_, record) => (
				<Popconfirm
					title="Delete this answer?"
					description="This action cannot be undone."
					onConfirm={() => handleDeleteAnswer(record.id)}
					okText="Yes"
					cancelText="No"
				>
					<Button type="text" danger icon={<DeleteOutlined />} />
				</Popconfirm>
			),
		},
	];

	const categoryColumns: TableProps<any>["columns"] = [
		{
			title: "Category",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "Components",
			dataIndex: "count",
			key: "count",
			render: (count: number) => <Tag>{count}</Tag>,
		},
	];

	const getCategoriesWithComponents = () => {
		const categoryMap = new Map<
			string,
			{ components: Component[]; summary: string }
		>();

		if (!answersWithComponents?.length) return [];

		// Flatten all components from all answers and group by category
		answersWithComponents.forEach((answer) => {
			answer.components.forEach((component) => {
				component.categories.forEach((category) => {
					if (!categoryMap.has(category.name)) {
						categoryMap.set(category.name, {
							components: [],
							summary: category.category_summary,
						});
					}
					categoryMap.get(category.name)?.components.push(component);
				});
			});
		});

		return Array.from(categoryMap.entries()).map(([category, data]) => ({
			key: category,
			name: category,
			components: data.components,
			summary: data.summary,
			count: data.components.length,
		}));
	};

	const showModal = () => {
		setIsModalVisible(true);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		form.resetFields();
	};

	const handleSubmit = async () => {
		try {
			setSubmitting(true);
			const values = await form.validateFields();

			await axios.post(
				"/api/questionnaires/create_answer",
				{
					question_id: questionId,
					text: values.answer,
				},
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);

			// Refresh the answers list
			const response = await axios.post(
				"/api/questionnaires/get_answers_to_question",
				{ question_id: questionId },
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);
			const questionAnswers = response.data.answers.filter(
				(a: Answer) => a.question === questionId
			);
			setAnswers(questionAnswers);

			// Close modal and reset form
			setIsModalVisible(false);
			form.resetFields();
		} catch (error) {
			console.error("Error creating answer:", error);
		} finally {
			setSubmitting(false);
		}
	};

	const truncateText = (text: string, limit: number = 50) => {
		return text.length > limit ? text.substring(0, limit - 3) + "..." : text;
	};

	// Only show the first 5 answers by default unless "See More" is clicked
	const displayedAnswers = showAllAnswers ? answers : answers.slice(0, 5);

	if (loading)
		return (
			<div className="page-container">
				<Spin />
			</div>
		);
	if (error || !question)
		return (
			<div className="page-container">
				<Typography.Text type="danger">{error}</Typography.Text>
			</div>
		);

	return (
		<div className="page-container">
			<div className="page-header">
				<Breadcrumb
					items={[
						{ title: <Link to="/discussions">My discussions</Link> },
						{
							title: (
								<Link to={`/discussions/${question.questionnaire}`}>
									{loadingQuestionnaire ? (
										<Spin size="small" />
									) : (
										truncateText(questionnaire?.name || question.questionnaire)
									)}
								</Link>
							),
						},
						{ title: truncateText(question.question) },
					]}
				/>
				<Typography.Title level={1} className="page-title">
					{question.question}
				</Typography.Title>
			</div>

			{/* Answers Section moved to the top */}
			<Card className="answers-section section-card">
				<Typography.Title level={4}>
					Answers <Tag>{answers.length}</Tag>
				</Typography.Title>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={showModal}
					style={{ marginBottom: "16px", marginTop: "16px" }}
				>
					Add answer
				</Button>
				<Table
					columns={columns}
					dataSource={displayedAnswers}
					rowKey="id"
					loading={loadingAnswers}
					pagination={{
						pageSize: 20,
						showSizeChanger: false,
					}}
					scroll={{ x: true }}
				/>
				{!showAllAnswers && answers.length > 5 && (
					<div style={{ textAlign: "center", marginTop: "16px" }}>
						<Button type="link" onClick={() => setShowAllAnswers(true)}>
							See More
						</Button>
					</div>
				)}
				<Modal
					title="Add Answer"
					open={isModalVisible}
					onCancel={handleCancel}
					footer={[
						<Button key="cancel" onClick={handleCancel}>
							Cancel
						</Button>,
						<Button
							key="submit"
							type="primary"
							loading={submitting}
							onClick={handleSubmit}
						>
							Submit
						</Button>,
					]}
				>
					<Form form={form} layout="vertical">
						<Form.Item
							name="answer"
							label="Your Answer"
							rules={[
								{ required: true, message: "Please input your answer!" },
								{
									max: question?.answer_character_limit || 2000,
									message: `Answer cannot exceed ${
										question?.answer_character_limit || 2000
									} characters`,
								},
							]}
						>
							<Input.TextArea rows={4} />
						</Form.Item>
					</Form>
				</Modal>
			</Card>

			<Card className="summary-section section-card">
				<Typography.Title level={4}>Summary</Typography.Title>
				{loadingSummary ? (
					<Spin />
				) : summary ? (
					<Typography.Paragraph>{summary}</Typography.Paragraph>
				) : (
					<Typography.Text type="secondary">
						No summary available
					</Typography.Text>
				)}
			</Card>

			<Card
				className="categories-section section-card"
				style={{ marginBottom: "200px" }}
			>
				<Typography.Title level={4}>Categories & insights</Typography.Title>
				<Table
					columns={categoryColumns}
					dataSource={getCategoriesWithComponents()}
					rowKey="key"
					loading={loadingComponents}
					expandable={{
						expandedRowRender: (record) => (
							<List>
								<List.Item>
									<Collapse style={{ width: "100%" }} defaultActiveKey={[]}>
										<Collapse.Panel header="Summary" key="1">
											<Typography.Paragraph>
												{record.summary}
											</Typography.Paragraph>
										</Collapse.Panel>
										<Collapse.Panel
											header={`Talking Points (${record.count})`}
											key="2"
										>
											<List
												dataSource={record.components}
												renderItem={(component: Component) => (
													<div key={component.component_id}>
														<Typography.Text>{component.text}</Typography.Text>
														<Divider style={{ margin: "8px 0" }} />
													</div>
												)}
											/>
										</Collapse.Panel>
									</Collapse>
								</List.Item>
							</List>
						),
					}}
					pagination={false}
				/>
			</Card>
		</div>
	);
};

export default QuestionDetailPage;
