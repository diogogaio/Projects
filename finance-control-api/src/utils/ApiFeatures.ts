import { Query } from "mongoose";

interface QueryParams {
  [key: string]: any;
}

class ApiFeatures<T> {
  query: Query<T[], T>;
  queryParams: QueryParams;
  tenantId: string;
  count: number;

  constructor(
    query: Query<T[], T>,
    queryParams: QueryParams,
    tenantId: string
  ) {
    this.query = query;
    this.queryParams = queryParams;
    this.tenantId = tenantId;
    this.count = 0;
  }

  async filter() {
    // Handle range queries (gte, gt, lte, lt)
    let queryParams = JSON.stringify({ ...this.queryParams });
    queryParams = queryParams.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    const queryObj = JSON.parse(queryParams);
    const excludedFields = ["page", "sort", "limit", "fields", "tenantId"];
    excludedFields.forEach((el) => delete queryObj[el]);
    queryObj.tenantId = this.tenantId;

    // Advanced filtering with RegExp for partial matching and Date conversion
    for (const key in queryObj) {
      if (
        (queryObj.hasOwnProperty(key) &&
          typeof queryObj[key] === "string" &&
          key === "description") ||
        key === "tag"
      ) {
        // Apply RegExp for partial matching and case-insensitivity
        queryObj[key] = new RegExp(queryObj[key], "i");
      } else if (key === "createdAt" && typeof queryObj[key] === "object") {
        for (const operator in queryObj[key]) {
          if (queryObj[key].hasOwnProperty(operator)) {
            // Convert to Date object
            queryObj[key][operator] = new Date(queryObj[key][operator]);
          }
        }
      }
    }

    this.query = this.query.find(queryObj);
    // Count the total number of matching documents before pagination
    this.count = await this.query.model.countDocuments(queryObj);

    interface ITransactionTypeTotals {
      _id: string; // "income" or "outcome"
      totalAmount: number; // Total amount for the transaction type
    }

    interface ITagTotals {
      _id: {
        transactionType: string; // "income" or "outcome"
        tag: string; // The tag associated with the transaction
      };
      totalAmountByTag: number; // Total amount for the specific tag
    }

    interface ITotals {
      byTransactionType: ITransactionTypeTotals[];
      byTag: ITagTotals[];
    }

    const totals = (await this.query.model.aggregate([
      { $match: queryObj }, // Apply filters
      {
        $facet: {
          byTransactionType: [
            {
              $group: {
                _id: "$transactionType", // Group by "income" or "outcome"
                totalAmount: { $sum: "$amount" }, // Calculate the total amount for each type
              },
            },
          ],
          byTag: [
            {
              $group: {
                _id: { transactionType: "$transactionType", tag: "$tag" }, // Group by transactionType and tag
                totalAmountByTag: { $sum: "$amount" }, // Calculate total amount per tag
              },
            },
          ],
        },
      },
    ])) as ITotals[];

    console.log(JSON.stringify(totals, null, 2));

    // The result of $facet is an array containing the results
    const totalsResult: ITotals = totals[0]; // Get the first element of the array if it's wrapped

    const incomeTotal =
      totalsResult.byTransactionType.find((t) => t._id === "income")
        ?.totalAmount || 0;
    const outcomeTotal =
      totalsResult.byTransactionType.find((t) => t._id === "outcome")
        ?.totalAmount || 0;

    const totalsByEachOutcomeTags: { [key: string]: number } = {};
    const totalsByEachIncomeTags: { [key: string]: number } = {};

    totalsResult.byTag.forEach((t) => {
      if (t._id.transactionType === "outcome") {
        totalsByEachOutcomeTags[t._id.tag] = t.totalAmountByTag;
      } else {
        totalsByEachIncomeTags[t._id.tag] = t.totalAmountByTag;
      }
    });

    console.log("totalsEachByIncomeTags", totalsByEachIncomeTags);
    console.log("totalsByEachOutcomeTags", totalsByEachOutcomeTags);

    return {
      incomeTotal,
      outcomeTotal,
      totalsByEachIncomeTags,
      totalsByEachOutcomeTags,
      feat: this,
    };
  }

  sort() {
    if (this.queryParams.sort) {
      const sortBy = (this.queryParams.sort as string).split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryParams.fields) {
      const fields = (this.queryParams.fields as string).split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }
  paginate() {
    const page = this.queryParams.page
      ? parseInt(this.queryParams.page as string, 10)
      : 1;
    const limit = this.queryParams.limit
      ? parseInt(this.queryParams.limit as string, 10)
      : Number(process.env.QUERY_LIMIT);
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

export default ApiFeatures;
