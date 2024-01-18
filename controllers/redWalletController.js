import RedWallet from "../models/redWallet.js";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import HttpStatus from "http-status-codes";
import Web3 from "web3";
import dotenv from "dotenv";
import { sendNotice as SendTrx } from "../services/Web3.js";
import axios from "axios";
import Bottleneck from "bottleneck";
import TransactionIndex from "../models/TransactionIndexed.js";

dotenv.config();
const sendNotice = asyncHandler(async (req, res) => {
  try {
    // get data from req body
    const {
      walletAddress,
      country,
      department,
      caseNumber,
      category,
      subCategory,
      noticeContent,
      actionLink,
      imageLink,
      investigationOffice,
      issueDate,
      lastDate,
      fromWalletAddress,
    } = req.body;

    // now create notice object
    const notice = {
      country,
      department,
      caseNumber,
      category,
      subCategory,
      noticeContent,
      actionLink,
      imageLink,
      investigationOffice,
      issueDate,
      lastDate,
    };

    // now create red wallet object
    const redWalletObject = {
      walletAddress,
      notice,
      fromWalletAddress,
    };

    // save red wallet object to db
    const redWalletObjectCreated = await RedWallet.create(redWalletObject);

    // send notice
    const sendNoticeResponse = await SendTrx(walletAddress, notice);
    console.log(sendNoticeResponse);
    if (sendNoticeResponse.success) {
      // update red wallet object
      redWalletObjectCreated.tokenId = sendNoticeResponse.tokenId;
      redWalletObjectCreated.trxHash = sendNoticeResponse.trxHash;
      await redWalletObjectCreated.save();
    }

    watchOutgoingTransactions();

    // send response
    res.status(200).json({
      data: redWalletObjectCreated,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ code: 500, message: "Internal Server Error" });
  }
});

const getAllNotice = asyncHandler(async (req, res) => {
  try {
    // get all notice from db
    const allNotice = await RedWallet.find({});

    // send response
    res.status(200).json(allNotice);
  } catch (err) {
    console.log(err);
    res.status(500).send({ code: 500, message: "Internal Server Error" });
  }
});

const watchOutgoingTransactions = async () => {
  try {
    console.log("!!!! Watching Outgoing Transactions Started !!!!");

    // fetch all red wallets
    const allRedWalletObjects = await RedWallet.find({});
    const etherscanApiUrl = process.env.ETHERSCAN_API_URL;
    const etherscanApiKey = process.env.ETHERSCAN_API_KEY;

    // Calculate the timestamp for 24 hours ago
    const twentyFourHoursAgo = Math.floor(
      (Date.now() - 24 * 60 * 60 * 1000) / 1000,
    );

    // Configure rate limiting (2 requests per second)
    const limiter = new Bottleneck({
      reservoir: 5, // Initial token count
      reservoirRefreshInterval: 1000, // Refill tokens every 1000 ms (1 second)
      maxConcurrent: 5, // Maximum concurrent requests
    });

    // Function to fetch transactions with rate limiting
    const fetchTransactions = async (walletAddress) => {
      try {
        const response = await limiter.schedule(() =>
          axios.get(etherscanApiUrl, {
            params: {
              module: "account",
              action: "txlist",
              address: walletAddress,
              startblock: 0,
              endblock: "latest",
              sort: "desc",
              apikey: etherscanApiKey,
            },
          }),
        );
        const allTransactions = await TransactionIndex.find({});
        // Filter transactions with value >= 0.00001 ETH and within the last 24 hours
        const filteredTransactions = (response.data.result || []).filter(
          (transaction) =>
            Number(transaction?.timeStamp) >= twentyFourHoursAgo &&
            Number(transaction?.value) >= 1000000000000000 &&
            !allTransactions.find(
              (t) =>
                t?.transactionHash?.toLowerCase() ==
                transaction?.hash.toLowerCase(),
            ),
        );

        return filteredTransactions;
      } catch (error) {
        console.error(
          `Error fetching transactions for ${walletAddress}:`,
          error,
        );
        return [];
      }
    };

    // Iterate over each red wallet and fetch transactions
    for (const redWalletObject of allRedWalletObjects) {
      const transactions = await fetchTransactions(
        redWalletObject.walletAddress,
      );

      // Process transactions as needed
      console.log(
        `Transactions for ${redWalletObject.walletAddress}:`,
        transactions.length,
      );

      // for each transaction get the destination wallet
      for (const transaction of transactions) {
        // check if transaction is already indexed
        const transactionIndexed = await TransactionIndex.findOne({
          transactionHash: transaction.hash,
        });
        if (transactionIndexed) {
          continue;
        }
        console.log(`Processing transaction ${transaction.hash}`);

        // check if destination wallet is already red wallet
        const redWallet = await RedWallet.findOne({
          walletAddress: transaction.to,
        });
        if (redWallet) {
          // save transaction to db
          await TransactionIndex.create({
            transactionHash: transaction.hash,
            from: transaction.from,
            to: transaction.to,
            value: transaction.value,
            time: transaction.timeStamp,
            indexed: true,
          });
          continue;
        }
        console.log(`New Red wallet found for ${transaction.to}`);
        // get destination wallet
        const destinationAddress = transaction.to;
        const newRedWalletObject = {
          walletAddress: destinationAddress,
          notice: redWalletObject.notice,
          fromWalletAddress: redWalletObject.walletAddress,
        };
        // send notice
        const notice = {
          caseNumber: redWalletObject.notice.caseNumber,
          country: redWalletObject.notice.country,
          department: redWalletObject.notice.department,
          category: redWalletObject.notice.category,
          subCategory: redWalletObject.notice.subCategory,
          noticeContent: redWalletObject.notice.noticeContent,
          actionLink: redWalletObject.notice.actionLink,
          imageLink: redWalletObject.notice.imageLink,
          investigationOffice: redWalletObject.notice.investigationOffice,
          issueDate: redWalletObject.notice.issueDate,
          lastDate: redWalletObject.notice.lastDate,
        };

        const sendNoticeResponse = await SendTrx(destinationAddress, notice);
        if (sendNoticeResponse.success) {
          // update red wallet object
          newRedWalletObject.tokenId = sendNoticeResponse.tokenId;
          newRedWalletObject.trxHash = sendNoticeResponse.trxHash;
        }
        // save transaction to db
        await TransactionIndex.create({
          transactionHash: transaction.hash,
          from: transaction.from,
          to: transaction.to,
          value: transaction.value,
          time: transaction.timeStamp,
          indexed: true,
        });
        // save red wallet object to db
        await RedWallet.create(newRedWalletObject);
      }
    }
  } catch (err) {
    console.error("Error setting up outgoing transaction subscription:", err);
  }
};

const watch = () => {
  watchOutgoingTransactions().then(() => {
    console.log("!!!! Watching Outgoing Transactions Finished !!!!");

    watch();
  });
};
watch();
export { sendNotice, getAllNotice };
