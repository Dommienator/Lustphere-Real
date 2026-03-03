const paypal = require("@paypal/checkout-server-sdk");

class PayPalService {
  constructor() {
    this.environment =
      process.env.PAYPAL_MODE === "live"
        ? new paypal.core.LiveEnvironment(
            process.env.PAYPAL_CLIENT_ID,
            process.env.PAYPAL_CLIENT_SECRET,
          )
        : new paypal.core.SandboxEnvironment(
            process.env.PAYPAL_CLIENT_ID,
            process.env.PAYPAL_CLIENT_SECRET,
          );

    this.client = new paypal.core.PayPalHttpClient(this.environment);
  }

  async createOrder(amount, currency = "USD") {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          description: "LustSphere Token Purchase",
        },
      ],
      application_context: {
        brand_name: "LustSphere",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
        return_url: `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      },
    });

    try {
      const response = await this.client.execute(request);
      return {
        success: true,
        orderID: response.result.id,
        approvalURL: response.result.links.find(
          (link) => link.rel === "approve",
        ).href,
      };
    } catch (error) {
      console.error("PayPal create order error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async captureOrder(orderID) {
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    try {
      const response = await this.client.execute(request);
      return {
        success: true,
        orderID: response.result.id,
        status: response.result.status,
        payerID: response.result.payer.payer_id,
        payerEmail: response.result.payer.email_address,
        amount: response.result.purchase_units[0].amount.value,
      };
    } catch (error) {
      console.error("PayPal capture error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async createPayout(recipientEmail, amount, currency = "USD") {
    const payoutsRequest = {
      sender_batch_header: {
        sender_batch_id: `batch_${Date.now()}`,
        email_subject: "You have received a payment from LustSphere",
        email_message: "Your earnings have been sent to your PayPal account.",
      },
      items: [
        {
          recipient_type: "EMAIL",
          amount: {
            value: amount.toFixed(2),
            currency: currency,
          },
          receiver: recipientEmail,
          note: "LustSphere Earnings Withdrawal",
          sender_item_id: `item_${Date.now()}`,
        },
      ],
    };

    try {
      const response = await axios.post(
        `${this.environment.baseUrl}/v1/payments/payouts`,
        payoutsRequest,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await this.getAccessToken()}`,
          },
        },
      );

      return {
        success: true,
        batchID: response.data.batch_header.payout_batch_id,
        status: response.data.batch_header.batch_status,
      };
    } catch (error) {
      console.error(
        "PayPal payout error:",
        error.response?.data || error.message,
      );
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async getAccessToken() {
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
    ).toString("base64");

    try {
      const response = await axios.post(
        `${this.environment.baseUrl}/v1/oauth2/token`,
        "grant_type=client_credentials",
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );
      return response.data.access_token;
    } catch (error) {
      console.error("PayPal token error:", error);
      throw new Error("Failed to get PayPal access token");
    }
  }
}

const axios = require("axios");
module.exports = new PayPalService();
