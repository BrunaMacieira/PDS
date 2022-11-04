// ... Dependencies
const createError = require('http-errors');
const schedule = require('node-schedule');
const UserService = require('../services/user_service.js');
const Authorization = require('../middlewares/authorization');
const config = require('../config.json');

const {
  models: {
    User,
    Rating
  }
} = require('../models/models.js');
const { restore } = require('../models/user_model.js');
const { date } = require('joi');
const { DataTypes } = require('sequelize');
const Sequelize = require('sequelize');
const PurchaseAd = require('../models/purchase_ad_model.js');
const Proposal = require('../models/proposal_model.js');
const Op = Sequelize.Op;


module.exports = class RatingController {
  /**
   * Return all ratings from user
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async findMyRatings(req, res, next) {
    try {
        const cod_user = req.params.cod_user;
      let ratings = await Rating.findAll({
          where: {
              cod_user: cod_user
          }
      });
      
      res.status(200).json(ratings);
    } catch (error) {
      next(error);
    }
  }

    /**
   * Return all ratings sent
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
     static async findMyEvals(req, res, next) {
      try {
        const cod_user = req.params.cod_user;
        let ratings = await PurchaseAd.findAll({
          where: {
            cod_evaluator: cod_user
          }
        });
        
        res.status(200).json(ratings);
      } catch (error) {
        next(error);
      }
    }

    /**
   * Return all ratings pending from given user
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
    static async findProposalsAwaitingEval(req, res, next) {
        try {
            const cod_user = req.params.cod_user;
            
            let ratings = await Proposal.findAll({
                where: {
                    [Op.and]: [
                        { cod_user: cod_user },
                        { eval_as_seller: false },
                        { status: 'completed'}
                    ]
                }
            });

            let adsBuyer = await PurchaseAd.findAll({
                where: {
                    [Op.and]: [
                        { cod_user: cod_user},
                        { status: 'completed' }
                    ]
                }
            });

            let adsCompleted = [];

            adsBuyer.forEach( (element) => {
                adsCompleted.push(element.cod_purchase_ad);
            })

            let ratingsAux = await Proposal.findAll({
                where: {
                    [Op.and]: [
                        { cod_purchase_ad: {[Op.in]: [{ adsCompleted }]} },
                        { eval_as_buyer: false },
                        { status: 'completed'}
                    ]
                }
            });

            ratingsAux.forEach( (element) => {
                ratings.push(element);
            })
            
            res.status(200).json(ratings);
        } catch (error) {
            next(error);
        }
    }

  /**
   * Create new rating as a buyer
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async createRatingAsBuyer(req, res, next) {
    try {
        const cod_evaluator = req.params.cod_evaluator;
        const cod_user = req.body.cod_user;
        const cod_proposal = req.body.cod_proposal;
        const proposal = await Proposal.findOne({
            where: cod_proposal
        })
        
        if ((proposal.eval_as_buyer == false) && (proposal.status == 'completed'))
        {
            const ad = await Rating.create(req.body);
            const update = await Proposal.update({ eval_as_buyer: true });


            // Calculate and update avg of ratings
            const ratings = await Rating.findAll({ where: cod_user });
            let avgRate = [];

            ratings.forEach( (element) => {
                avgRate.push(element.rate);
            })

            // Function to calculate avg
            const average = arr => arr.reduce((a,b) => a + b, 0) / arr.length;

            const avgResult = average(avgRate).toFixed(1); // 1 decimal number -> toFixed(1)
            const updateUser = await User.update({ average_rate: avgResult }, { where: {cod_user}});

              
            res.status(200).json(ad);
        }

        res.status(403);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new rating as a seller
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
   static async createRatingAsSeller(req, res, next) {
    try {
        const cod_evaluator = req.params.cod_evaluator; // author of this rating
        const cod_user = req.body.cod_user;
        const cod_proposal = req.body.cod_proposal;
        const proposal = await Proposal.findOne({
            where: cod_proposal
        })
        
        if ((proposal.eval_as_seller == false) && (proposal.status == 'completed'))
        {
            const ad = await Rating.create(req.body);
            const updateProposal = await Proposal.update({ eval_as_seller: true }, {where: {cod_proposal}});

            // Calculate and update avg of ratings
            const ratings = await Rating.findAll({ where: cod_user });
            let avgRate = [];

            ratings.forEach( (element) => {
                avgRate.push(element.rate);
            })

            // Function to calculate avg
            const average = arr => arr.reduce((a,b) => a + b, 0) / arr.length;

            const avgResult = average(avgRate).toFixed(1); // 1 decimal number -> toFixed(1)
            const updateUser = await User.update({ average_rate: avgResult }, { where: {cod_user}});
            
            res.status(200).json(ad);
        }


        res.status(403);
  
    } catch (error) {
      next(error);
    }
  }
};

