// ... Dependencies
const {createSchema, validateSchema, Joi} = require('./base_validator.js');

const strongPasswordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
const stringPassswordError = new Error('Please provide a strong password with at least: 8 digits, 1 upper, 1 lower, 1 symbol, 1 number');

const userSchema = _ => ({
  username: Joi.string().min(5),
  // password: Joi.string().regex(strongPasswordRegex).error(stringPassswordError),
  password: Joi.string().min(8),
  morada: Joi.string().optional(),
  concelho: Joi.string().optional(),
  distrito: Joi.string().optional(),
  nome: Joi.string().optional(),
  email: Joi.string().email().optional(),
});

module.exports = class UserValidator {
  /**
   * Validate create user request
   *
   * @static
   * @param {Object} obj
   * @return {*} 
   */
  static create(req, res, next) {
    //make (username, password) required & nome optional
    try {
      const schema = userSchema();
      schema.username = schema.username.required();
      schema.password = schema.password.required();
      validateSchema(req.body, createSchema(schema));
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate update user request
   *
   * @static
   * @param {Object} obj
   * @return {*} 
   */
  static update(req, rex, next) {
    //all optional
    try {
      const schema = userSchema();
      Object.keys(schema).forEach(k => schema[k] = schema[k].optional());
      validateSchema(req.body, createSchema(schema));
      next();
    } catch (error) {
      next(error);
    }
  }
};
