import * as HttpStatus from "http-status-codes";

//import logger from "../utils/logger.js";

/**
 * Build error response for validation errors.
 *
 * @param  {Error} err
 * @return {Object}
 */
function buildError(err) {
  if (err.isJoi) {
    return {
      code: HttpStatus.StatusCodes.UNPROCESSABLE_ENTITY,
      data: {},
      message: HttpStatus.getStatusText(
        HttpStatus.StatusCodes.UNPROCESSABLE_ENTITY,
      ),
      errors:
        err.details &&
        err.details.map((error) => ({
          param: error.path.join("."),
          message: error.message.replace(/['"]/g, ""),
        })),
    };
  }

  if (err.isBoom) {
    return {
      code: err.output.statusCode,
      message: err.output.payload.message || err.output.payload.error,
    };
  }

  if (err.isCustom) {
    return {
      code: err.statusCode,
      message: err.message,
    };
  }

  return {
    code: HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR,
    message: HttpStatus.getStatusText(
      HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR,
    ),
  };
}

/**
 * Generic error response middleware for internal server errors.
 *
 * @param  {any} err
 * @param  {Request} req
 * @param  {Response} res
 * @param  {NextFunction} next
 * @returns void
 */
export default function genericErrorHandler(
  err,
  _,
  res,
  // TODO: Remove this.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  __,
) {
  const error = buildError(err);

  //logger.log("error", "Error: %s", err.stack || err.message);

  res.status(error.code).json(error);
}
