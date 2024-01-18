import mongoose from "mongoose";

const Transactions = new mongoose.Schema(
  {
    transactionHash: { type: String, unique: true, required: true },
    from: { type: String },
    to: { type: String },
    value: { type: String },
    time: { type: String },
    indexed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const TransactionIndex = mongoose.model("TransactionIndex", Transactions);
export default TransactionIndex;
