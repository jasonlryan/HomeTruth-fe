import { useState } from "react";
import PageTitle from "../../components/PageTitle";
import { changePassword } from "../../api/api";

export default function AccountSettings() {
  const [email] = useState(
    () => localStorage.getItem("user_email") || ""
  );
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [weeklySummary, setWeeklySummary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Password validation function
  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasMinLength = password.length >= 8;
    
    return {
      isValid: hasUpperCase && hasNumber && hasMinLength,
      errors: [
        !hasMinLength && "Password must be at least 8 characters long",
        !hasUpperCase && "Password must contain at least one uppercase letter",
        !hasNumber && "Password must contain at least one number"
      ].filter(Boolean)
    };
  };

  const handleSaveChanges = async () => {
    setMessage("");
    setError("");
    setSuccess("");

    // Client-side validation
    if (!oldPassword.trim()) {
      setError("❌ Please enter your current password.");
      return;
    }

    if (!newPassword.trim()) {
      setError("❌ Please enter a new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("❌ New passwords do not match.");
      return;
    }

    if (oldPassword === newPassword) {
      setError("❌ New password must be different from your current password.");
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setError(`❌ Password requirements not met: ${passwordValidation.errors.join(", ")}`);
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        oldPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      });

      setSuccess("✅ Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
    } catch (err) {
      console.error("Password change error:", err);
      
      // Handle different types of errors with specific messages
      let errorMessage = "❌ Failed to change password.";
      
      if (err.response?.data?.message) {
        errorMessage = `❌ ${err.response.data.message}`;
      } else if (err.response?.data?.error) {
        errorMessage = `❌ ${err.response.data.error}`;
      } else if (err.response?.status === 401) {
        errorMessage = "❌ Current password is incorrect.";
      } else if (err.response?.status === 400) {
        errorMessage = "❌ Invalid password format or requirements not met.";
      } else if (err.response?.status === 429) {
        errorMessage = "❌ Too many attempts. Please try again later.";
      } else if (err.message) {
        errorMessage = `❌ ${err.message}`;
      }
      
      setError(errorMessage);
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateAccount = () => {
    alert("Account deactivation is not yet implemented.");
  };

  const handleSaveNotifications = () => {
  };

  // Clear messages when user starts typing
  const clearMessages = () => {
    if (error || success || message) {
      setError("");
      setSuccess("");
      setMessage("");
    }
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen mt-4 mb-20">
      <div className="max-w-7xl mx-auto px-4 space-y-6 mt-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-primary rounded-full">
            <img src="/assets/settings/account.svg" alt="" className="w-5 h-5" />
          </div>
          <PageTitle>Account</PageTitle>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 bg-white rounded-xl shadow text-darkGrey space-y-8 mt-6">
        {/* Email */}
        <div>
          <label className="block font-sm mb-1 font-medium">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
            disabled
            readOnly
          />
        </div>

        {/* Password Change */}
        <div className="space-y-3">
          <label className="block font-sm font-medium">Change Password</label>
          <input
            type="password"
            placeholder="Old password"
            className="w-full px-4 py-2 border rounded"
            value={oldPassword}
            onChange={(e) => {
              setOldPassword(e.target.value);
              clearMessages();
            }}
          />
          <input
            type="password"
            placeholder="New password"
            className="w-full px-4 py-2 border rounded"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              clearMessages();
            }}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            className="w-full px-4 py-2 border rounded"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              clearMessages();
            }}
          />

          <button
            onClick={handleSaveChanges}
            disabled={
              !oldPassword || !newPassword || !confirmPassword || loading
            }
            className={`mt-2 px-4 py-2 rounded text-white transition ${
              oldPassword && newPassword && confirmPassword
                ? "bg-customActiveText hover:bg-sky-500"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

          {/* Success Message */}
          {success && (
            <div className="mt-3 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
              <div className="flex items-center">
                <span className="material-symbols-outlined text-green-500 mr-2">check_circle</span>
                {success}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              <div className="flex items-center">
                <span className="material-symbols-outlined text-red-500 mr-2">error</span>
                {error}
              </div>
            </div>
          )}

          {/* Legacy message display for backward compatibility */}
          {message && !success && !error && (
            <p className="mt-2 text-sm">{message}</p>
          )}
        </div>

        <hr className="my-8" />

        {/* Deactivation */}
        <div>
          <h3 className="text-darkGrey font-extrabold text-lg mb-2">
            Account Management
          </h3>
          <button
            onClick={handleDeactivateAccount}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800"
          >
            Deactivate Account
          </button>
        </div>

        {/* Weekly Summary */}
        <div className="flex items-center justify-between mt-8">
          <div>
            <h3 className="text-darkGrey font-medium text-md mb-1">
              Weekly Summary
            </h3>
            <p className="text-lightGrey text-sm">
              Receive a weekly summary of your activity
            </p>
          </div>

          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={weeklySummary}
                onChange={() => setWeeklySummary(!weeklySummary)}
                className="sr-only"
              />
              <div
                className={`w-10 h-5 rounded-full shadow-inner transition duration-300 ${
                  weeklySummary ? "bg-primary" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`absolute top-0 left-0 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ${
                  weeklySummary ? "translate-x-5" : ""
                }`}
              ></div>
            </div>
          </label>
        </div>

        <button
          onClick={handleSaveNotifications}
          className="mt-8 bg-customActiveText text-white px-4 py-2 rounded hover:bg-sky-500"
        >
          Save Notification Settings
        </button>
      </div>
    </div>
  );
}
