import cors from "cors";
import express from "express";
import "./utils/taskScheduler";
import authRouter from "./routes/authRouter";
import CustomError from "./utils/customError";
import { rateLimit } from "express-rate-limit";
import { globalErrorHandler } from "./controllers";
import mongoSanitize from "express-mongo-sanitize";
import sanitizeRequest from "./middleware/sanitize";
import transactionRouter from "./routes/transactionRouter";
// import cookieParser from "cookie-parser";
// import mongoose from "mongoose";
// mongoose.set("debug", true);

const limiter = rateLimit({
  windowMs: 60 * 24 * 60 * 1000, // 1 day
  limit: 100, // Limit each IP to 100 requests
  message:
    "Too many server request for a certain period, please try again later...",
});

const app = express();

// Apply the rate limiting middleware to all requests.
app.use(limiter);

// Define the CORS options
const corsOptions = {
  origin: "https://equilibriofinanceiro.web.app",
  // origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  // credentials: true,
  optionsSuccessStatus: 204,
};

// Use the CORS middleware
app.use(cors(corsOptions));

app.use(express.json({ limit: "10kb" })); //Limit maximum request body data
app.use(sanitizeRequest);
// app.use(cookieParser()); // Middleware to parse cookies

// By default, $ and . characters are removed completely from user-supplied input in the following places:
// - req.body
// - req.params
// - req.headers
// - req.query

// To remove data using these defaults:
app.use(mongoSanitize());

//Routes

app.use("/api/v1/user", authRouter);
app.use("/api/v1/transactions", transactionRouter);
app.all("*", (req, res, next) => {
  const err = new CustomError(
    `Can not find this URL on server: "${req.originalUrl}" `,
    404
  );
  next(err);
});

app.use(globalErrorHandler as any);

export default app;
