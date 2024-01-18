/**
 * Utility helper for Joi validation.
 *
 * @param <T> data
 * @param <Joi.Schema> schema
 * @returns <Promise>
 */
export default async function validate(data, schema) {
  return await schema.validateAsync(data, { abortEarly: false });
}
