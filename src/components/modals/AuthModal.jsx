import React from "react";
import { X, Eye, EyeOff, Upload } from "lucide-react";

export const AuthModal = ({
  show,
  onClose,
  authMode,
  setAuthMode,
  form,
  setForm,
  onSignup,
  onLogin,
  handlePictureUpload,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {authMode === "login" ? "Login" : "Sign Up"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={authMode === "login" ? onLogin : onSignup}
          className="p-6 space-y-4"
        >
          {/* Role Selection - BOTH LOGIN AND SIGNUP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I am a:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "client" })}
                className={`py-3 rounded-lg font-semibold border-2 transition ${
                  form.role === "client"
                    ? "bg-purple-100 border-purple-500 text-purple-700"
                    : "bg-white border-gray-300 text-gray-700 hover:border-purple-300"
                }`}
              >
                👤 Client
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "model" })}
                className={`py-3 rounded-lg font-semibold border-2 transition ${
                  form.role === "model"
                    ? "bg-pink-100 border-pink-500 text-pink-700"
                    : "bg-white border-gray-300 text-gray-700 hover:border-pink-300"
                }`}
              >
                ⭐ Model
              </button>
            </div>
          </div>

          {authMode === "signup" && (
            <>
              {/* Full Name (both client and model) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* Nickname */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nickname
                </label>
                <input
                  type="text"
                  required
                  value={form.nickname}
                  onChange={(e) =>
                    setForm({ ...form, nickname: e.target.value })
                  }
                  placeholder="Display name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  placeholder="e.g., Nairobi, Kenya"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* Age (for model) */}
              {form.role === "model" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    required
                    min="18"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    placeholder="Must be 18+"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              )}

              {/* Profile Picture */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture{" "}
                  {form.role === "model" && (
                    <span className="text-red-500">*</span>
                  )}
                  {form.role === "client" && (
                    <span className="text-gray-500 text-xs">(Optional)</span>
                  )}
                </label>
                {form.picturePreview && (
                  <img
                    src={form.picturePreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-4 border-purple-200"
                  />
                )}
                <label className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400">
                  <Upload size={20} className="mr-2" />
                  <span>
                    {form.picturePreview ? "Change Picture" : "Upload Picture"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePictureUpload}
                    required={form.role === "model"}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Tagline (for model) */}
              {form.role === "model" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tagline{" "}
                    <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <textarea
                    value={form.tagline}
                    onChange={(e) =>
                      setForm({ ...form, tagline: e.target.value })
                    }
                    placeholder="Tell clients about yourself..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              )}
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password (signup only) */}
          {authMode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          )}

          {/* Age Confirmation - BOTH LOGIN AND SIGNUP */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="ageConfirmed"
              checked={form.ageConfirmed}
              onChange={(e) =>
                setForm({ ...form, ageConfirmed: e.target.checked })
              }
              className="mt-1"
            />
            <label htmlFor="ageConfirmed" className="text-sm text-gray-600">
              I confirm that I am 18 years or older
            </label>
          </div>

          {/* Terms and Conditions - SIGNUP ONLY */}
          {authMode === "signup" && (
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={form.agreedToTerms}
                onChange={(e) =>
                  setForm({ ...form, agreedToTerms: e.target.checked })
                }
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the Terms & Conditions and Privacy Policy
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition"
          >
            {authMode === "login" ? "Login" : "Sign Up"}
          </button>

          {/* Toggle Mode */}
          <p className="text-center text-sm text-gray-600">
            {authMode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              type="button"
              onClick={() =>
                setAuthMode(authMode === "login" ? "signup" : "login")
              }
              className="text-purple-600 font-semibold hover:underline"
            >
              {authMode === "login" ? "Sign Up" : "Login"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};
