// const Razorpay = require("razorpay")
// const crypto = require("crypto")
// const Course = require("../models/Course") // Adjust path as needed
// const User = require("../models/User") // Adjust path as needed
// const Payment = require("../models/Payment") // Adjust path as needed

// // Initialize Razorpay with your key_id and key_secret
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// })

// // Create a new Razorpay order
// exports.initiatePayment = async (req, res) => {
//   try {
//     const { courseId, amount, userId, courseTitle } = req.body

//     // Validate inputs
//     if (!courseId || !amount || !userId) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields",
//       })
//     }

//     // Verify course exists
//     const course = await Course.findById(courseId)
//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         message: "Course not found",
//       })
//     }

//     // Create Razorpay order
//     const options = {
//       amount: Math.round(amount * 100), // Razorpay expects amount in smallest currency unit (paise)
//       currency: "INR", // Change as needed
//       receipt: `receipt_order_${new Date().getTime()}`,
//       notes: {
//         courseId: courseId,
//         userId: userId,
//         courseTitle: courseTitle,
//       },
//     }

//     const order = await razorpay.orders.create(options)

//     // Save order details to database
//     await Payment.create({
//       user: userId,
//       course: courseId,
//       amount: amount,
//       paymentGateway: "razorpay",
//       orderId: order.id,
//       status: "created",
//     })

//     return res.status(200).json({
//       success: true,
//       order: order,
//       razorpayKeyId: process.env.RAZORPAY_KEY_ID,
//     })
//   } catch (error) {
//     console.error("Razorpay order creation error:", error)
//     return res.status(500).json({
//       success: false,
//       message: "Failed to create payment order",
//       error: error.message,
//     })
//   }
// }

// // Verify Razorpay payment
// exports.verifyPayment = async (req, res) => {
//   try {
//     const { courseId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body

//     // Verify signature
//     const body = razorpay_order_id + "|" + razorpay_payment_id
//     const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body).digest("hex")

//     const isAuthentic = expectedSignature === razorpay_signature

//     if (!isAuthentic) {
//       return res.status(400).json({
//         success: false,
//         message: "Payment verification failed",
//       })
//     }

//     // Update payment status in database
//     const payment = await Payment.findOne({ orderId: razorpay_order_id })
//     if (payment) {
//       payment.status = "paid"
//       payment.paymentId = razorpay_payment_id
//       payment.paymentSignature = razorpay_signature
//       await payment.save()
//     }

//     // Enroll user in the course
//     const user = await User.findById(req.user._id)
//     if (!user.enrolledCourses.includes(courseId)) {
//       user.enrolledCourses.push(courseId)
//       await user.save()
//     }

//     // Update course enrollment count
//     const course = await Course.findById(courseId)
//     if (course && !course.enrolledStudents.includes(req.user._id)) {
//       course.enrolledStudents.push(req.user._id)
//       await course.save()
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Payment verified successfully",
//     })
//   } catch (error) {
//     console.error("Razorpay payment verification error:", error)
//     return res.status(500).json({
//       success: false,
//       message: "Payment verification failed",
//       error: error.message,
//     })
//   }
// }

// // Check payment status
// exports.checkPaymentStatus = async (req, res) => {
//   try {
//     const { orderId } = req.query

//     if (!orderId) {
//       return res.status(400).json({
//         success: false,
//         message: "Order ID is required",
//       })
//     }

//     // Check payment status in database
//     const payment = await Payment.findOne({ orderId: orderId })

//     if (!payment) {
//       return res.status(404).json({
//         success: false,
//         message: "Payment not found",
//       })
//     }

//     // If payment is still in created status, check with Razorpay
//     if (payment.status === "created") {
//       try {
//         const razorpayOrder = await razorpay.orders.fetch(orderId)

//         // Update payment status based on Razorpay response
//         if (razorpayOrder.status === "paid") {
//           payment.status = "paid"
//           await payment.save()

