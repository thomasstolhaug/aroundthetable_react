import React, { useEffect, useState } from "react";
import { Typography, List } from "antd";
import { Link } from "react-router-dom";
import axios from "axios";
import { useCsrf } from "../../context/CsrfProvider";
import "./RecentQuestionnaires.css";

interface Questionnaire {
	id: string;
	name: string;
	status: string;
}

const STORAGE_KEY = "recent_questionnaires";
const LAST_FETCH_KEY = "last_questionnaires_fetch";
const FETCH_INTERVAL = 5 * 60 * 1000; // 5 minutes

const RecentQuestionnaires: React.FC = () => {
	const { csrfToken } = useCsrf();
	const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? JSON.parse(stored) : [];
	});

	useEffect(() => {
		const fetchQuestionnaires = async () => {
			if (!csrfToken) return;

			// Check if we should fetch based on time
			const lastFetch = localStorage.getItem(LAST_FETCH_KEY);
			const shouldFetch =
				!lastFetch || Date.now() - parseInt(lastFetch) > FETCH_INTERVAL;

			if (!shouldFetch) return;

			try {
				const response = await axios.get("/api/questionnaires", {
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				});

				const newQuestionnaires = response.data.results.slice(0, 3);

				// Only update if the data is different
				if (
					JSON.stringify(newQuestionnaires) !== JSON.stringify(questionnaires)
				) {
					setQuestionnaires(newQuestionnaires);
					localStorage.setItem(STORAGE_KEY, JSON.stringify(newQuestionnaires));
				}

				localStorage.setItem(LAST_FETCH_KEY, Date.now().toString());
			} catch (error) {
				console.error("Error fetching recent questionnaires:", error);
			}
		};

		fetchQuestionnaires();
	}, [csrfToken, questionnaires]);

	if (questionnaires.length === 0) return null;

	return (
		<div className="recent-questionnaires">
			<Typography.Text type="secondary" className="section-title">
				Recent Discussions
			</Typography.Text>
			<List
				size="small"
				dataSource={questionnaires}
				renderItem={(item) => (
					<List.Item className="recent-item">
						<Link to={`/discussions/${item.id}`}>
							<Typography.Text ellipsis>{item.name}</Typography.Text>
						</Link>
					</List.Item>
				)}
			/>
		</div>
	);
};

export default RecentQuestionnaires;
