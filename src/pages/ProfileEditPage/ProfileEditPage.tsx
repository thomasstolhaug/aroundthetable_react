import React, { useState, useEffect } from "react";
import "./ProfileEditPage.css";
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

const ProfileEditPage: React.FC = () => {
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
				});
				setIsEmailVerified(user.is_email_verified);
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setIsLoading(false);
			}
		};

		fetchProfile();
	}, []);

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

		// Show confirmation dialog
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
			<div className="profile-edit-container">
				<div className="loading-spinner" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="profile-edit-container">
				<p className="error-message">Error: {error}</p>
			</div>
		);
	}

	return (
		<div className="profile-edit-container">
			<h1>Profile Settings</h1>
			<form onSubmit={handleSubmit} className="profile-edit-form">
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

				<div className="form-group">
					<label htmlFor="email">Email</label>
					<div className="email-container">
						<input
							type="email"
							id="email"
							name="email"
							value={formData.email}
							onChange={handleInputChange}
							required
						/>
						{isEmailVerified ? (
							<span className="verification-badge verified">Verified</span>
						) : (
							<span className="verification-badge unverified">Unverified</span>
						)}
					</div>
				</div>

				<div className="password-section">
					<button
						type="button"
						className="toggle-password-button"
						onClick={() => setShowPasswordFields(!showPasswordFields)}
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
					<button type="button" className="cancel-button">
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
};

export default ProfileEditPage;
