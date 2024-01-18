import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import apiCollection from "../models/apiCollectionModel.js";
import HttpStatus from "http-status-codes";
const protect = asyncHandler(async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select("-password");
        next();
      } catch (error) {
        console.error(error);
        return res.status(401).send("Not authorized, no token");
      }
    }

    if (!token) {
      return res.status(401).send("Not authorized, no token");
    }
  } catch (err) {
    console.log(err);
    res.status(500);
  }
});

const apiCall = asyncHandler(async (req, res, next) => {
  try {
    const { apikey, apisecret } = req.headers;
    console.log(apikey, apisecret);
    if (apikey && apisecret) {
      try {
        const api = await apiCollection.findOne(
          { apiKey: apikey },
          "apiSecret isDeleted apiCallsCount",
        );
        if (!api || api.apiSecret !== apisecret) {
          return res.status(HttpStatus.UNAUTHORIZED).send("INVALID_API");
        } else {
          api.apiCallsCount++;
          await api.save();
        }
        next();
      } catch (error) {
        console.error(error);
        return res.status(HttpStatus.UNAUTHORIZED).send("INVALID_API");
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500);
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as an admin");
  }
};

export { protect, admin, apiCall };
