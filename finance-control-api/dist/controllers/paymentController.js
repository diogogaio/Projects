"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionStatus = exports.createCheckoutSession = void 0;
const stripe_1 = __importDefault(require("stripe"));
const asyncErrorHandler_1 = __importDefault(require("../utils/asyncErrorHandler"));
const customError_1 = __importDefault(require("../utils/customError"));
exports.createCheckoutSession = (0, asyncErrorHandler_1.default)(async (req, res, next) => {
    const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
    const { email } = req.body;
    const MY_DOMAIN = process.env.NODE_ENV === "production"
        ? "https://equilibriofinanceiro.web.app"
        : "http://localhost:5173";
    const session = await stripe.checkout.sessions.create({
        ui_mode: "embedded",
        customer_email: email,
        line_items: [
            {
                // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                price: "price_1Q5TcNDzQr6iKDKIQgpvPScm",
                quantity: 1,
            },
        ],
        mode: "payment",
        return_url: `${MY_DOMAIN}/paymentReturn/session_id={CHECKOUT_SESSION_ID}`,
    });
    console.log("## CREATE CHECKOUT SESSION variable: ## ", session);
    res.status(201).json({
        clientSecret: session.client_secret,
    });
});
exports.sessionStatus = (0, asyncErrorHandler_1.default)(async (req, res, next) => {
    console.log("@@ request params: @@", req.query);
    const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
    const session_id = String(req.query.session_id);
    if (!session_id) {
        const error = new customError_1.default("Invalid session ID", 400);
        return next(error);
    }
    console.log(" @@ SESSION_ID PARAMS: " + session_id);
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log("%% SESSION STATUS VARIABLE: %%", session.status);
    res.send({
        status: session.status,
    });
});
//# sourceMappingURL=paymentController.js.map