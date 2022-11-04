// ... Dependencies
const Joi = require('joi');

/**
 * Create Joi schema
 *
 * @param {Object} keys
 */
const createSchema = keys => Joi.object().keys(keys);

/**
 * Validate Joi schema
 *
 * Will throw if any error is found
 * @param {Object} obj
 * @param {Joi.Schema} schema
 * @param {Object} options
 * @param {Boolean} options.throwIfEmpty will throw error if body is empty (default: true)
 */
const validateSchema = (obj, schema, options) => {
  if(typeof options !== 'object') options = {};

  const {
    throwIfEmpty = true
  } = options;

  const result = schema.validate(obj);
  if(throwIfEmpty && Object.keys(result.value).length === 0) throw new Joi.ValidationError('Empty object');
  if(result.error) throw result.error;
  return result.value;
};

module.exports = {
  createSchema,
  validateSchema,
  Joi
};