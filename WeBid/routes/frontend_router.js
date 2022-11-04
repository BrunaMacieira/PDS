// ... Dependencies
const FrontendController = require('../controllers/frontend_controller');


module.exports = function (path, express) {
  const router = require('express').Router();

  router
    .get( 
      '/pagamento/:cod_user/:cod_purchase_ad',
      FrontendController.pagamento
    )
    
  express.use(path, router);
};