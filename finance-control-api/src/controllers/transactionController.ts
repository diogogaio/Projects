import ApiFeatures from "../utils/ApiFeatures";
import CustomError from "../utils/customError";
import TransactionModel, { ITransaction } from "../models/transactionModel";
import { Request, Response, NextFunction } from "express";
import asyncErroHandler from "../utils/asyncErrorHandler";

export const createTransaction = asyncErroHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.tenantId;
    let transactionData: ITransaction = req.body;
    transactionData.tenantId = tenantId;

    const formattedDate = new Date(transactionData.createdAt);
    transactionData.createdAt = formattedDate;

    transactionData.transactionType !== "income"
      ? (transactionData.amount = -Number(transactionData.amount))
      : Number(transactionData.amount);

    const transaction = await TransactionModel.create(transactionData);
    console.log("CREATED TRANSACTION: " + transaction);
    res.status(201).json({
      status: "success",
      transaction,
    });
  }
);

export const getTransactions = asyncErroHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let query = req.query;
    const tenantId = req.tenantId;
    console.log("QUERY", query);
    const features = new ApiFeatures(TransactionModel.find(), query, tenantId);
    await features.filter();

    features.sort().limitFields().paginate();

    const transactions = await features.query;

    //No need to send not found errors, if theres is no data

    res.status(200).json({
      status: "success",
      count: features.count,
      transactions,
    });
  }
);

export const deleteTransaction = asyncErroHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const deletedTransaction = await TransactionModel.findByIdAndDelete(id);

    if (!deletedTransaction) {
      const error = new CustomError(
        "No transaction with this id was found.",
        404
      );
      return next(error);
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

export const updateTransaction = asyncErroHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const transactionId = req.params.id;
    const tenantId = req.tenantId;

    console.log("REQ. BODY: ", req.body);
    console.log("TRANSACTION ID: ", transactionId);

    if (!transactionId) {
      const error = new CustomError("Invalid transaction ID", 400);
      return next(error);
    }

    const response = await TransactionModel.updateMany(
      { transactionId, tenantId },
      req.body,
      { new: true, runValidators: true }
    );

    const { acknowledged, modifiedCount, matchedCount } = response;

    console.log("updated TRANSACTION: " + response);

    res.status(200).json({
      status: "success",
      acknowledged,
      matchedCount,
      modifiedCount,
    });
  }
);
