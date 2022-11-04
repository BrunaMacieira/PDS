// ... Dependencies
const SubscriptionController = require('../controllers/subscription_controller');
const UserValidator = require('../validators/user_validator');
const Authorization = require("../middlewares/authorization");

const {
    models: {
        User,
        Company,
        Subscription,
        Subscription_track,
    },
    others: {
        USER_ROLES
    }
} = require('../models/models.js');
module.exports = function (path, express) {
    const router = require('express').Router();
    router
        //Ensure user is logged int (attach user to req => req.user)
        //.use(Authorization.jwtMiddleware)

        // Min role level allowed: MEMBER
        //.use(Authorization.enforceRole(USER_ROLES.MEMBER))

        .get(
            '/',
        )
        .get(

            '/:target',
            SubscriptionController.findAllSubscriptions,
        )
        .get(
            '/:target/:type',
            SubscriptionController.checkSubscription,
        )
        .get(
            '/mySubscription',
             SubscriptionController.mySubscription,
        )
        .post(
            '/:target',
            SubscriptionController.gotoTarget,
        );
    express.use(path, router);


};