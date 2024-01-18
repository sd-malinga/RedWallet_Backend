import express from "express";
import redWalletRouter from "./redWalletRoutes.js";
const router = express.Router();

router.use("/redWallet", redWalletRouter);

export default router;
