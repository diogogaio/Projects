"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const controllers_1 = require("./controllers");
dotenv_1.default.config({ path: "./../config" });
// import { MongoMemoryServer } from "mongodb-memory-server";
process.on("uncaughtException", async (err) => {
    console.log(err.name, err.message);
    await (0, controllers_1.logErrorOnServer)("Uncaught-exception", err);
    console.log("Uncaught Exception occurred! Shutting down...");
    process.exit(1);
});
const configPath = path_1.default.resolve(__dirname, "../config.env");
dotenv_1.default.config({ path: configPath });
const port = process.env.PORT || 3000;
mongoose_1.default
    .connect(process.env.CONN_STR || "")
    .then(() => {
    console.log("DB Connection Successful!");
})
    .catch(() => {
    console.log("DB Connection Failed!");
});
const server = app_1.default.listen(port, () => {
    console.log(`server has started on port ${port}`);
});
// Handle any promise rejection that was not caught
process.on("unhandledRejection", async (err) => {
    console.log(err.name, err.message);
    await (0, controllers_1.logErrorOnServer)("Unhandled-rejection", err);
    console.log("Unhandled rejection occurred! Shutting down...");
    //Optionally: Finish all the pending requests before shutting down the server with server.close:
    server.close(() => {
        // Shut the server down:
        process.exit(1);
        // 0: means success, 1: means uncaught exception
    });
});
// //Local mongodb database:
// async function connectToDatabase() {
//   try {
//     const mongoServer = await MongoMemoryServer.create();
//     const mongoUri = mongoServer.getUri();
//     await mongoose.connect(mongoUri);
//     console.log(
//       `MongoDB successfully connected to in-memory server uri: ${mongoUri}`
//     );
//   } catch (err) {
//     console.error("DB Connection Error:", err);
//   }
// }
// connectToDatabase();
//# sourceMappingURL=server.js.map