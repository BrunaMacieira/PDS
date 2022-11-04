// ... Dependencies
const PurchaseController = require('../controllers/purchase_controller');
const UserValidator = require('../validators/user_validator');
const Authorization = require('../middlewares/authorization');
const UserRouter = require('./user_router');
const UserController = require('../controllers/user_controller');
const {
  others: {
    USER_ROLES
  }
} = require('../models/models.js');

module.exports = function (path, express) {
  const router = require('express').Router();
   
  /* Auxiliary function to check if user matches own */
  const matchCodUser = (user, paramCodUser) => {
    if(user.cod_user !== paramCodUser) {
      throw new Error('Can only update itself');
    }

    //allowed
    return true;
  };



  router
    // Public routes
    .get(
      '/',
      PurchaseController.findAllOpen
    )

    .get(
      '/ShowByCategory',
      PurchaseController.findByCategory
    )

    .get(
      '/Highlighted',
      PurchaseController.findHighlighted
    )
    
    // User logged in
    .use(Authorization.jwtMiddleware)

    // Only admin can get all ads and delete ads
    .get(
        '/ShowAll',
        Authorization.enforceRole(USER_ROLES.ADMIN),
        PurchaseController.findAll
    )

    .delete(
        '/',
        Authorization.enforceRole(USER_ROLES.ADMIN),
        UserController.delete
    )

    // Min role level allowed: MEMBER
    .use(Authorization.enforceRole(USER_ROLES.MEMBER))

    .get(
        '/ShowActiveFavorites/:cod_user',
        Authorization.enforceParam('cod_user', matchCodUser),
        PurchaseController.findAllOpenFavorites
    )

    .get(
      '/ShowAllLoggedIn/:cod_user',
      Authorization.enforceParam('cod_user', matchCodUser),
      PurchaseController.findAllOpen
    )

    .get(
      '/ShowByCategoryHighlighted/:cod_user',
      Authorization.enforceParam('cod_user', matchCodUser),
      PurchaseController.findByCategoryHighlighted
    )

    .post(
        '/create/:cod_user',
        Authorization.enforceParam('cod_user', matchCodUser), 
        PurchaseController.create
    )

    .post(
      '/create/:cod_user/image/:cod_purchase_ad',
      Authorization.enforceParam('cod_user', matchCodUser), 
      PurchaseController.upload_picture
    )

    .put(
        '/update/:cod_user/:cod_purchase_ad',
        Authorization.enforceParam('cod_user', matchCodUser), 
        PurchaseController.update
    )
    
    .put(
        '/cancel/:cod_user/:cod_purchase_ad', 
        Authorization.enforceParam('cod_user', matchCodUser),
        PurchaseController.cancel
    );

  express.use(path, router);
};