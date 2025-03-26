// import express from 'express'
// import cors from 'cors'
// import 'dotenv/config'
// import connectDB from './configs/mongodb.js'
// import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js'
// import educatorRouter from './routes/educatorRoutes.js'
// import { clerkMiddleware } from '@clerk/express'
// import connectCloudinary from './configs/cloudinary.js'
// import courseRouter from './routes/courseRoutes.js'
// import userRouter from './routes/userRoutes.js'



// const app = express()

// await connectDB()
// await connectCloudinary()

// // Middlewares
// // app.use(cors())
// app.use(cors({ origin: "http://localhost:5173" }));

// app.use(clerkMiddleware())

// // Routes
// app.get('/', (req, res) => res.send("API Working"))
// app.post('/clerk', express.json(), clerkWebhooks)
// app.use('/api/educator', express.json(), educatorRouter)

// app.use('/api/course', express.json(), courseRouter)
// app.get("/api/course/all", (req, res) => {
//     res.json({ message: "Courses fetched successfully!" });
//   });

// app.use('/api/user', express.json(),userRouter)

// app.post('/stripe', express.raw({type:'application/json'}), stripeWebhooks)


// app.post('/test-webhook', express.json(), (req, res) => {
//     console.log('Test webhook received!');
//     console.log('Headers:', JSON.stringify(req.headers, null, 2));
//     console.log('Body:', JSON.stringify(req.body, null, 2));
    
//     // Always respond with success
//     res.status(200).json({ success: true });
//   });


// // Port
// const PORT = process.env.PORT || 5000

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`)
// })



import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js'
import educatorRouter from './routes/educatorRoutes.js'
import { clerkMiddleware } from '@clerk/express'
import connectCloudinary from './configs/cloudinary.js'
import courseRouter from './routes/courseRoutes.js'
import userRouter from './routes/userRoutes.js'

const app = express()

await connectDB()
await connectCloudinary()

// Middlewares
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(clerkMiddleware())

// Routes
app.get('/', (req, res) => res.send("API Working"))
app.post('/clerk', express.json(), clerkWebhooks)
app.use('/api/educator', express.json(), educatorRouter)
app.use('/api/course', courseRouter)
app.use('/api/user', userRouter)
app.post('/stripe', express.raw({type:'application/json'}), stripeWebhooks)

// Port
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})