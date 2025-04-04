import { Webhook } from "svix";
import User from "../models/User.js";
import dotenv from 'dotenv';
import Course from "../models/Courses.js";
import Stripe from "stripe";



export const clerkWebhooks = async (req, res) => {
    console.log("Webhook event received:", JSON.stringify(req.body, null, 2));

    try {
       

        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        
            await whook.verify(JSON.stringify(req.body), {
                "svix-id": req.headers["svix-id"],
                "svix-timestamp": req.headers["svix-timestamp"],
                "svix-signature": req.headers["svix-signature"]
            });
        
        const { data, type } = req.body;
        
        
        switch (type) { 
            case 'user.created': {
               
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address, 
                    name: data.first_name + " " + data.last_name,
                    imageUrl: data.image_url, 
                };
                console.log("Attempting to save user to DB:", userData);


                await User.create(userData);
                res.json({});
                break;
            }

            case 'user.updated':{
                
                const userData = {
                    email: data.email_addresses[0].email_address, 
                    name: data.first_name + " " + data.last_name,
                    imageUrl: data.image_url, 
                }
                await User.findByIdAndUpdate(data.id,userData)
                res.json({})
                break;

            }

            case 'user.deleted':{
                await User.findByIdAndDelete(data.id)
                res.json({})
                break;

            }
            
          
            
            default:
                break;
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};



export const stripeWebhooks = async (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
        event = Stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
        case "payment_intent.succeeded": {
            const paymentIntent = event.data.object;
            const purchaseId = paymentIntent.metadata?.purchaseId;

            if (!purchaseId) {
                console.error("Missing purchaseId in metadata");
                return response.status(400).json({ error: "Missing purchaseId in metadata" });
            }

            const purchaseData = await Purchase.findById(purchaseId);
            if (!purchaseData) {
                console.error("Purchase not found in DB");
                return response.status(400).json({ error: "Purchase not found" });
            }

            const userData = await User.findById(purchaseData.userId);
            const courseData = await Course.findById(purchaseData.courseId);

            if (!userData || !courseData) {
                return response.status(400).json({ error: "User or Course not found" });
            }

            courseData.enrolledStudents.push(userData._id);
            await courseData.save();

            userData.enrolledCourses.push(courseData._id);
            await userData.save();

            purchaseData.status = "completed";
            await purchaseData.save();

            break;
        }

        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object;
            const purchaseId = paymentIntent.metadata?.purchaseId;

            if (!purchaseId) {
                return response.status(400).json({ error: "Missing purchaseId in metadata" });
            }

            const purchaseData = await Purchase.findById(purchaseId);
            if (purchaseData) {
                purchaseData.status = "failed";
                await purchaseData.save();
            }

            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    response.json({ received: true });
};



