import Joi from "joi";

import validate from "../utils/validate.js";
//import logger from "../utils/logger.js";
/**
 * A middleware to validate schema.
 *
 * @param {Joi.Schema} params
 */
export function schema(params) {
  return async (req, _, next) => {
    try {
      // /logger.log("info", "Validating schema");
      await validate(req.body, params);
      next();
    } catch (err) {
      next(err);
    }
  };
}
