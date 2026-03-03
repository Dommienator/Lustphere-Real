import React, { useState } from "react";
import { X, Smartphone, CreditCard } from "lucide-react";

const TOKEN_PACKAGES = [
  { tokens: 50, price: 1150, label: "Starter" },
  { tokens: 100, price: 2300, label: "Popular", badge: "Best Value" },
  { tokens: 200, price: 4600, label: "Premium" },
  { tokens: 500, price: 11500, label: "Ultimate" },
];

export const TokenPurchaseModal = ({ show, onClose, userId }) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!show) return null;

  const handlePurchase = async () => {
    if (!selectedPackage) {
      setError("Please select a package");
      return;
    }

    if (paymentMethod === "mpesa" && !phoneNumber) {
      setError("Please enter your M-Pesa number");
      return;
    }

    if (paymentMethod === "paypal" && !paypalEmail) {
      setError("Please enter your PayPal email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (paymentMethod === "mpesa") {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/payments/mpesa/purchase`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              phoneNumber,
              amount: selectedPackage.price,
              tokens: selectedPackage.tokens,
            }),
          },
        );

        const data = await response.json();

        if (data.success) {
          alert("Payment initiated! Check your phone for M-Pesa prompt.");
          onClose();
        } else {
          setError(data.message || "Payment failed");
        }
      } else {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/payments/paypal/purchase`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              amount: selectedPackage.price,
              tokens: selectedPackage.tokens,
            }),
          },
        );

        const data = await response.json();

        if (data.success) {
          window.location.href = data.approvalURL;
        } else {
          setError(data.message || "Payment failed");
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">Purchase Tokens</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Token Packages */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Select Package</h3>
            <div className="grid grid-cols-2 gap-4">
              {TOKEN_PACKAGES.map((pkg) => (
                <div
                  key={pkg.tokens}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`relative cursor-pointer p-4 border-2 rounded-lg transition ${
                    selectedPackage?.tokens === pkg.tokens
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-300 hover:border-purple-300"
                  }`}
                >
                  {pkg.badge && (
                    <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                      {pkg.badge}
                    </span>
                  )}
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {pkg.tokens}
                    </p>
                    <p className="text-sm text-gray-500">tokens</p>
                    <p className="text-lg font-semibold mt-2">
                      KSh {pkg.price.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">{pkg.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPaymentMethod("mpesa")}
                className={`flex items-center justify-center gap-3 p-4 border-2 rounded-lg transition ${
                  paymentMethod === "mpesa"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-green-300"
                }`}
              >
                <Smartphone size={24} className="text-green-600" />
                <span className="font-semibold">M-Pesa</span>
              </button>

              <button
                onClick={() => setPaymentMethod("paypal")}
                className={`flex items-center justify-center gap-3 p-4 border-2 rounded-lg transition ${
                  paymentMethod === "paypal"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-300"
                }`}
              >
                <CreditCard size={24} className="text-blue-600" />
                <span className="font-semibold">PayPal</span>
              </button>
            </div>
          </div>

          {/* Payment Details */}
          {paymentMethod === "mpesa" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                M-Pesa Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="254712345678"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                You'll receive an STK push notification on your phone
              </p>
            </div>
          )}

          {paymentMethod === "paypal" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PayPal Email
              </label>
              <input
                type="email"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                You'll be redirected to PayPal to complete payment
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Summary */}
          {selectedPackage && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">You're purchasing:</span>
                <span className="font-bold text-lg">
                  {selectedPackage.tokens} tokens
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold text-2xl text-purple-600">
                  KSh {selectedPackage.price.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 sticky bottom-0 bg-white pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              disabled={!selectedPackage || loading}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Processing..."
                : `Pay KSh ${selectedPackage?.price.toLocaleString() || 0}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
