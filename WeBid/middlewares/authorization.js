// ... Dependencies
const jwt_mw = require('express-jwt');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const BitArray = require('../utils/bit_array.js');

const {
  others: {
    USER_ROLES
  }
} = require('../models/models.js');

/* Permissions bit positions - capped at 31 permissions */
const BIT_POS_EMPRESA = {
  // Empresa
  EDIT_COMPANY_INFO: 0,
  DELETE_COMPANY: 1,
  
  READ_USERS: 2,
  INVITE_USERS: 3,
  REMOVE_USERS: 4,
  EDIT_USERS: 5,
  
  MANAGE_SUBSCRIPTION: 6,
};

/* JsonWebToken config */
//TODO: Get token secret dinamically
const JWT_CONFIG = {
  secret: 'c2ce00870b0a4a18bf2b93e570a8f90bf5c6c44ee72e479cb5d05d6ab99700cf',
  algorithms: ['HS256'],

  /* Get JWT token function */
  getToken: function fromHeaderOrQuerystring (req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      return req.query.token;
    }
    return null;
  },

  /* Get JWt token secret function */
  
};

module.exports = class Authorization {
  /* Get JWT token function */
  static getToken (req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      return req.query.token;
    }
    return null;
  }

  /**
   * Return JWT Bearer token
   *
   * @static
   */
  static generateToken(payload, expires = '15m') {
    return jwt.sign(payload, JWT_CONFIG.secret, {expiresIn: expires});
  }

  /**
   * Check if token is valid
   *
   * @static
   * @param {*} token
   * @return {*} 
   */
  static async verifyToken(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, JWT_CONFIG.secret, (err, decoded) => {
        if(err) return reject(err);
        resolve(decoded);
      });
    });
  }

  static async verifyUser(token) {
    const decoded = jwt.verify(token, JWT_CONFIG.secret);
    return decoded;
  }

  /**
   * Returns jwt middleware
   * 
   * attaches object to req.user
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @return {*} 
   */
  static jwtMiddleware(req, res, next) {
    return jwt_mw(JWT_CONFIG)(req, res, next);
  }

  /**
   * Aux fn to calculate role level
   *
   * @static
   * @param {USER_ROLES} role
   */
  static _getRoleLevel(role) {
    switch (role) {
      case USER_ROLES.ADMIN:
        return 3;

      case USER_ROLES.MEMBER:
        return 2;

      case USER_ROLES.VISITOR:
        return 1;
    
      default:
        return 0;
    }
  }

  /**
   * Enfore user role
   *
   * @static
   * @param {USER_ROLES} role
   * @return {*} 
   */
  static enforceRole(role) {
    return function(req, res, next) {
      if(
        !!(req.user) &&
        req.user.role in USER_ROLES &&
        Authorization._getRoleLevel(req.user.role) >= Authorization._getRoleLevel(role)
      ) {
        //Allowed, go to next middleware
        return next();
      }

      //Forbidden
      next(createError(403));
    };
  }

  /**
   * Validare URL param
   * ex: /users/:cod_user
   *    paramName: cod_user
   *    paramValue: req.cod.user
   *    
   *
   * @static
   * @param {String} paramName
   * @param {Function} getFn
   * @param {Object} options
   * @return {*} 
   */
  static enforceParam(paramName, getFn, options) {
    return async function(req, res, next) {
      try {
        if(typeof getFn !== 'function') {
          throw createError(500, 'getFn not provided');
        }

        if(typeof options !== 'object') options = {};

        const {
          unlessAdmin = true  //se role === Admin, allow
        } = options;

        if(unlessAdmin && req.user?.role === USER_ROLES.ADMIN) {
          return next();
        }

        if(!req.params[paramName]) {
          throw new Error('Param not found');
        }

        //Function must throw an error to stop user from proceeding
        await getFn(req.user, req.params[paramName]);

        //Allowed go to next middleware
        next();
      } catch (error) {
        //Forbidden
        next(createError(403, error));
      }
    };
  }

  /**
   * Generate 32-bit number (chmod like)
   *
   * @static
   * @param {Array} permissions
   * @return {Number} 
   */
  static generateFlag(permissions, bitPos) {
    if(!(permissions instanceof Array)) {
      throw new Error('Invalid permissions array');
    }

    const arr = new BitArray();

    for(let i = 0; i < permissions.length; i++) {
      const p = permissions[i].toUpperCase();

      if(typeof bitPos[p] === 'undefined') {
        throw new Error('Invalid permission to set');
      }

      arr.on(bitPos[p]);
    }

    return arr.toNumber();
  }

  /**
   * Return array of perms.
   *
   * @static
   * @param {Number} flag
   * @returns {Array}
   */
  static getFlagPermissions(flag, bitPos) {
    const arr = new BitArray(flag);
    const entries = Object.entries(bitPos);
    const res = [];

    for(const [perm, pos] of entries) {
      if(arr.get(pos)) {
        res.push(perm);
      }
    }

    return res;
  }

  /**
   * Check if flag has permission.
   *
   * @static
   * @param {String} permission
   * @param {Number} flag
   * @returns {Boolean}
   */
  static hasPermission(permission, flag) {
    return Authorization.getFlagPermissions(flag).includes(permission.toUpperCase());
  }

  /**
   * Validate flag, check if bit is on
   *
   * @static
   * @param {*} bitPos
   * @param {*} getFlagFn
   */
  static enforceFlagPermission(bitPos, getFlagFn) {
    return async function (req, res, next) {
      try {
        if(typeof getFlagFn !== 'function') {
          throw createError(500, 'getFlagFn not provided');
        }

        const flag = await getFlagFn(req);
        const arr = new BitArray(flag);

        if(!arr.get(+bitPos)) {
          throw createError(403);
        }

        //Allowed go to next middleware
        next();
      } catch (error) {
        //Forbidden
        next(createError(403, error));
      }
    };
  }
};

module.exports.BIT_POS_EMPRESA = BIT_POS_EMPRESA;