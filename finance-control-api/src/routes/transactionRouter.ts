import express from "express";
import {
  protect,
  getTransactions,
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "../controllers";

const transactionRouter = express.Router();

transactionRouter
  .route("/")
  .post(protect, createTransaction)
  .get(protect, getTransactions);

transactionRouter
  .route("/:id")
  .delete(protect, deleteTransaction)
  .patch(protect, updateTransaction);
export default transactionRouter;
