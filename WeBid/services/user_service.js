// ... Dependencies
const {
  models: {
    User
  }
} = require('../models/models.js');

const SENSIBLE_USER_FIELDS = ['password', 'token_secret'];

module.exports = class UserService {
  /**
   * Return user info
   *
   * @static
   * @param {*} options
   */
  static async getUserInfo(options, showSensibleInfo = false) {
    if(typeof options !== 'object') options = {};

    options = {
      ...options,
      attributes: {
        exclude: showSensibleInfo ? [] : SENSIBLE_USER_FIELDS
      }
    };

    return await User.findOne(options);
  }

  /**
   * Remove sensible fields from user object
   *
   * @static
   * @param {*} user
   */
  static omitUserSensibleInfo(user) {
    if(typeof user !== 'object') {
      throw new Error('Invalid user object');
    }

    for(let i = 0; i < SENSIBLE_USER_FIELDS.length; i++) {
      const f = SENSIBLE_USER_FIELDS[i];
      if(typeof user[f] !== 'undefined') delete user[f];
    }

    return user;
  }
};