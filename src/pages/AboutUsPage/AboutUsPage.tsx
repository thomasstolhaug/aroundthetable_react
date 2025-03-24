import React from "react";
import { Typography } from "antd";
import "./AboutUsPage.css";

const { Title, Paragraph, Text } = Typography;

const AboutUsPage: React.FC = () => {
	return (
		<>
			<div className="content-container">
				<div className="content-wrapper">
					<Title level={1} className="main-title">
						About Us
					</Title>

					<Paragraph className="section-paragraph">
						Around the Table enables organizations to ask open-ended questions
						to hundreds or even thousands of customers/employees/stakeholders
						and have AI present every single atomic feedback, idea or insights
						in a way that is easy to understand and use.
					</Paragraph>

					<Paragraph className="section-paragraph">
						The application is currently in beta and is invite only. Send us an
						email at info@aroundthetable.io if you are interested in testing the
						application.
					</Paragraph>

					<Paragraph className="section-paragraph">
						<hr style={{ border: "1px solid #e8e8e8", margin: "2rem 0" }} />
					</Paragraph>

					<Paragraph className="section-paragraph">
						The startup Around the Table (aroundthetable.io) is owned and
						operated by norwegian company Kildekoden AS, located at
						Fredensborgveien 13, 0177 Oslo, Norway.
					</Paragraph>

					<Paragraph className="section-paragraph">
						<Text strong>Contact Information for Around the Table:</Text>
						<br />
						<Text>Email: </Text>
						<a href="mailto:thomas@aroundthetable.io">
							thomas@aroundthetable.io
						</a>
						<br />
					</Paragraph>

					<Paragraph className="section-paragraph">
						<Text strong>Contact Information for Kildekoden AS:</Text>
						<br />
						<Text>Email: </Text>
						<a href="mailto:thomas@kildekoden.no">thomas@kildekoden.no</a>
						<br />
					</Paragraph>
				</div>
			</div>
		</>
	);
};

export default AboutUsPage;
