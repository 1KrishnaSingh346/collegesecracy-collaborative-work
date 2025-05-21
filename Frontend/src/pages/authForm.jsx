import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore.js";
import { PageLoader } from "../components/Loaders/script.js";
import toast, { Toaster } from "react-hot-toast";
import Logo from "/Logo.webp";
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser, FiBook, FiHome, FiUpload } from "react-icons/fi";

const colleges = ["IIITK", "IIT Bombay", "IIT Delhi", "IIT Kanpur", "NIT Trichy", "Other"];

const AuthForm = () => {
  const { login, signup, isAuthenticated, user, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  // State management
  const [darkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const [formState, setFormState] = useState({
    isRegister: false,
    userType: "mentee",
    collegeName: "",
    isOtherCollege: false,
    otherCollegeName: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    idProof: null,
    rememberMe: false,
    showResetForm: false,
    resetEmail: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [requestTimeout, setRequestTimeout] = useState(false);
  const [toastId, setToastId] = useState(null);

  // Effects
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const remember = localStorage.getItem("rememberMe") === "true";
    const storedEmail = localStorage.getItem("email");
    const storedPassword = localStorage.getItem("password");

    if (remember && storedEmail && storedPassword) {
      setFormState(prev => ({
        ...prev,
        email: storedEmail,
        password: storedPassword,
        rememberMe: true
      }));
    }

    const timer = setTimeout(() => setIsInitializing(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (formState.isRegister && formState.password) {
      const strength = calculatePasswordStrength(formState.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength("");
    }
  }, [formState.password, formState.isRegister]);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === "mentor" ? "/mentor-dashboard" :
        user.role ==="mentee" ? "/mentee-dashboard" : "/admin");
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) {
      handleAuthError(error);
      clearError();
    }
  }, [error, clearError]);

  // Helper functions
  const calculatePasswordStrength = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLong = password.length >= 8;

    const strengthPoints = [
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChars,
      isLong
    ].filter(Boolean).length;

    if (strengthPoints <= 2) return "Weak";
    if (strengthPoints <= 4) return "Medium";
    return "Strong";
  };

  const toggleForm = () => {
    setFormState(prev => ({
      ...prev,
      isRegister: !prev.isRegister,
      collegeName: "",
      otherCollegeName: "",
      idProof: null,
      confirmPassword: "",
      showResetForm: false
    }));
    setFormErrors({});
  };

  const toggleResetForm = () => {
    setFormState(prev => ({
      ...prev,
      showResetForm: !prev.showResetForm,
      isRegister: false
    }));
    setFormErrors({});
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors({ ...formErrors, idProof: "File size should be less than 5MB" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormState(prev => ({ ...prev, idProof: reader.result }));
      setFormErrors({ ...formErrors, idProof: "" });
    };
    reader.readAsDataURL(file);
  };

const handleAuthError = (error) => {
    // Clear previous errors
    setFormErrors({});
    
    let errorMessage = "";
    const newFormErrors = {};
    
    // Check if this is an error from the auth store with a specific message
    if (error.message) {
        errorMessage = error.message;
        
        // Handle specific cases from auth store
        if (error.message.includes("already registered") || 
            error.message.includes("already exists")) {
            newFormErrors.email = error.message;
        } else if (error.message.includes("Invalid email or password") || 
                   error.message.includes("Incorrect email or password")) {
            newFormErrors.email = "Invalid email or password";
            newFormErrors.password = "Invalid email or password";
        } else if (error.message.includes("token missing") || 
                   error.message.includes("Authentication token missing")) {
            errorMessage = "Session expired. Please log in again.";
        }
        
        // Show the message and return early
        showTemporaryMessage(errorMessage);
        setFormErrors(newFormErrors);
        setIsSubmitting(false);
        setRequestTimeout(false);
        return;
    }
    
    // Handle axios response errors (only if not handled above)
    if (error.response) {
        switch (error.response.status) {
            case 400:
                errorMessage = error.response.data.message || "Validation error";
                if (error.response.data.errors) {
                    error.response.data.errors.forEach(err => {
                        // Map backend field names to frontend field names if needed
                        const fieldName = err.path === 'email' ? 'email' : 
                                         err.path === 'password' ? 'password' : 
                                         err.path;
                        newFormErrors[fieldName] = err.msg;
                    });
                }
                break;
                
            case 401:
                errorMessage = "Invalid email or password";
                newFormErrors.email = "Invalid email or password";
                newFormErrors.password = "Invalid email or password";
                break;
                
            case 403:
                errorMessage = error.response.data.message || "Account temporarily locked";
                break;
                
            case 404:
                errorMessage = "Email not registered";
                newFormErrors.email = "Email not registered";
                break;
                
            case 409:
                errorMessage = error.response.data.message || "User already exists with this email";
                newFormErrors.email = errorMessage;
                break;
                
            case 500:
                errorMessage = "Server error. Please try again later.";
                break;
                
            default:
                errorMessage = error.response.data?.message || "Authentication failed";
        }
    } 
    // Handle network errors
    else if (error.code === 'ECONNABORTED' || error.message === 'Timeout') {
        errorMessage = "Request timed out. Please try again.";
    } else {
        errorMessage = "Network error. Please check your connection.";
    }

    // Update state
    setFormErrors(newFormErrors);
    showTemporaryMessage(errorMessage);
    setIsSubmitting(false);
    setRequestTimeout(false);
};

const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (formState.showResetForm) {
      if (!formState.resetEmail.trim()) {
        errors.resetEmail = "Email is required";
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.resetEmail.trim())) {
        errors.resetEmail = "Please enter a valid email address";
        isValid = false;
      }
      setFormErrors(errors);
      return isValid;
    }

    if (formState.isRegister) {
      if (!formState.fullName.trim()) {
        errors.fullName = "Full name is required";
        isValid = false;
      }
      
      if (formState.userType === "mentor") {
        if (!formState.collegeName && !formState.otherCollegeName) {
          errors.collegeName = "College name is required";
          isValid = false;
        }
        if (!formState.idProof) {
          errors.idProof = "ID proof is required for mentors";
          isValid = false;
        }
      }
      
      if (!formState.password) {
        errors.password = "Password is required";
        isValid = false;
      } else if (formState.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
        isValid = false;
      }
      
      if (formState.password !== formState.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
        isValid = false;
      }
    } else {
      // Login form validation
      if (!formState.password) {
        errors.password = "Password is required";
        isValid = false;
      }
    }

    if (!formState.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
};

  const showTemporaryMessage = (msg, type = "error") => {
    if (toastId) {
      toast.dismiss(toastId);
    }

    const options = {
      duration: 5000,
      position: "top-center",
      style: {
        background: type === "error" ? "#FEE2E2" : "#DCFCE7",
        color: type === "error" ? "#B91C1C" : "#166534",
        border: type === "error" ? "1px solid #FCA5A5" : "1px solid #86EFAC",
        padding: "16px",
        borderRadius: "8px"
      }
    };

    const newToastId = type === "error" 
      ? toast.error(msg, options) 
      : toast.success(msg, options);
    
    setToastId(newToastId);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "collegeName" && {
        isOtherCollege: value === "Other"
      })
    }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;

  setIsSubmitting(true);
  setRequestTimeout(false);
  
  // Set timeout for the request (10 seconds)
  const timeoutId = setTimeout(() => {
    setRequestTimeout(true);
    setIsSubmitting(false);
    handleAuthError({ message: "Request timed out. Please try again." });
  }, 10000);

  try {
    if (formState.rememberMe) {
      localStorage.setItem("rememberMe", "true");
      localStorage.setItem("email", formState.email.trim());
      localStorage.setItem("password", formState.password);
    } else {
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("email");
      localStorage.removeItem("password");
    }

    if (formState.isRegister) {
      const signupData = {
        email: formState.email.trim(),
        password: formState.password,
        fullName: formState.fullName.trim(),
        role: formState.userType,
      };
      
      if (formState.userType === "mentor") {
        signupData.collegeName = formState.isOtherCollege
          ? formState.otherCollegeName.trim()
          : formState.collegeName;
        signupData.idProof = formState.idProof;
      }
      
      await signup(signupData);
      showTemporaryMessage("Account created successfully! Please log in.", "success");
      setFormState(prev => ({ ...prev, isRegister: false }));
    } else {
      // Send credentials as an object with email and password properties
      await login({
        email: formState.email.trim(),
        password: formState.password
      });
      showTemporaryMessage("Logged in successfully!", "success");
    }
    
    clearTimeout(timeoutId);
  } catch (error) {
  
    clearTimeout(timeoutId);
      //handleAuthError(error);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!formState.resetEmail.trim()) {
      setFormErrors({ resetEmail: "Email is required" });
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.resetEmail.trim())) {
      setFormErrors({ resetEmail: "Please enter a valid email address" });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call for password reset
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showTemporaryMessage(
        `Password reset link sent to ${formState.resetEmail}. Please check your email.`,
        "success"
      );
      toggleResetForm();
    } catch (error) {
      showTemporaryMessage(
        "Failed to send reset link. Please try again later.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    const newToastId = toast(
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
        </svg>
        <span>Google login will be available in the next update!</span>
      </div>,
      {
        duration: 4000,
        icon: "ℹ️",
        style: {
          background: "#EFF6FF",
          color: "#1E40AF",
          border: "1px solid #93C5FD",
          padding: "16px",
          borderRadius: "8px"
        }
      }
    );
    setToastId(newToastId);
  };

  if (isInitializing) return <PageLoader />;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Add Toaster component here */}
      <Toaster />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center mb-2">
             <img src={Logo} className="md:h-16 h-12 w-40 md:w-60" alt="collegesecracy" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-center">
            {formState.showResetForm 
              ? "Reset your password" 
              : formState.isRegister 
                ? "Join our community of mentors and mentees" 
                : "Welcome back to your learning journey"}
          </p>
        </div>

        {formState.showResetForm ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <div className="flex items-center">
                  <FiMail className="mr-2 text-orange-500" />
                  Email Address
                </div>
              </label>
              <input
                type="email"
                name="resetEmail"
                value={formState.resetEmail}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${
                  formErrors.resetEmail ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200`}
              />
              {formErrors.resetEmail && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.resetEmail}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-medium transition duration-200 flex justify-center items-center shadow-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <button
              type="button"
              onClick={toggleResetForm}
              className="w-full text-center text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none transition-colors mt-4"
            >
              Back to Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {formState.isRegister && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <div className="flex items-center">
                        <FiUser className="mr-2 text-orange-500" />
                        Full Name
                      </div>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formState.fullName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        formErrors.fullName ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                      } rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200`}
                    />
                    {formErrors.fullName && (
                      <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <div className="flex items-center">
                        <FiUser className="mr-2 text-blue-500" />
                        Register as
                      </div>
                    </label>
                    <select
                      name="userType"
                      value={formState.userType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    >
                      <option value="mentee">Mentee</option>
                      <option value="mentor">Mentor</option>
                    </select>
                  </div>
                </div>

                {formState.userType === "mentor" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <div className="flex items-center">
                          <FiHome className="mr-2 text-orange-500" />
                          College Name
                        </div>
                      </label>
                      <select
                        name="collegeName"
                        value={formState.collegeName}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border ${
                          formErrors.collegeName ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                        } rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200`}
                      >
                        <option value="" disabled>Select your college</option>
                        {colleges.map((college) => (
                          <option key={college} value={college}>{college}</option>
                        ))}
                      </select>
                      {formErrors.collegeName && (
                        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.collegeName}</p>
                      )}
                    </div>

                    {formState.isOtherCollege && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Specify College Name
                        </label>
                        <input
                          type="text"
                          name="otherCollegeName"
                          value={formState.otherCollegeName}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <div className="flex items-center">
                          <FiUpload className="mr-2 text-blue-500" />
                          ID Proof (Max 5MB)
                        </div>
                      </label>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                        className={`w-full text-sm text-gray-500 dark:text-gray-400 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold ${
                          formErrors.idProof ? "file:bg-red-50 dark:file:bg-red-900/20 file:text-red-700 dark:file:text-red-300" 
                          : "file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-300"
                        } hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50`}
                      />
                      {formErrors.idProof && (
                        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.idProof}</p>
                      )}
                      {formState.idProof && !formErrors.idProof && (
                        <p className="mt-1 text-sm text-green-500 dark:text-green-400">File selected</p>
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <div className="flex items-center">
                  <FiMail className="mr-2 text-orange-500" />
                  Email
                </div>
              </label>
              <input
                type="email"
                name="email"
                value={formState.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${
                  formErrors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200`}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <div className="flex items-center">
                  <FiLock className="mr-2 text-blue-500" />
                  Password
                </div>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formState.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${
                    formErrors.password ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-2 right-2 text-gray-600 dark:text-gray-400"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.password}</p>
              )}
              {formState.isRegister && passwordStrength && !formErrors.password && (
                <div className="mt-1 text-xs">
                  Password Strength: <span className={
                    passwordStrength === "Weak" ? "text-red-500" :
                    passwordStrength === "Medium" ? "text-yellow-500" :
                    "text-green-500"
                  }>
                    {passwordStrength}
                  </span>
                  {passwordStrength === "Weak" && " - Add more characters, numbers, and symbols"}
                  {passwordStrength === "Medium" && " - Good, but could be stronger"}
                  {passwordStrength === "Strong" && " - Excellent password!"}
                </div>
              )}
            </div>

            {formState.isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <div className="flex items-center">
                    <FiLock className="mr-2 text-orange-500" />
                    Confirm Password
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formState.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      formErrors.confirmPassword ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-2 right-2 text-gray-600 dark:text-gray-400"
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">{formErrors.confirmPassword}</p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formState.rememberMe}
                  onChange={handleChange}
                  className="accent-orange-500 dark:accent-blue-500"
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-600 dark:text-gray-300">Remember Me</label>
              </div>
              {!formState.isRegister && (
                <button
                  type="button"
                  onClick={toggleResetForm}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot Password?
                </button>
              )}
            </div>

            {requestTimeout && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
                Request timed out. Please check your connection and try again.
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-medium transition duration-200 flex justify-center items-center shadow-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                          <span>
                              {formState.isRegister
                                ? "Welcome aboard! Setting things up..."
                                : "Hold tight, logging you in..."}
                          </span>    
                </>
              ) : (
                formState.isRegister ? "Create Account" : "Sign In"
              )}
            </button>
          </form>
        )}

        {!formState.showResetForm && (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
                <span className="ml-2">Continue with Google</span>
              </button>
            </div>
          </div>
        )}

        {!formState.showResetForm && (
          <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
            {formState.isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={toggleForm}
              className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none transition-colors"
            >
              {formState.isRegister ? "Sign In" : "Create Account"}
            </button>
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default AuthForm;