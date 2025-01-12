import React, { useState } from "react";
import "./HomePage.css";
import { Input } from "antd";
import tableOne from "../../assets/table_two.png";
import TypewriterText from "../../components/TypewriterText/TypewriterText";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import axios from "axios";
import { useCsrf } from "../../context/CsrfProvider";

const HomePage: React.FC = () => {
	const navigate = useNavigate();
	const { csrfToken } = useCsrf();
	const [loading, setLoading] = useState(false);

	const typewriterTexts = [
		"How can we improve our product?",
		"What’s your biggest challenge in day-to-day work?",
		"How can we improve our lectures?",
		"Which tools or resources would make your job easier?",
	];

	const handleSearch = async (value: string) => {
		if (!value) return;

		setLoading(true);
		try {
			await axios.post(
				"/api/sharing/validate_access_code",
				{ access_code: value },
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);

			message.success("Access granted!");
			navigate(`/answer?code=${value}`);
		} catch (error: any) {
			message.error(error.response?.data?.error || "Invalid access code");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<div className="hero-section">
				<div className="hero-content">
					<h1 className="hero-title">No Ideas Left Behind</h1>
					<p className="hero-subtitle">
						Bring people together, capture every perspective, and see the
						structured insights with ease.
					</p>
					<div className="hero-form">
						<Input.Search
							maxLength={6}
							placeholder="Enter code"
							enterButton="Join discussion"
							className="hero-input-group"
							loading={loading}
							onSearch={handleSearch}
						/>
					</div>
					<div className="hero-image-container">
						<TypewriterText texts={typewriterTexts} />
						<img
							src={tableOne}
							alt="Table discussion illustration"
							className="hero-image"
						/>
					</div>
				</div>
			</div>
		</>
	);
};

export default HomePage;
