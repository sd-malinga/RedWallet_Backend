import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    country: { type: String },
    department: { type: String },
    caseNumber: { type: String },
    category: { type: String },
    subCategory: { type: String },
    noticeContent: { type: String },
    actionLink: { type: String },
    imageLink: { type: String },
    investigationOffice: { type: String },
    issueDate: { type: String },
    lastDate: { type: String },
  },
  { timestamps: true },
);

const RedWalletSchema = new mongoose.Schema(
  {
    walletAddress: { type: String, required: true },
    notice: { type: noticeSchema, required: true },
    tokenId: { type: String },
    fromWalletAddress: {
      type: String,
    },
    trxHash: { type: String },
  },
  { timestamps: true },
);

// before saving wallet address to db, make it lower case
RedWalletSchema.pre("save", function (next) {
  this.walletAddress = this?.walletAddress?.toLowerCase();
  this.fromWalletAddress = this?.fromWalletAddress?.toLowerCase();
  next();
});
const RedWallet = mongoose.model("RedWallet", RedWalletSchema);
export default RedWallet;
