"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
require("./utils/taskScheduler");
const authRouter_1 = __importDefault(require("./routes/authRouter"));
const customError_1 = __importDefault(require("./utils/customError"));
// import { rateLimit } from "express-rate-limit";
const controllers_1 = require("./controllers");
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const sanitize_1 = __importDefault(require("./middleware/sanitize"));
const transactionRouter_1 = __importDefault(require("./routes/transactionRouter"));
// import cookieParser from "cookie-parser";
// import mongoose from "mongoose";
// mongoose.set("debug", true);
// const limiter = rateLimit({
//   windowMs: 60 * 24 * 60 * 1000, // 1 day
//   limit: 101, // Limit each IP to 100 requests
//   message:
//     "Too many server request for a certain period, please try again later...",
// });
const app = (0, express_1.default)();
// Apply the rate limiting middleware to all requests.
// app.use(limiter);
// Define the CORS options
const corsOptions = {
    origin: "https://equilibriofinanceiro.web.app",
    // origin: "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Authorization, Content-Type",
    credentials: true,
    optionsSuccessStatus: 204,
};
// Use the CORS middleware
app.use((0, cors_1.default)(corsOptions));
// Handle preflight requests
app.options("*", (0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: "10kb" })); //Limit maximum request body data
app.use(sanitize_1.default);
// app.use(cookieParser()); // Middleware to parse cookies
// By default, $ and . characters are removed completely from user-supplied input in the following places:
// - req.body
// - req.params
// - req.headers
// - req.query
// To remove data using these defaults:
app.use((0, express_mongo_sanitize_1.default)());
//Routes
app.use("/api/v1/user", authRouter_1.default);
app.use("/api/v1/transactions", transactionRouter_1.default);
app.all("*", (req, res, next) => {
    const err = new customError_1.default(`Can not find this URL on server: "${req.originalUrl}" `, 404);
    next(err);
});
app.use(controllers_1.globalErrorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map