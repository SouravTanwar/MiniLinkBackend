import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import device from "express-device"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit: "12kb"}))
app.use(express.urlencoded({extended:true, limit:"12kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.use(device.capture({
    parseUserAgent: true
}));


import userRouter from "./routes/user.routes.js"
import linkRouter from "./routes/link.routes.js"
import analyticsRouter from "./routes/analytics.routes.js"

app.use("/api/v1/users", userRouter)
app.use("/api/v1/links",linkRouter)
app.use("/api/v1/analytics", analyticsRouter)

export {app}