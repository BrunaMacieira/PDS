// ... Dependencies
const createError = require('http-errors');
const schedule = require('node-schedule');
const UserService = require('../services/user_service.js');
const Authorization = require('../middlewares/authorization');
const config = require('../config.json');

const {
  models: {
    User,
    PurchaseAd,
    Proposal
  }
} = require('../models/models.js');
const { restore } = require('../models/user_model.js');
const { date } = require('joi');
const { DataTypes } = require('sequelize');
const Sequelize = require('sequelize');
const Payment = require('../models/payment_model.js');
const Op = Sequelize.Op;


module.exports = class ProposalController {


    /**
   * Return all proposal in database with status "pending" from an Ad
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
     static async findAdProposals(req, res, next) {
      try {
        const cod_purchase_ad = req.params.cod_purchase_ad;
        let proposals = await PurchaseAd.findAll({
          where: {
            [Op.and]: [
                { cod_purchase_ad: cod_purchase_ad },
                { status: 'pending'}
              ]
          }
        });
        
        res.status(200).json(proposals);
      } catch (error) {
        next(error);
      }
    }


    /**
   * Return all pending proposals in database as a Buyer (from own ads)
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
    static async findAllProposalsReceived(req, res, next) {
        try {
            const cod_user = req.params.cod_user;

            let ads = await PurchaseAd.findAll({
                where: {
                    [Op.and]: [
                        { cod_user: cod_user },
                        { status: 'pending'}
                    ]
                }});

            adsList = []
            ads.forEach( (element) => {
                adsList.push(element.cod_purchase_ad);
            })

          let proposals = await Proposal.findAll({
            where: {
              [Op.and]: [
                { cod_purchase_ad: {[Op.in]: 
                    {adsList}
                }},
                { status: 'pending'}
              ]
            }
          })
            
            
            res.status(200).json(proposals);
        } catch (error) {
            next(error);
        }
    }


     /**
   * Return all pending proposals in database as a Seller (from own ads)
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
      static async findAllProposalsSent(req, res, next) {
        try {
            const cod_user = req.params.cod_user;

          let proposals = await Proposal.findAll({
            where: {
              [Op.and]: [
                { cod_user: cod_user},
                { status: 'pending'}
              ]
            }
          });
            
            res.status(200).json(proposals);
        } catch (error) {
            next(error);
        }
    }


  /**
   * Return total proposals sent
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
   static async findTotalSent(req, res, next) {
    try {
        const cod_user = req.params.cod_user;

        let proposals = await Proposal.findAll({
          where: 
            { cod_user: cod_user}
          
        });
          
        res.status(200).json(proposals);
    } catch (error) {
      next(error);
    }
  }

  

  /**
   * Create new proposal
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async create(req, res, next) {
    try {
        const cod_purchase_ad = req.params.cod_purchase_ad;
        const proposal = await Proposal.create(req.body);
        const ad = await PurchaseAd.findOne({
            where: cod_purchase_ad
        })


      if ((ad.auto_sale == true) && (ad.condition == (proposal.condition || 'any')) && (ad.min_price >= proposal.value) && (ad.status == 'created'))
      {
        const update_ad = await PurchaseAd.update({status: 'payment'}, {where: 
            { cod_purchase_ad: proposal.cod_purchase_ad }
          });
        const update_prop = await Proposal.update({status: 'payment'}, {where: 
            { cod_proposal: proposal.cod_proposal }
          });
          res.status(204).json(update_prop);
      }

      res.status(201).json(proposal);
  
    } catch (error) {
      next(error);
    }
  }

    /**
   * Accept existing proposal
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async accept(req, res, next) {
    try {
      const cod_user = req.params.cod_user;
      const cod_proposal = req.params.cod_proposal;
      const cod_purchase_ad = req.params.cod_purchase_ad;
      const cod_user_offer = await Proposal.findOne({where: cod_proposal});

      const purchase_ad = await PurchaseAd.findOne({where: cod_purchase_ad});
      let updated = [];

      if ((purchase_ad.cod_purchase_ad == cod_purchase_ad) && (purchase_ad.cod_user == cod_user))
      {
        updated = await Proposal.update({status: 'payment'}, {
          where: 
            cod_proposal
        });

        const update_ad = await PurchaseAd.update({status: 'payment'}, {where: 
          { cod_purchase_ad: cod_purchase_ad }
        });

        const payment = await Payment.create({
          cod_user_payment: cod_user_offer,
          cod_user_receive: cod_user,
          value: updated.value,
          status: 'pending'
        });
      }
        
      if(!updated) {
        res.status(406);
      }
        
      res.status(204).json(updated);
    } catch (error) {
      next(error);
    }
}


  /**
   * Reject existing proposal
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
   static async reject(req, res, next) {
    try {
      const cod_user = req.params.cod_user;
      const cod_proposal = req.params.cod_proposal;
      const cod_purchase_ad = req.params.cod_purchase_ad;

      const purchase_ad = await PurchaseAd.findOne({where: cod_purchase_ad});

      if ((purchase_ad.cod_purchase_ad == cod_purchase_ad) && (purchase_ad.cod_user == cod_user))
      {
        const updated = await Proposal.update({status: 'rejected'}, {
          where: 
            cod_proposal
        });
      }
        
      if(!updated) {
        res.status(406);
      }
        
      res.status(204).json(updated);
    } catch (error) {
      next(error);
    }
}


  /**
   * Upload a picture to a proposal
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
   static async upload_picture(req, res, next) {
    try {
      const updated = await Proposal.update({
        image: req.files.image.data
      }, {where: {
        [Op.and]: [
            { cod_user: req.params.cod_user },
            { cod_purchase_ad: req.params.cod_purchase_ad },
            { status: 'created'}
          ]
      }}).then(image => {
        try{
        }catch(e){
          console.log("Image Blob error: " + e);
        }
      })
      ;

      res.status(200).json(updated);
  
    } catch (error) {
      next(error);
    }
  }

    /**
   * Cancel existing proposal
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
    static async cancel(req, res, next) {
      try {
        const cod_user = req.params.cod_user;
        const cod_proposal = req.params.cod_proposal;
    
        const updated = await Proposal.update({status: 'canceled'}, {where: {
          [Op.and]: [
            { cod_user: cod_user },
            { cod_proposal: cod_proposal }
          ]
        }});
          
        if(!updated) {
          throw createError(406);
        }
          
        res.status(204).json(updated);
      } catch (error) {
        next(error);
      }
    }
};
