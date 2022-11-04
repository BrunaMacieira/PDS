// ... Dependencies
const createError = require('http-errors');
const AuthService = require('../services/auth_service.js');
const UserService = require('../services/user_service.js');
const {nanoid} = require('nanoid');
const {
  models: {
    User
  }
} = require('../models/models.js');
const models = require('../models/models.js');

module.exports = class AuthController {
  /**
   * Authenticates user, if valid
   * sends access token
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async authenticate(req, res, next) {   
    try {
      const b64auth = (req.headers.authorization || '').split(' ')[1] || ''; 
      const [username, password] = Buffer.from(b64auth, 'base64').toString().split(':');
      const user = await UserService.getUserInfo({where: {username}}, true);

      if(!user || !(await user.validPassword(password))) {
        throw createError(401);
      }

      //gerar tokens
      const refresh_token = AuthService.generateRefreshToken();

      //actualizar refresh_token
      await User.update({
        refresh_token
      }, {
        where: {
          username
        }
      });

      res.cookie('refresh_token', refresh_token);

      //gerar token de acesso depois de actualizar ref token, pq
      //e validado no obj req.user o qual e extraido do token
      const token = await AuthService.generateAccessToken(username);

      res.status(200).json({
        ...token,
        type: 'Bearer'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refreshes user token
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async refreshToken(req, res, next) {
    try {
      const user = await UserService.getUserInfo({where:{cod_user: req.user.cod_user}});

      const old_refresh_token = req.cookies.refresh_token;

      // console.log('user: ', user);
      // console.log('req.user: ', req.user);
      // console.log('old_refresh_token: ', old_refresh_token);

      if(
        typeof user !== 'object' ||
        old_refresh_token !== req.user.refresh_token ||
        old_refresh_token !== user.refresh_token
      ) {
        throw createError(401);
      }

      //gerar novos tokens
      const new_refresh_token = AuthService.generateRefreshToken();

      //actualizar refresh_token
      await User.update({
        refresh_token: new_refresh_token
      }, {
        where: {
          cod_user: user.cod_user
        }
      });

      res.cookie('refresh_token', new_refresh_token);

      const token = await AuthService.generateAccessToken(user.email);
      res.status(200).json({
        ...token,
        type: 'Bearer'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logs user out
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async logout(req, res, next) {
    try {
      const user = await UserService.getUserInfo({where:{cod_user: req.user.cod_user}});

      if(!user) {
        throw createError(401);
      }

      //actualizar token_secret
      await User.update({
        token_secret: nanoid()
      }, {
        where: {
          cod_user: user.cod_user
        }
      });

      res.cookie('refresh_token', '');

      res.status(200).end();
    } catch (error) {
      next(error);
    }
  }
};