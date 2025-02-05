import React, { useState, useEffect } from "react";
import "./ProfileEditModal.css";
import axios, { AxiosError } from "axios";
import { useCsrf } from "../../context/CsrfProvider";
import { message, Modal } from "antd";

interface UserProfile {
	id: number;
	email: string;
	first_name: string;
	last_name: string;
	is_email_verified: boolean;
}

interface ProfileFormData {
	first_name: string;
	last_name: string;
	email: string;
	old_password?: string;
	new_password?: string;
	confirm_password?: string;
}

interface ProfileEditModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
	isOpen,
	onClose,
}) => {
	const [formData, setFormData] = useState<ProfileFormData>({
		first_name: "",
		last_name: "",
		email: "",
		old_password: "",
		new_password: "",
		confirm_password: "",
	});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isEmailVerified, setIsEmailVerified] = useState(false);
	const { csrfToken } = useCsrf();
	const [showPasswordFields, setShowPasswordFields] = useState(false);

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const response = await fetch("/api/users/get_profile");
				if (!response.ok) {
					throw new Error("Failed to fetch profile");
				}
				const data = await response.json();
				const user: UserProfile = data.user;

				setFormData({
					first_name: user.first_name,
					last_name: user.last_name,
					email: user.email,
					old_password: "",
					new_password: "",
					confirm_password: "",
				});
				setIsEmailVerified(user.is_email_verified);
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setIsLoading(false);
			}
		};

		if (isOpen) {
			fetchProfile();
		}
	}, [isOpen]);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		Modal.confirm({
			title: "Update Profile",
			content: "Are you sure you want to update your profile information?",
			okText: "Yes",
			cancelText: "No",
			onOk: async () => {
				setError(null);

				try {
					const response = await axios.post(
						"/api/users/update_profile",
						formData,
						{
							headers: { "X-CSRFToken": csrfToken },
							withCredentials: true,
						}
					);

					if (response.status !== 200) {
						throw new Error("Failed to update profile");
					}

					message.success("Profile updated successfully");
					onClose();
				} catch (err) {
					const errorMessage =
						err instanceof Error ? err.message : "Failed to update profile";
					message.error(errorMessage);
					setError(errorMessage);
				}
			},
		});
	};

	const handlePasswordChange = async () => {
		if (
			!formData.old_password ||
			!formData.new_password ||
			!formData.confirm_password
		) {
			message.error("Please fill in all password fields");
			return;
		}

		try {
			const response = await axios.post(
				"/api/users/reset_password_from_profile",
				{
					old_password: formData.old_password,
					new_password: formData.new_password,
					confirm_password: formData.confirm_password,
				},
				{
					headers: { "X-CSRFToken": csrfToken },
					withCredentials: true,
				}
			);

			if (response.status === 200) {
				message.success("Password updated successfully");
				setFormData((prev) => ({
					...prev,
					old_password: "",
					new_password: "",
					confirm_password: "",
				}));
				setShowPasswordFields(false);
			}
		} catch (err) {
			const error = err as AxiosError<{ error: string }>;
			const errorMessage =
				error.response?.data?.error || "Failed to update password";
			message.error(errorMessage);
			setError(errorMessage);
		}
	};

	if (isLoading) {
		return (
			<Modal
				title="Profile Settings"
				open={isOpen}
				onCancel={onClose}
				footer={null}
				width={600}
			>
				<div className="loading-spinner" />
			</Modal>
		);
	}

	return (
		<Modal
			title={<span style={{ fontSize: "20px" }}>Profile Settings</span>}
			open={isOpen}
			onCancel={onClose}
			footer={null}
			width={600}
		>
			<form onSubmit={handleSubmit} className="profile-edit-form">
				{error && (
					<div
						className="error-message"
						style={{
							color: "#ff4d4f",
							marginBottom: "16px",
							padding: "8px",
							backgroundColor: "#fff1f0",
							border: "1px solid #ffccc7",
							borderRadius: "4px",
						}}
					>
						{error}
					</div>
				)}
				<div className="form-group">
					<label htmlFor="email">Email / Username</label>
					<div className="email-container" style={{ marginTop: "-10px" }}>
						<span className="email-display" style={{ fontSize: "16px" }}>
							{formData.email}
						</span>
						{isEmailVerified ? (
							<span className="verification-badge verified">Verified</span>
						) : (
							<span className="verification-badge unverified">Unverified</span>
						)}
					</div>
				</div>
				<div style={{ borderBottom: "1px solid #d9d9d9", opacity: 0.5 }} />
				<div className="form-group">
					<label htmlFor="first_name">First Name</label>
					<input
						type="text"
						id="first_name"
						name="first_name"
						value={formData.first_name}
						onChange={handleInputChange}
						required
					/>
				</div>

				<div className="form-group">
					<label htmlFor="last_name">Last Name</label>
					<input
						type="text"
						id="last_name"
						name="last_name"
						value={formData.last_name}
						onChange={handleInputChange}
						required
					/>
				</div>

				<div className="password-section" style={{ marginTop: "-10px" }}>
					<button
						type="button"
						className="toggle-password-button"
						onClick={() => setShowPasswordFields(!showPasswordFields)}
						style={{
							background: showPasswordFields ? "#ff7875" : "#1890ff",
							color: "white",
							border: "none",
							padding: "6px 12px",
							borderRadius: "4px",
							cursor: "pointer",
							transition: "background 0.3s",
						}}
					>
						{showPasswordFields ? "Hide Password Fields" : "Change Password"}
					</button>

					{showPasswordFields && (
						<>
							<div className="form-group">
								<label htmlFor="old_password">Current Password</label>
								<input
									type="password"
									id="old_password"
									name="old_password"
									value={formData.old_password}
									onChange={handleInputChange}
								/>
							</div>

							<div className="form-group">
								<label htmlFor="new_password">New Password</label>
								<input
									type="password"
									id="new_password"
									name="new_password"
									value={formData.new_password}
									onChange={handleInputChange}
								/>
							</div>

							<div className="form-group">
								<label htmlFor="confirm_password">Confirm Password</label>
								<input
									type="password"
									id="confirm_password"
									name="confirm_password"
									value={formData.confirm_password}
									onChange={handleInputChange}
								/>
							</div>

							<button
								type="button"
								className="update-password-button"
								onClick={handlePasswordChange}
							>
								Update Password
							</button>
						</>
					)}
				</div>

				<div className="form-actions">
					<button type="submit" className="save-button">
						Save Changes
					</button>
					<button
						type="button"
						className="cancel-button"
						onClick={onClose}
						style={{ color: "#000" }}
					>
						Cancel
					</button>
				</div>
			</form>
		</Modal>
	);
};

export default ProfileEditModal;
