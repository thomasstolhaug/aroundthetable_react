import { Typography } from "antd";

const { Title, Paragraph } = Typography;

function AboutUs() {
	return (
		<div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
			<Title level={1}>About Us</Title>

			<Paragraph>
				Welcome to our platform! We are dedicated to providing excellent service
				and innovative solutions to meet your needs.
			</Paragraph>

			<Title level={2}>Our Mission</Title>
			<Paragraph>
				Our mission is to empower users with cutting-edge technology while
				maintaining the highest standards of security and user experience.
			</Paragraph>

			<Title level={2}>Our Vision</Title>
			<Paragraph>
				We strive to be the leading platform in our field, continuously
				innovating and adapting to meet the evolving needs of our users.
			</Paragraph>

			<Title level={2}>Contact Us</Title>
			<Paragraph>
				Have questions or feedback? We'd love to hear from you! Please reach out
				to us at contact@example.com.
			</Paragraph>
		</div>
	);
}

export default AboutUs;
