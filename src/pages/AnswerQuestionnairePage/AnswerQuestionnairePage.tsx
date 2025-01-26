import React, { useState, useEffect } from "react";
import { Card, Form, Input, Button, Typography, message, Spin } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useCsrf } from "../../context/CsrfProvider";
import "./AnswerQuestionnairePage.css";

interface Question {
	id: string;
	question: string;
	required: boolean;
	answer_character_limit: number;
}

interface Questionnaire {
	id: string;
	name: string;
	description: string;
	questions: Question[];
}

const AnswerQuestionnairePage: React.FC = () => {
	const [searchParams] = useSearchParams();
	const accessCode = searchParams.get("code");
	const navigate = useNavigate();
	const { csrfToken } = useCsrf();
	const [form] = Form.useForm();

	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(
		null
	);

	useEffect(() => {
		const fetchQuestionnaire = async () => {
			if (!accessCode) {
				message.error("No access code provided");
				navigate("/access");
				return;
			}

			try {
				const response = await axios.post(
					"/api/share/validate_access_code",
					{ access_code: accessCode },
					{
						headers: { "X-CSRFToken": csrfToken },
						withCredentials: true,
					}
				);

				setQuestionnaire(response.data.questionnaire);
			} catch (error: any) {
				message.error(
					error.response?.data?.error || "Failed to load questionnaire"
				);
				navigate("/access");
			} finally {
				setLoading(false);
			}
		};

		fetchQuestionnaire();
	}, [accessCode, csrfToken, navigate]);

	const onFinish = async (values: Record<string, string>) => {
		setSubmitting(true);
		try {
			const answers = Object.entries(values).map(([questionId, answer]) => ({
				question_id: questionId,
				answer,
			}));

			await axios.post(
				"/api/share/submit_answers",
				{
					access_code: accessCode,
					answers,
				},
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);

			message.success("Thank you for your answers!");
			navigate("/access");
		} catch (error: any) {
			message.error(error.response?.data?.error || "Failed to submit answers");
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="answer-questionnaire-page">
				<Spin size="large" />
			</div>
		);
	}

	if (!questionnaire) {
		return null;
	}

	return (
		<div className="answer-questionnaire-page">
			<Card className="questionnaire-card">
				<Typography.Title level={2}>{questionnaire.name}</Typography.Title>
				<Typography.Paragraph>{questionnaire.description}</Typography.Paragraph>

				<Form form={form} onFinish={onFinish} layout="vertical">
					{questionnaire.questions.map((question) => (
						<Form.Item
							key={question.id}
							name={question.id}
							label={question.question}
							rules={[
								{
									required: question.required,
									message: "This question requires an answer",
								},
								{
									max: question.answer_character_limit,
									message: `Answer cannot exceed ${question.answer_character_limit} characters`,
								},
							]}
						>
							<Input.TextArea
								rows={4}
								showCount
								maxLength={question.answer_character_limit}
							/>
						</Form.Item>
					))}

					<Form.Item>
						<Button type="primary" htmlType="submit" loading={submitting} block>
							Submit Answers
						</Button>
					</Form.Item>
				</Form>
			</Card>
		</div>
	);
};

export default AnswerQuestionnairePage;
