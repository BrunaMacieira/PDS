// ... Dependencies
const createError = require('http-errors');
const UserService = require('../services/user_service.js');
const Authorization = require('../middlewares/authorization');

const {
  models: {
    User,
    Payment
  }
} = require('../models/models.js');
const { restore, rawAttributes } = require('../models/user_model.js');
const PurchaseAd = require('../models/purchase_ad_model.js');
const Proposal = require('../models/proposal_model.js');

module.exports = class PaymentController {
  /**
   * Return all payments in database from given User
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async findAllUser(req, res, next) {
    try {
      const cod_user = req.params.cod_user;
      let payments = await Payment.findAll({
        where: {
          [Op.and]: [
              { cod_user_payment: cod_user },
              { status: 'completed'}
            ]
        }
      });
      
      res.status(200).json(payments);
    } catch (error) {
      next(error);
    }
  }

/**
   * Return all payments completed in database from given User
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async findAllPaymentsUser(req, res, next) {
    try {
      const cod_user = req.params.cod_user;
      let payments = await Payment.findAll({
        where: {
          [Op.and]: [
              { cod_user_payment: cod_user },
              { status: 'completed'}
            ]
        }
      });
      
      res.status(200).json(payments);
    } catch (error) {
      next(error);
    }
  }
  
/**
   * Return all payments completed in database from given User
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
 static async findAllPendingPaymentsUser(req, res, next) {
  try {
    const cod_user = req.params.cod_user;
    let payments = await Payment.findAll({
      where: {
        [Op.and]: [
            { cod_user_payment: cod_user },
            { status: 'pending'}
          ]
      }
    });
    
    res.status(200).json(payments);
  } catch (error) {
    next(error);
  }
}

/**
   * Return all payments received in database from given User
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
 static async findAllReceivedUser(req, res, next) {
  try {
    const cod_user = req.params.cod_user;
    let payments = await Payment.findAll({
      where: {
        [Op.and]: [
            { cod_user_payment: cod_user },
            { status: 'completed'}
          ]
      }
    });
    
    res.status(200).json(payments);
  } catch (error) {
    next(error);
  }
 }

  /**
   * Pay a pending payment
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
   static async pay(req, res, next) {
    try {
      const cod_payment = req.body.cod_payment;
      const cod_proposal = req.body.cod_proposal;
      const proposal = await Proposal.findOne({where: {cod_proposal: cod_proposal}});
      const purchaseAd = await PurchaseAd.findOne({where: {cod_purchase_ad: proposal.cod_purchase_ad}});
      let payment = await Payment.update({status: 'completed'}, {where: {cod_payment: cod_payment}});
      payment =  await Payment.update({date_payment: Date.now}, {where: {cod_payment: cod_payment}});
      
      if (!payment) {
        res.status(406);
      }
      const purchase_ad = await PurchaseAd.update({status: 'completed'}, {where: {cod_purchase_ad: purchaseAd.cod_purchase_ad}});
      const proposalUpdate = await Proposal.update({status: 'completed'}, {where: {cod_proposal}});
      
      res.status(200).json(payment);
  
    } catch (error) {
      next(error);
    }
  }

       
};