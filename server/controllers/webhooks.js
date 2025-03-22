import { Webhook } from "svix";
import User from "../models/User.js";
import dotenv from 'dotenv';



export const clerkWebhooks = async (req, res) => {
    console.log("Webhook event received:", JSON.stringify(req.body, null, 2));

    try {
        // Verify headers exist
        if (!req.headers["svix-id"] || 
            !req.headers["svix-timestamp"] || 
            !req.headers["svix-signature"]) {
            console.error("Missing Svix headers");
            return res.status(400).json({ error: "Missing Svix headers" });
        }

        // Rest of your verification and processing
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        try {
            await whook.verify(JSON.stringify(req.body), {
                "svix-id": req.headers["svix-id"],
                "svix-timestamp": req.headers["svix-timestamp"],
                "svix-signature": req.headers["svix-signature"]
            });
        } catch (err) {
            console.error("Webhook verification failed:", err);
            return res.status(400).json({ error: "Webhook verification failed" });
        }

        const { data, type } = req.body;
        
        // Note: In your code, you use _type but Clerk typically uses "type"
        // Make sure it matches what Clerk is actually sending
        
        switch (type) { 
            case 'user.created': {
                // const userData = {
                //     _id: data.id,
                //     email: data.email_addresses[0].email_address, 
                //     name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
                //     imageUrl: data.image_url || '', 
                // };
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0]?.email_address || '', 
                    name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
                    imageUrl: data.image_url || '', 
                };

                console.log("Saving user to DB:", userData);

                await User.create(userData);
                return res.json({ success: true });
            }
            
            // Other cases with return statements
            // ...
            
            default:
                return res.json({ received: true });
        }
    } catch (error) {
        console.error("Webhook error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};