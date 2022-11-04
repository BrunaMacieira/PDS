// ... Dependencies
const AuthController = require('../controllers/auth_controller');
const Authorization = require('../middlewares/authorization');
const UserController = require('../controllers/user_controller.js');

module.exports = function (path, express) {
  const router = require('express').Router();

  router
    .post('/authenticate', AuthController.authenticate)
    .post('/refresh_token', Authorization.jwtMiddleware, AuthController.refreshToken)
    .post('/logout', Authorization.jwtMiddleware, AuthController.logout)
    .post('/subscribe', Authorization.jwtMiddleware, UserController.subscribeToPush);

  express.use(path, router);
};
