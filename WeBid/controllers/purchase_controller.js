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
    FavoriteAds
  }
} = require('../models/models.js');
const { restore } = require('../models/user_model.js');
const { date } = require('joi');
const { DataTypes } = require('sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


module.exports = class PurchaseController {
  /**
   * Return all purchase ads in database
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async findAll(req, res, next) {
    try {
      let ads = await PurchaseAd.findAll();
      
      res.status(200).json(ads);
    } catch (error) {
      next(error);
    }
  }

    /**
   * Return all purchase ads in database with status "created"
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
     static async findAllOpen(req, res, next) {
      try {
        let ads = await PurchaseAd.findAll({
          where: {
            status: 'created'
          }
        });
        
        res.status(200).json(ads);
      } catch (error) {
        next(error);
      }
    }


  /**
   * Return all open purchase ads in database from a given category
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
   static async findByCategory(req, res, next) {
    try {
      const category = req.body.category;
      let ads = await PurchaseAd.findAll({
        where: {
          [Op.and]: [
            { category: category },
            { status: 'created'}
          ]
        }
      });

      
      res.status(200).json(ads);
    } catch (error) {
      next(error);
    }
  }

/**
   * Return all highlighted open purchase ads in database
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
 static async findHighlighted(req, res, next) {
  try {
    let ads = await PurchaseAd.findAll({
      where: {
        [Op.and]: [
          { status: 'created'},
          { highlighted: true}
        ]
      }
    });

    
    res.status(200).json(ads);
  } catch (error) {
    next(error);
  }
}

/**
   * Return all highlighted open purchase ads in database from a given category
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
 static async findByCategoryHighlighted(req, res, next) {
  try {
    let ads = await PurchaseAd.findAll({
      where: {
        [Op.and]: [
          { category: req.body.category },
          { status: 'created'},
          { highlighted: true}
        ]
      }
    });

    
    res.status(200).json(ads);
  } catch (error) {
    next(error);
  }
}


  /**
   * Return from database all purchase ads with status "created" that are favorites from an User
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
    static async findAllOpenFavorites(req, res, next) {
      try {
        const cod_user = req.params.cod_user;

        let user = await User.findOne({
          where: {
            cod_user
            }
          });

          let adsList = await FavoriteAds.findAll({
            where: {
              cod_user: user.cod_user
            }
          });
          
          let list_cod_ads = []
            
          adsList.forEach( (element) => {
            list_cod_ads.push(element.cod_purchase_ad);
          });

          let ads = await PurchaseAd.findAll({
            where: {
              [Op.and]: [
                { cod_purchase_ad: {[Op.in]: 
                  {list_cod_ads}
              }},
                { status: 'created'}
              ]
            }
          })
          
          res.status(200).json(ads);

        } catch (error) {
            next(error);
        }
    }

  /**
   * Create new purchase ad
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async create(req, res, next) {
    try {
      const ad = await PurchaseAd.create(req.body);
              
      res.status(200).json(ad);
  
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload a picture to an ad
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
   static async upload_picture(req, res, next) {
    try {
      const updated = await PurchaseAd.update({
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
   * Update existing ads
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async update(req, res, next) {
    try {
      const cod_user = req.body.cod_user;
      const cod_purchase_ad = req.params.cod_purchase_ad;

      const updated = await PurchaseAd.update(req.body, {where: {
        [Op.and]: [
            { cod_user: cod_user },
            { cod_purchase_ad: cod_purchase_ad },
            { status: 'created'}
          ]
      }});
      
      if(!updated) {
        throw createError(406);
      }
      
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

    /**
   * Report ads
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
     static async report(req, res, next) {
      try {
        const cod_purchase_ad = req.params.cod_purchase_ad;
        const purchase_ad = await PurchaseAd.findOne({where: {cod_purchase_ad: cod_purchase_ad}});
        const updated = await PurchaseAd.update({report_count: (purchase_ad.report_count + 1)}, {where: {cod_purchase_ad: cod_purchase_ad}});
        
        if(!updated) {
          throw createError(406);
        }
        
        res.status(200).json(updated);
      } catch (error) {
        next(error);
      }
    }

    /**
   * Cancel existing ads
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
    static async cancel(req, res, next) {
      try {
        const cod_user = req.body.cod_user;
        const cod_purchase_ad = req.body.cod_purchase_ad;
    
        const updated = await PurchaseAd.update({status: 'canceled'}, {where: {
          [Op.and]: [
            { cod_user: cod_user },
            { cod_purchase_ad: cod_purchase_ad },
            { status: 'created'}
          ]
        }});
          
        if(!updated) {
          throw createError(406);
        }
          
        res.status(200).json(updated);
      } catch (error) {
        next(error);
      }
    }

  /**
   * Delete existing ad - Admin auth
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async delete(req, res, next) {
    try {
      const cod_purchase_ad = req.body.cod_purchase_ad;
      
      const ad = await PurchaseAd.findOne({where: {cod_purchase_ad}});

      if(!ad) {
        throw createError(404);
      }

      const num_affected_rows = await PurchaseAd.destroy({where: {cod_user}});

      res.status(200).json({"num_affected_rows": num_affected_rows});
    } catch (error) {
      next(error);
    }
  }
};

const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.tz = 'Etc/UTC';

/**
 * Routine Function to check and update PurchaseAds
 */
const job = schedule.scheduleJob(rule, () => {
  try {
    let ads = PurchaseAd.findAll({
      where: {
          status: 'created'
        }
    });

    let date = new Date();

    ads.forEach( (element) => {

      date = element.expirity_date;
      
      // If the date now is greater than expirity_date, purchase_ad is updated with 'expired' status
      if (date.getTime() < Date.now) {
        const updated = PurchaseAd.update({status: 'expired'}, {where: {
          [Op.and]: [
            { cod_purchase_ad: cod_purchase_ad },
            { status: 'created'}
          ]
        }});
      }
    });
    
  } catch (error) {
    next(error);
  }
});