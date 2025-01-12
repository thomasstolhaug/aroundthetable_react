import React, { useState, useEffect } from "react";
import "./TypewriterText.css";

interface TypewriterTextProps {
	texts: string[];
	typingSpeed?: number;
	deletingSpeed?: number;
	pauseTime?: number;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
	texts,
	typingSpeed = 70,
	deletingSpeed = 10,
	pauseTime = 2000,
}) => {
	const [currentText, setCurrentText] = useState("");
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		const timeout = setTimeout(
			() => {
				const currentFullText = texts[currentIndex];

				if (!isDeleting) {
					if (currentText.length < currentFullText.length) {
						setCurrentText(currentFullText.slice(0, currentText.length + 1));
					} else {
						setTimeout(() => setIsDeleting(true), pauseTime);
					}
				} else {
					if (currentText.length > 0) {
						setCurrentText(currentText.slice(0, -1));
					} else {
						setIsDeleting(false);
						setCurrentIndex((prev) => (prev + 1) % texts.length);
					}
				}
			},
			isDeleting ? deletingSpeed : typingSpeed
		);

		return () => clearTimeout(timeout);
	}, [
		currentText,
		currentIndex,
		isDeleting,
		texts,
		typingSpeed,
		deletingSpeed,
		pauseTime,
	]);

	return <div className="typewriter-text">{currentText}</div>;
};

export default TypewriterText;
