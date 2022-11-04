// ... Dependencies
const UserController = require('../controllers/user_controller');
const UserValidator = require('../validators/user_validator');
const Authorization = require('../middlewares/authorization');

const {
  others: {
    USER_ROLES
  }
} = require('../models/models.js');

module.exports = function (path, express) {
  const router = require('express').Router();

  //req.params -> caminho url /path/to/resource
  //req.query -> querystring <url>?arg1=a&arg2=b
  //req.body -> txt, form, json ...

  /* Auxiliary fn to check if user matches own */
  const matchCodUser = (user, paramCodUser) => {
    if(user.cod_user !== paramCodUser) {
      throw new Error('Can only update itself');
    }

    //allowed
    return true;
  };

  router
  
    //public routes 1st
    .post(
      '/', 
      UserValidator.create,
      UserController.create
    )
    
    .get(
      '/:cod_user/register/confirm',
      UserController.confirmRegister
    )

    .get(
      '/recover',
      UserController.recover
    )

    .get(
      '/:cod_user/recover/confirm',
      UserController.confirmRecover
    )

    //Ensure user is logged int (attach user to req => req.user)
    .use(Authorization.jwtMiddleware)

    //Only admin can get all users
    .get(
      '/',
      Authorization.enforceRole(USER_ROLES.ADMIN),
      UserController.findAll
    )

    // Min role level allowed: MEMBER
    .use(Authorization.enforceRole(USER_ROLES.MEMBER))

    .get(
      '/:cod_user',
      Authorization.enforceParam('cod_user', matchCodUser),
      UserController.findOne
    )
    .put(
      '/:cod_user',
      UserValidator.update,
      Authorization.enforceParam('cod_user', matchCodUser),
      UserController.update
    )
    .delete(
      '/:cod_user', 
      Authorization.enforceParam('cod_user', matchCodUser),
      UserController.delete
    );

  express.use(path, router);
};