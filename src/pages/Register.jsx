import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { registerUser } from "../api/api";
import Footer from "../components/Footer";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "";
  const guestSessionId = searchParams.get("guest_session_id") || sessionStorage.getItem("guest_session_id_redirect") || "";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isValidPassword = (pw) => {
    const hasUpperCase = /[A-Z]/.test(pw);
    const hasNumber = /\d/.test(pw);
    return hasUpperCase && hasNumber;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (!isValidPassword(password)) {
      setError(
        "Password must include at least one capital letter and one number."
      );
      return;
    }

    try {
      // Prepare registration data - only include home_address if it's not empty
      const registrationData = {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        confirmPassword: confirm,
      };

      // Only include home_address if it's not empty
      if (homeAddress.trim()) {
        registrationData.home_address = homeAddress.trim();
      }

      await registerUser(registrationData);

      setSuccess("Registration successful! Redirecting to quiz...");

      // Set new user flag to trigger quiz after login
      localStorage.setItem("new_user", "true");
      localStorage.setItem("user_email", email);
      localStorage.setItem("user_name", `${firstName} ${lastName}`);

      const loginQuery = new URLSearchParams();
      if (redirectTo) loginQuery.set("redirect", redirectTo);
      if (guestSessionId) loginQuery.set("guest_session_id", guestSessionId);
      const queryString = loginQuery.toString();

      setTimeout(() => {
        navigate(queryString ? `/login?${queryString}` : "/login");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Logo */}
       <div className="flex items-center p-12">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate("/")}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img 
              src="/assets/logo.png" 
              alt="Home Truth Logo" 
              className="w-56 h-13"
            />
          </button>
         
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 md:px-16 lg:px-32 xl:px-96">
        <div className="w-full max-w-4xl">
          {/* Title with Decorative Elements */}
          <div className="text-center mb-12 relative">
            <div className="flex items-start justify-center mb-4">
              {/* Orange shape */}
              <img 
                src="/assets/orange.png" 
                alt="Orange decoration" 
                className="w-6 h-6 sm:w-8 sm:h-8 mt-2 sm:mt-0 -mr-8 sm:-mr-8"
              />
              
              <div className="text-center mx-6 sm:mx-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-black mb-2">Create your account</h2>
                <p className="text-lg sm:text-xl text-gray-600">Join us to find your perfect home</p>
              </div>
              
              {/* Blue shape */}
              <img 
                src="/assets/blue.png" 
                alt="Blue decoration" 
                className="w-6 h-6 sm:w-8 sm:h-8 mt-8 sm:mt-16 -ml-8 sm:-ml-10"
              />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Two Column Layout for First Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="w-full">
                <label className="block text-black text-lg sm:text-xl mb-2">First Name</label>
                <div className="border-b-2 border-gray-300 focus-within:border-blue-500 transition-colors w-full">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-transparent py-2 text-base sm:text-lg outline-none"
                    placeholder=""
                    required
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="w-full">
                <label className="block text-black text-lg sm:text-xl mb-2">Last Name</label>
                <div className="border-b-2 border-gray-300 focus-within:border-blue-500 transition-colors w-full">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-transparent py-2 text-base sm:text-lg outline-none"
                    placeholder=""
                    required
                  />
                </div>
              </div>
            </div>

            {/* Two Column Layout for Email and Home Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="w-full">
                <label className="block text-black text-lg sm:text-xl mb-2">Email</label>
                <div className="border-b-2 border-gray-300 focus-within:border-blue-500 transition-colors w-full">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent py-2 text-base sm:text-lg outline-none"
                    placeholder=""
                    required
                  />
                </div>
              </div>

              {/* Home Address */}
              <div className="w-full">
                <label className="block text-black text-lg sm:text-xl mb-2">Home Address (optional)</label>
                <div className="border-b-2 border-gray-300 focus-within:border-blue-500 transition-colors w-full">
                  <input
                    type="text"
                    value={homeAddress}
                    onChange={(e) => setHomeAddress(e.target.value)}
                    className="w-full bg-transparent py-2 text-base sm:text-lg outline-none"
                    placeholder=""
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="w-full">
              <label className="block text-black text-lg sm:text-xl mb-2">Password</label>
              <div className="border-b-2 border-gray-300 focus-within:border-blue-500 transition-colors w-full relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent py-2 pr-10 text-base sm:text-lg outline-none"
                  placeholder=""
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                   <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="w-full">
              <label className="block text-black text-lg sm:text-xl mb-2">Confirm Password</label>
              <div className="border-b-2 border-gray-300 focus-within:border-blue-500 transition-colors w-full relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full bg-transparent py-2 pr-10 text-base sm:text-lg outline-none"
                  placeholder=""
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}

            {/* Join Now Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-customActiveText hover:bg-sky-600 mt-8 text-white py-4 sm:py-6 md:py-8 px-8 sm:px-16 md:px-32 lg:px-44 rounded-2xl text-lg sm:text-xl md:text-2xl font-medium transition-colors"
              >
                Join Now
              </button>
            </div>
          </form>

          {/* Sign in link */}
          <div className="text-center mt-12 sm:mt-16 md:mt-12  text-lg sm:text-xl md:text-2xl mb-20">
            <p className="text-gray-600">
              Already have an account?{" "}
              <button 
                onClick={() => navigate("/login")}
                className="font-bold text-black hover:text-blue-600 transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
