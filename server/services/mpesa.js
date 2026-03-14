const axios = require("axios");

class MpesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.passkey = process.env.MPESA_PASSKEY;
    this.shortcode = process.env.MPESA_SHORTCODE;
    this.environment = process.env.MPESA_ENVIRONMENT || "sandbox";
    this.callbackURL = process.env.MPESA_CALLBACK_URL;

    this.baseURL =
      this.environment === "sandbox"
        ? "https://sandbox.safaricom.co.ke"
        : "https://api.safaricom.co.ke";
  }

  async getAccessToken() {
    const auth = Buffer.from(
      `${this.consumerKey}:${this.consumerSecret}`,
    ).toString("base64");

    try {
      const response = await axios.get(
        `${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        },
      );
      return response.data.access_token;
    } catch (error) {
      console.error(
        "M-Pesa token error:",
        error.response?.data || error.message,
      );
      throw new Error("Failed to get M-Pesa access token");
    }
  }

  async stkPush(phoneNumber, amount, accountReference, transactionDesc) {
    const token = await this.getAccessToken();
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);
    const password = Buffer.from(
      `${this.shortcode}${this.passkey}${timestamp}`,
    ).toString("base64");

    const data = {
      BusinessShortCode: this.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.ceil(amount),
      PartyA: phoneNumber,
      PartyB: this.shortcode,
      PhoneNumber: phoneNumber,
      CallBackURL: this.callbackURL,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc || "LustSphere Payment",
    };

    try {
      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpush/v1/processrequest`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return {
        success: true,
        CheckoutRequestID: response.data.CheckoutRequestID,
        MerchantRequestID: response.data.MerchantRequestID,
        ResponseDescription: response.data.ResponseDescription,
      };
    } catch (error) {
      console.error(
        "M-Pesa STK Push error:",
        error.response?.data || error.message,
      );
      return {
        success: false,
        error: error.response?.data?.errorMessage || "STK Push failed",
      };
    }
  }

  async b2c(phoneNumber, amount, remarks) {
    const token = await this.getAccessToken();

    const data = {
      InitiatorName: process.env.MPESA_INITIATOR_NAME,
      SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
      CommandID: "BusinessPayment",
      Amount: Math.ceil(amount),
      PartyA: this.shortcode,
      PartyB: phoneNumber,
      Remarks: remarks || "LustSphere Withdrawal",
      QueueTimeOutURL: `${this.callbackURL}/timeout`,
      ResultURL: `${this.callbackURL}/b2c-result`,
      Occasion: "Withdrawal",
    };

    try {
      const response = await axios.post(
        `${this.baseURL}/mpesa/b2c/v1/paymentrequest`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return {
        success: true,
        ConversationID: response.data.ConversationID,
        OriginatorConversationID: response.data.OriginatorConversationID,
        ResponseDescription: response.data.ResponseDescription,
      };
    } catch (error) {
      console.error("M-Pesa B2C error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errorMessage || "B2C payment failed",
      };
    }
  }
}

module.exports = new MpesaService();
