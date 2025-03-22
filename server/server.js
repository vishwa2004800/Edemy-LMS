import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import { clerkWebhooks } from './controllers/webhooks.js'



const app = express()

await connectDB()

// Middlewares
app.use(cors())

// Routes
app.get('/', (req, res) => res.send("API Working"))
app.post('/clerk', express.json(), clerkWebhooks)
// Add this to your server.js file
app.post('/test-webhook', express.json(), (req, res) => {
    console.log('Test webhook received!');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    // Always respond with success
    res.status(200).json({ success: true });
  });


// Port
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
