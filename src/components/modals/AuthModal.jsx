import React, { useState } from "react";

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
  const [showPassword, setShowPassword] = useState(false);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {authMode === "login" ? "Welcome Back" : "Join LustSphere HD"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={authMode === "login" ? onLogin : onSignup}
          className="space-y-4"
        >
          {/* Email */}
          <input
            type="email"
            placeholder="Email *"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={
                authMode === "signup"
                  ? "Password (8+ chars, 1 uppercase, 1 number, 1 special) *"
                  : "Password *"
              }
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-purple-600 hover:text-purple-800"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Confirm Password (Signup only) */}
          {authMode === "signup" && (
            <input
              type="password"
              placeholder="Confirm Password *"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          )}

          {/* Role Selection - BUTTONS not dropdown */}
          {authMode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Role *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "client" })}
                  className={`py-3 px-4 rounded-lg border-2 font-semibold transition ${
                    form.role === "client"
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-purple-300"
                  }`}
                >
                  Client (Caller)
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "model" })}
                  className={`py-3 px-4 rounded-lg border-2 font-semibold transition ${
                    form.role === "model"
                      ? "border-pink-500 bg-pink-50 text-pink-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-pink-300"
                  }`}
                >
                  Model (Receiver)
                </button>
              </div>
            </div>
          )}

          {/* Login - Show role buttons */}
          {authMode === "login" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Login as *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "client" })}
                  className={`py-3 px-4 rounded-lg border-2 font-semibold transition ${
                    form.role === "client"
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-purple-300"
                  }`}
                >
                  Client
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "model" })}
                  className={`py-3 px-4 rounded-lg border-2 font-semibold transition ${
                    form.role === "model"
                      ? "border-pink-500 bg-pink-50 text-pink-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-pink-300"
                  }`}
                >
                  Model
                </button>
              </div>
            </div>
          )}

          {/* Signup Fields */}
          {authMode === "signup" && form.role && (
            <>
              {/* Nickname - For BOTH */}
              <input
                type="text"
                placeholder="Nickname *"
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />

              {/* Location - For BOTH */}
              <input
                type="text"
                placeholder="Location (e.g., Nairobi, Kenya) *"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />

              {/* Model-specific fields */}
              {form.role === "model" && (
                <>
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    required
                  />

                  <input
                    type="number"
                    placeholder="Age (18+) *"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    required
                    min="18"
                  />

                  <input
                    type="text"
                    placeholder="Tagline (e.g., 'Fun and adventurous!')"
                    value={form.tagline}
                    onChange={(e) =>
                      setForm({ ...form, tagline: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Picture *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePictureUpload}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                      required
                    />
                    {form.picturePreview && (
                      <img
                        src={form.picturePreview}
                        alt="Preview"
                        className="mt-2 w-24 h-24 rounded-full object-cover mx-auto"
                      />
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* Terms Agreement */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.agreedToTerms}
              onChange={(e) =>
                setForm({ ...form, agreedToTerms: e.target.checked })
              }
              className="w-4 h-4"
              required
            />
            <span className="text-sm text-gray-600">
              I agree to the terms and conditions
            </span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition"
          >
            {authMode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>

        {/* Toggle Auth Mode */}
        <div className="mt-4 text-center">
          <button
            onClick={() =>
              setAuthMode(authMode === "login" ? "signup" : "login")
            }
            className="text-purple-600 hover:underline"
          >
            {authMode === "login"
              ? "Don't have an account? Sign up"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};
