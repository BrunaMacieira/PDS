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
   * Return all Ads reported, sorted by number of reports (desc)
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async findSortedReportedAds(req, res, next) {
    try {
        
      let reported = await PurchaseAd.findAll({
        where: {
          [Op.and]: [
              { report_count: 
                {
                    $gt: 0
                } },
              { status: 'created'}
            ]
        },
        order: [
            ['report_count', 'DESC'], // Sorts by COLUMN_NAME_EXAMPLE in ascending order
      ],
      });
      
      res.status(200).json(reported);
    } catch (error) {
      next(error);
    }
  }       
};