//           // Enroll user in the course if not already enrolled
//           const user = await User.findById(payment.user)
//           if (user && !user.enrolledCourses.includes(payment.course)) {
//             user.enrolledCourses.push(payment.course)
//             await user.save()
//           }

//           // Update course enrollment
//           const course = await Course.findById(payment.course)
//           if (course && !course.enrolledStudents.includes(payment.user)) {
//             course.enrolledStudents.push(payment.user)
//             await course.save()
//           }
//         }
//       } catch (razorpayError) {
//         console.error("Error fetching Razorpay order:", razorpayError)
//       }
//     }

//     return res.status(200).json({
//       success: true,
//       paymentStatus: payment.status,
//       paymentDetails: {
//         amount: payment.amount,
//         courseId: payment.course,
//         createdAt: payment.createdAt,
//       },
//     })
//   } catch (error) {
//     console.error("Error checking payment status:", error)
//     return res.status(500).json({
//       success: false,
//       message: "Failed to check payment status",
//       error: error.message,
//     })
//   }
// }

import Razorpay from "razorpay";
import crypto from "crypto";
// import Course from "../models/Course.js"; // Adjust path as needed
import Course from "../models/Courses.js";
import User from "../models/User.js"; // Adjust path as needed
// import Payment from "../models/Payment.js"; // Adjust path as needed
import Purchase from "../models/Purchase.js";

// Initialize Razorpay with your key_id and key_secret
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

// Create a new Razorpay order
export const initiatePayment = async (req, res) => {
  try {
    const { courseId, amount, userId, courseTitle } = req.body;

    // Validate inputs
    if (!courseId || !amount || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
      notes: {
        courseId,
        userId,
        courseTitle,
      },
    };

    const order = await razorpay.orders.create(options);

    // Save order details to database
    await Purchase.create({
      user: userId,
      course: courseId,
      amount,
      paymentGateway: "razorpay",
      orderId: order.id,
      status: "created",
    });

    return res.status(200).json({
      success: true,
      order,
      razorpayKeyId: process.env.RAZORPAY_API_KEY,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message,
    });
  }
};

// Verify Razorpay payment
export const verifyPayment = async (req, res) => {
  try {
    const { courseId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Update payment status in database
    const payment = await Purchase.findOne({ orderId: razorpay_order_id });
    if (payment) {
      payment.status = "paid";
      payment.paymentId = razorpay_payment_id;
      payment.paymentSignature = razorpay_signature;
      await payment.save();
    }

    // Enroll user in the course
    const user = await User.findById(req.user._id);
    if (user && !user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
      await user.save();
    }

    // Update course enrollment count
    const course = await Course.findById(courseId);
    if (course && !course.enrolledStudents.includes(req.user._id)) {
      course.enrolledStudents.push(req.user._id);
      await course.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Razorpay payment verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

// Check payment status
export const checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.query;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Check payment status in database
    const payment = await Purchase.findOne({ orderId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // If payment is still in created status, check with Razorpay
    if (payment.status === "created") {
      try {
        const razorpayOrder = await razorpay.orders.fetch(orderId);

        // Update payment status based on Razorpay response
        if (razorpayOrder.status === "paid") {
          payment.status = "paid";
          await payment.save();

          // Enroll user in the course if not already enrolled
          const user = await User.findById(payment.user);
          if (user && !user.enrolledCourses.includes(payment.course)) {
            user.enrolledCourses.push(payment.course);
            await user.save();
          }

          // Update course enrollment
          const course = await Course.findById(payment.course);
          if (course && !course.enrolledStudents.includes(payment.user)) {
            course.enrolledStudents.push(payment.user);
            await course.save();
          }
        }
      } catch (razorpayError) {
        console.error("Error fetching Razorpay order:", razorpayError);
      }
    }

    return res.status(200).json({
      success: true,
      paymentStatus: payment.status,
      paymentDetails: {
        amount: payment.amount,
        courseId: payment.course,
        createdAt: payment.createdAt,
      },
    });
  } catch (error) {
    console.error("Error checking payment status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check payment status",
      error: error.message,
    });
  }
};
