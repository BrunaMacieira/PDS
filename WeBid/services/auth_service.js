// ... Dependencies
const {nanoid} = require('nanoid');
const Authorization = require('../middlewares/authorization.js');
const UserService = require('./user_service.js');


module.exports = class AuthService {
  /**
   * Returns access token
   *
   * @static
   * @memberof AuthService
   */
  static async generateAccessToken(username) {
    const user = (await UserService.getUserInfo({where: {username}})).get({plain: true});
    
    const exp_str = '15m';
    const delay = 500;
    const exp_num = 60 * 1000 * 15 - delay;

    return {
      token: Authorization.generateToken(user, exp_str),
      user,
      expires: exp_num,
    };
  }

  /**
   * Gera refresh token
   *
   * @static
   */
  static generateRefreshToken(username) {
    return nanoid(256);
  }
};