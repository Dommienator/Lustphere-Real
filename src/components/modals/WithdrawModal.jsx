import React, { useState } from "react";
import { X, Smartphone, CreditCard } from "lucide-react";

export const WithdrawModal = ({ show, onClose, userId, totalEarned }) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!show) return null;

  const handleWithdraw = async () => {
    const withdrawAmount = parseInt(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (withdrawAmount > totalEarned) {
      setError("Insufficient balance");
      return;
    }

    const minAmount = paymentMethod === "mpesa" ? 100 : 500;
    if (withdrawAmount < minAmount) {
      setError(`Minimum withdrawal is ${minAmount} KSh`);
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
      const endpoint =
        paymentMethod === "mpesa"
          ? "/payments/mpesa/withdraw"
          : "/payments/paypal/withdraw";

      const body =
        paymentMethod === "mpesa"
          ? { userId, amount: withdrawAmount, phoneNumber }
          : { userId, amount: withdrawAmount, paypalEmail };

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        onClose();
        window.location.reload();
      } else {
        setError(data.message || "Withdrawal failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            Withdraw Earnings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Balance */}
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Available Balance</p>
            <p className="text-3xl font-bold text-green-600">
              KSh {totalEarned.toLocaleString()}
            </p>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Withdrawal Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod("mpesa")}
                className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg transition ${
                  paymentMethod === "mpesa"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-green-300"
                }`}
              >
                <Smartphone size={20} className="text-green-600" />
                <span className="font-semibold">M-Pesa</span>
              </button>

              <button
                onClick={() => setPaymentMethod("paypal")}
                className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg transition ${
                  paymentMethod === "paypal"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-300"
                }`}
              >
                <CreditCard size={20} className="text-blue-600" />
                <span className="font-semibold">PayPal</span>
              </button>
            </div>
          </div>

          {/* Payment Details */}
          {paymentMethod === "mpesa" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                M-Pesa Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="254712345678"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum: 100 KSh</p>
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
              <p className="text-xs text-gray-500 mt-1">Minimum: 500 KSh</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
            <button
              onClick={handleWithdraw}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition disabled:opacity-50"
            >
              {loading ? "Processing..." : "Withdraw"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
