// ... Dependencies
const RatingController = require('../controllers/rating_controller');
const UserValidator = require('../validators/user_validator');
const Authorization = require('../middlewares/authorization');
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
        '/FindMyRatings/:cod_user',
        Authorization.enforceParam('cod_user', matchCodUser),
        RatingController.findMyRatings
    )

    .get(
      '/FindMyEvals/:cod_user',
      Authorization.enforceParam('cod_user', matchCodUser),
      RatingController.findMyEvals
    )

    .get(
      '/FindProposalsAwaitingEval/:cod_user',
      Authorization.enforceParam('cod_user', matchCodUser),
      RatingController.findProposalsAwaitingEval
    )

    .post(
        '/createRatingAsSeller/:cod_evaluator',
        Authorization.enforceParam('cod_evaluator', matchCodUser), 
        RatingController.createRatingAsSeller
    )

    .post(
        '/createRatingAsBuyer/:cod_evaluator',
        Authorization.enforceParam('cod_evaluator', matchCodUser), 
        RatingController.createRatingAsBuyer
    );

  express.use(path, router);
};