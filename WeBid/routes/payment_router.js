// ... Dependencies
const PurchaseController = require('../controllers/purchase_controller');
const ProposalController = require('../controllers/proposal_controller');
const UserValidator = require('../validators/user_validator');
const Authorization = require('../middlewares/authorization');
const UserRouter = require('./user_router');
const UserController = require('../controllers/user_controller');
const PaymentController = require('../controllers/payment_controller');
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
    .use(Authorization.jwtMiddleware)

    // Min role level allowed: MEMBER
    .use(Authorization.enforceRole(USER_ROLES.MEMBER))

    .get(
      '/findAllPayments/:cod_user',
      PaymentController.findAllUser
    )
    .get(
        '/FindAllPaymentsUser/:cod_user',
        Authorization.enforceParam('cod_user', matchCodUser),
        PaymentController.findAllPaymentsUser
    )

    .get(
      '/FindAllPendingPaymentsUser/:cod_user',
      Authorization.enforceParam('cod_user', matchCodUser),
      PaymentController.findAllPendingPaymentsUser
    )

    .get(
      '/FindAllReceivedUser/:cod_user',
      Authorization.enforceParam('cod_user', matchCodUser),
      PaymentController.findAllReceivedUser
    )

    .put(
        '/Pay/:cod_user',
        Authorization.enforceParam('cod_user', matchCodUser), 
        PaymentController.pay
    );

  express.use(path, router);
};