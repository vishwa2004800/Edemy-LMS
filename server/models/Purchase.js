import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentGateway: {
      type: String,
      required: true,
      enum: ["razorpay", "phonepe", "test"],
    },
    orderId: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
    },
    paymentSignature: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // Mongoose automatically manages createdAt and updatedAt
);

// Export as ES6 module
const Purchase = mongoose.model("Payment", PaymentSchema);
export default Purchase;
