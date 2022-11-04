// ... Dependencies
const createError = require('http-errors');
const {
    models: {
        User,
        Company,
        Subscription,
        Subscription_track,
    }
} = require('../models/models.js');

module.exports = class SubscriptionController {

    static async findAllSubscriptions(req, res, next){
        try {
            if(req.path == '/particular'){
                res.status(301);
                const subsList = await Subscription.findAll({
                    where: {
                        target: "particular"
                    }
                });
                res.status(200).json(subsList);
            } else if(req.path == '/empresarial'){
                const subsList = await Subscription.findAll({
                    where: {
                        target: "empresarial"
                    }
                });
                res.status(200).json(subsList);
            } else
                res.status(404);
            
        } catch (error) {
            next(error);
        }
    }
    static async checkSubscription(req, res, next){
        try {
            const subscription = await Subscription.findOne({
                where: {
                    type: req.params.type,
                    target: req.params.target
                }
            });
          /*  await Subscription_track.create({
                cod_user: req.params.cod_user,
                cod_sub: subscription.
            });*/
            res.status(200).json(subscription);

        } catch (error) {
            next(error);
        }
    }
    static async gotoTarget(req, res, next){
        try {
            res.redirect('/' + req.target);
        }catch (error){
            next(error);
        }
    }
    static async mySubscription(req, res, next){
        try {

            const userID =  req.params.cod_user;
            const Sub = await Subscription_track.findOne({
                where: {
                    cod_user: userID,
                }
            });
            res.status(200).json(Sub);
        }catch (error){
            next(error);
        }
    }
};