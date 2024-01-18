import express from "express";
const app = express();
import dotenv from "dotenv";
import morgan from "morgan";
import connectDb from "./db.js";
import cors from "cors";
import bodyParser from "body-parser";
import { errors } from "celebrate";
import genericErrorHandler from "./middlewares/genericErrorHandler.js";
dotenv.config();
import router from "./routes/index.js";
import "./versionChecker.js";
connectDb();

app.use(bodyParser.json());
app.use(express.json());

app.use(morgan("dev"));
app.use(cors());

app.use("/v1", router);

app.get("/", (req, res) => {
  res.json({ message: "Test Succesfull" });
});

const PORT = process.env.PORT;
app.use(errors()); // <--- Should be here
app.use(genericErrorHandler);
app.listen(PORT, () => console.log(`Server is Running on Port ${PORT}`));
