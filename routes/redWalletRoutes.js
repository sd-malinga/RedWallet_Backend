import express from "express";
import {
  sendNotice,
  getAllNotice,
} from "../controllers/redWalletController.js";
import * as validate from "../middlewares/validate.js";
import { RedWalletSchema } from "../validators/redWalletValidators.js";
const apiRouter = express.Router();

apiRouter.post("/send-notice", validate.schema(RedWalletSchema), sendNotice);
apiRouter.get("/get-all-notice", getAllNotice);
export default apiRouter;
