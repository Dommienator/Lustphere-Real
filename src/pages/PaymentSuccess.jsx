import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader } from "lucide-react";

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const capturePayment = async () => {
      const token = searchParams.get("token");
      const transactionId = searchParams.get("transactionId");

      if (!token || !transactionId) {
        setError("Invalid payment link");
        setProcessing(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/payments/paypal/capture`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderID: token, transactionId }),
          },
        );

        const data = await response.json();

        if (data.success) {
          setProcessing(false);
          setTimeout(() => navigate("/"), 3000);
        } else {
          setError(data.message || "Payment failed");
          setProcessing(false);
        }
      } catch (err) {
        setError("Network error");
        setProcessing(false);
      }
    };

    capturePayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
        {processing ? (
          <>
            <Loader
              size={64}
              className="animate-spin text-purple-600 mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Processing Payment...
            </h2>
            <p className="text-gray-600">
              Please wait while we confirm your payment
            </p>
          </>
        ) : error ? (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Return Home
            </button>
          </>
        ) : (
          <>
            <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your tokens have been added to your account
            </p>
            <p className="text-sm text-gray-500">Redirecting to homepage...</p>
          </>
        )}
      </div>
    </div>
  );
};
