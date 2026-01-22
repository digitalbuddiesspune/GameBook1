import React, { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import {
  DocumentTextIcon,
  ChartBarIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/solid";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

/* ✅ SAFE API BASE URL */
const API_BASE_URI = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

const Login = () => {
  const { t } = useLanguage();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mobile.trim() || !password.trim()) {
      toast.error("Please enter mobile number and password");
      return;
    }

    setLoading(true);

    try {
      localStorage.clear();

      /* ✅ BACKEND-COMPATIBLE PAYLOAD */
      const { data } = await axios.post(
        `${API_BASE_URI}/api/auth/login`,
        {
          mobile,
          password,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);

      toast.success("Login successful!");

      if (data.user.role === "admin") {
        navigate("/admin", { replace: true });
      }

      if (data.user.role === "vendor") {
        const profileRes = await axios.get(
          `${API_BASE_URI}/api/vendors/me`,
          {
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
          }
        );

        localStorage.setItem("vendorId", profileRes.data.vendor.id);
        localStorage.setItem(
          "vendorProfile",
          JSON.stringify(profileRes.data.vendor)
        );

        navigate("/vendor", { replace: true });
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: DocumentTextIcon,
      title: "Easy receipt management",
      description: "Streamline your business transactions",
    },
    {
      icon: ChartBarIcon,
      title: "Real-time analytics",
      description: "Make data-driven decisions instantly",
    },
    {
      icon: ShieldCheckIcon,
      title: "Secure and reliable",
      description: "Your data is protected and safe",
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          {/* Logo & Branding */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 shadow-lg">
              <DocumentTextIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4 tracking-tight">
              GameBook1
            </h1>
            <p className="text-xl text-white/90 font-medium">
              Smart business management at your fingertips
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-6 mt-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 group hover:translate-x-2 transition-transform duration-300"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-white/80 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mb-48 blur-3xl"></div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl mb-4 shadow-lg">
              <DocumentTextIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              GameBook1
            </h1>
            <p className="text-gray-600 text-sm">
              Smart business management at your fingertips
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {t("auth.welcomeBack") || "Welcome Back"}
              </h2>
              <p className="text-gray-600">
                Sign in to continue to your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mobile Number Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("auth.usernameOrMobile") || "Mobile Number"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Enter your mobile number"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("auth.password") || "Password"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl pr-12 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  t("auth.signIn") || "Sign In"
                )}
              </button>
            </form>

            {/* Footer Note */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Secure login with encrypted credentials
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
