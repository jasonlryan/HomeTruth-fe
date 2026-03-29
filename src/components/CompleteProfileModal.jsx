import { useState } from "react";
import api from "../api/api";

export default function CompleteProfileModal({ onComplete }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    await api.put("/api/auth/update-profile", {
      first_name: firstName,
      last_name: lastName,
    });

    localStorage.setItem("user_name", `${firstName} ${lastName}`);
    window.dispatchEvent(new Event("profileUpdated")); // notify Topbar

    onComplete();
  } catch (err) {
    console.error("Profile update failed:", err);
    setError("Failed to update profile.");
  }
};



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">
          Let's Make It Personal
        </h2>
        <p className="text-md text-gray-500 mb-5 text-center">
          Before we dive in, tell us your name so we know what to call you.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="w-full">
              <label className="block text-md font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div className="w-full">
              <label className="block text-md font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-blue-700 text-white py-2 rounded font-bold"
          >
            Continue →
          </button>
        </form>
      </div>
    </div>
  );
}
