// ... Dependencies
const PurchaseController = require('../controllers/purchase_controller');
const ProposalController = require('../controllers/proposal_controller');
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
    
    // User logged in
    .use(Authorization.jwtMiddleware)

    // Min role level allowed: MEMBER
    .use(Authorization.enforceRole(USER_ROLES.MEMBER))

    .get(
        '/FindAdProposals/:cod_user/:cod_purchase_ad',
        Authorization.enforceParam('cod_user', matchCodUser),
        ProposalController.findAdProposals
    )

    .get(
      '/ShowAllReceived/:cod_user',
      Authorization.enforceParam('cod_user', matchCodUser),
      ProposalController.findAllProposalsReceived
    )

    .get(
      '/ShowAllSentActive/:cod_user',
      Authorization.enforceParam('cod_user', matchCodUser),
      ProposalController.findAllProposalsSent
    )

    .get(
        '/ShowAllSent/:cod_user',
        Authorization.enforceParam('cod_user', matchCodUser),
        ProposalController.findTotalSent
      )

    .post(
        '/create/:cod_user/:cod_purchase_id',
        Authorization.enforceParam('cod_user', matchCodUser), 
        ProposalController.create
    )

    .post(
      '/create/:cod_user/image/:cod_proposal',
      Authorization.enforceParam('cod_user', matchCodUser), 
      ProposalController.upload_picture
    )
    
    .put(
        '/cancel/:cod_user/:cod_proposal', 
        Authorization.enforceParam('cod_user', matchCodUser),
        ProposalController.cancel
    )

    .put(
      '/accept/:cod_user/:cod_proposal/:cod_purchase_ad', 
      Authorization.enforceParam('cod_user', matchCodUser),
      ProposalController.accept
    )

    .put(
      '/reject/:cod_user/:cod_proposal/:cod_purchase_ad', 
      Authorization.enforceParam('cod_user', matchCodUser),
      ProposalController.reject
  );

  express.use(path, router);
};