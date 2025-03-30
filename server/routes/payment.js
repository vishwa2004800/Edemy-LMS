import express from "express";
import paypal from "paypal-rest-sdk";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Configure PayPal SDK
paypal.configure({
  mode: process.env.PAYPAL_ENVIRONMENT,
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

// Create a payment route
router.post("/create-payment", (req, res) => {
  const { amount } = req.body;

  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    },
    transactions: [
      {
        amount: {
          currency: "USD",
          total: amount, // Example: "10.00"
        },
        description: "Payment for LMS Course",
      },
    ],
  };

  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
      res.status(500).json({ error });
    } else {
      const approvalUrl = payment.links.find(
        (link) => link.rel === "approval_url"
      ).href;
      res.json({ approvalUrl });
    }
  });
});

// Execute payment after user approval
router.get("/execute-payment", (req, res) => {
  const { paymentId, PayerID } = req.query;

  const execute_payment_json = {
    payer_id: PayerID,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "10.00",
        },
      },
    ],
  };

  paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
    if (error) {
      res.status(500).json({ error });
    } else {
      res.json({ message: "Payment successful", payment });
    }
  });
});

export default router;
