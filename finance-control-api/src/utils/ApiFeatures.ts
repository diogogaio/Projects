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
    return this;
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

  // Pagination currently on client side
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
