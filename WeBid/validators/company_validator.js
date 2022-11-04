// ... Dependencies
const {createSchema, validateSchema, Joi} = require('./base_validator.js');
const {
  models: {
    CompanyUser: {
      ESTADOS
    }
  }
} = require('../models/models.js');

const companySchema = _ => ({
  nome: Joi.string().required(),
});

const companyUserSchema = (permsArray) => ({
  perms: Joi.array().items(Joi.string().valid(...permsArray)).optional(),
  estado: Joi.string().valid(...Object.values(ESTADOS)).optional(),
  email: Joi.string().email()
});

module.exports = class CompanyValidator {
  /**
   * Validate create request
   *
   * @static
   * @return {*} 
   */
  static create(req, res, next) {
    try {
      const schema = companySchema();
      validateSchema(req.body, createSchema(schema));
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate update request
   *
   * @static
   * @return {*} 
   */
  static update(req, res, next) {
    try {
      const schema = companySchema();
      validateSchema(req.body, createSchema(schema));
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate companyUser request
   *
   * @static
   * @return {*} 
   */
  static companyUser(permsArray) {
    return function(req, res, next) {
      try {
        const schema = companyUserSchema(permsArray);
        validateSchema(req.body, createSchema(schema));
        next();
      } catch (error) {
        next(error);
      }
    };
  }
};
