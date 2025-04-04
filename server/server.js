import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import { clerkWebhooks} from './controllers/webhooks.js'
import educatorRouter from './routes/educatorRoutes.js'
import { clerkMiddleware } from '@clerk/express'
import connectCloudinary from './configs/cloudinary.js'
import courseRouter from './routes/courseRoutes.js'
import userRouter from './routes/userRoutes.js'
import videoRouter from './routes/videoRoutes.js'
// import Enrollment from './models/EnrollmentModel.js'
import enrollmentRoutes from './routes/enrollmentRoutes.js'
// import paymentLink from 'razorpay/dist/types/paymentLink.js'
import paymentRoutes from './routes/payment.js'

const app = express()

await connectDB()
await connectCloudinary()

// Middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}))

// Important: Place these before route handlers
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(clerkMiddleware())
// const paymentRoutes = require("./routes/paymentRoutes")

// Routes
app.get('/', (req, res) => res.send("API Working"))
app.post('/clerk', express.json(), clerkWebhooks)
app.use('/api/educator', educatorRouter)
app.use('/api/course', courseRouter)
app.use('/api/video', videoRouter)  // Video Routes

app.use('/api/user', userRouter)
app.use("/api/enrollment", enrollmentRoutes);
app.use("/api/user", paymentRoutes)



// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!',
        error: err.message 
    })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})