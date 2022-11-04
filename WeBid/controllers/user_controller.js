// ... Dependencies
const createError = require('http-errors');
const UserService = require('../services/user_service.js');
const WebpushService = require('../services/webpush_service.js');

const {
  models: {
    User
  }
} = require('../models/models.js');
const { nanoid } = require('nanoid');
const { Op } = require('sequelize');

module.exports = class UserController {
  /**
   * Return all users in database
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async findAll(req, res, next) {
    try {
      const users = await User.findAll({
        attributes: {
          exclude: ['password']
        }
      });
      
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Return user info
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async findOne(req, res, next) {
    try {
      const cod_user = req.params.cod_user;

      const user = await User.findOne({
        where: {
          cod_user
        },
      });

      if(!user) {
        throw createError(404);
      }
      
      res.status(200).json(UserService.omitUserSensibleInfo(user));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register new user
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async create(req, res, next) {
    try {
      /* nome, username, password */
      const username = req.body.username;

      let user = await User.findOne({
        where: {
          username
        }
      });

      if(user) {
        throw createError(409);
      }

      const cod_ver_email = nanoid();

      user = (await User.create({
        ...req.body,
        cod_ver_email
      })).get({plain: true});

      //Send email with url masked: https://<our_server_dns>/users/cod_user/register/confirm?code=cod_ver_email
      res.status(200).json(UserService.omitUserSensibleInfo(user));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirm user register
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async confirmRegister(req, res, next) {
    try {
      const cod_user = req.params.cod_user;
      const cod_ver_email = req.query.code;

      const user = await User.findOne({
        where: {
          cod_user,
          cod_ver_email,
          email_verified: false
        }
      });

      if(!user) {
        throw createError(400);
      }

      //user exists, verify email and nullify code
      const updated = await User.update({
        email_verified: true,
        cod_ver_email: null,
      }, {
        where: {
          cod_user
        }
      });

      res.status(200).json(UserService.omitUserSensibleInfo(updated));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Setup user recovery
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async recover(req, res, next) {
    try {
      const {
        username,
        email
      } = req.query;

      let user = null;

      if(email) {
        //search by email
        user = await User.findOne({
          where: {
            email
          }
        });
      }
      else {
        //search by username
        user = await User.findOne({
          where: {
            username
          }
        });
      }

      if(!user) {
        throw createError(400);
      }

      const cod_recovery = nanoid();
      user = await user.update({
        cod_recovery,
        recovery_expiry_date: Date.now() + (1 * 1000 * 60 * 15) //15 minutos
      });

      //Send email with url masked: https://<our_server_dns>/users/cod_user/recover/confirm?code=cod_recovery
      const emailSlug = '';
      // res.status(200).json({slug: emailSlug});
      res.status(200).json({cod_recovery});
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirm user recovery
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async confirmRecover(req, res, next) {
    try {
      const cod_recovery = req.query.code;
      const cod_user = req.params.cod_user;

      let user = await User.findOne({
        where: {
          cod_recovery,
          cod_user,
          recovery_expiry_date: {
            [Op.gt]: Date.now()
          }
        }
      });

      if(!user) {
        throw createError(400);
      }

      //update with new password and nullify cod_recovery
      user = await user.update({
        cod_recovery: null,
        password: req.query.password
      });

      res.status(200).json(UserService.omitUserSensibleInfo(user));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update existing user
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async update(req, res, next) {
    try {
      const cod_user = req.params.cod_user;

      const updated = await User.update(req.body, {where: {cod_user}});
      
      if(!updated) {
        throw createError(404);
      }
      
      res.status(200).json(UserService.omitUserSensibleInfo(updated));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete existing user
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async delete(req, res, next) {
    try {
      const {
        cod_user,
      } = req.params;
      
      const user = await User.findOne({where: {cod_user}});

      if(!user) {
        throw createError(404);
      }

      await user.destroy({
        force: false
      });

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Subscribe current user to webpush notifications
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async subscribeToPush(req, res, next) {
    try {
      //get push subscription object from the request
      const subscription = req.body;

      //save user subscription
      const user = await User.update({
        webpush_sub: subscription
      }, {
        where: {
          cod_user: req.user.cod_user
        }
      });

      await WebpushService.send(subscription, {title: 'Thanks for subscribing !'});
  
      //send status 201 for the request
      res.status(201).end();
    } catch (error) {
      next(error);
    }
  }
};