// ... Dependencies
const createError = require('http-errors');
const Database = require('../bootstrap/database.js');
const Authorization = require('../middlewares/authorization.js');

const {
  models: {
    User,
    Company,
    CompanyUser,
    CompanyUser: {
      ESTADOS
    },
  }
} = require('../models/models.js');

module.exports = class CompanyController {
  /**
   * Devolve todas as empresas do utilizador atual
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async findAll(req, res, next) {
    try {
      const companies = await Company.findAll({
        where: {
          cod_owner: req.user.cod_user
        }
      });

      res.status(200).json(companies);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria nova empresa
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async create(req, res, next) {
    try {
      const company = await Company.create({
        ...req.body,
        cod_owner: req.user.cod_user
      });

      res.status(200).json(company);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza empresa existente
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async update(req, res, next) {
    try {
      const company = await Company.findOne({
        where: {
          cod_empresa: req.params.cod_empresa
        }
      });

      if(!company) {
        throw createError(404);
      }

      await company.update(req.body);
      
      res.status(200).json(company);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elmina empresa
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async delete(req, res, next) {
    try {
      const cod_empresa = req.params.cod_empresa;
      const company = await Company.findOne({
        where: {
          cod_empresa
        }
      });

      if(!company) {
        throw createError(404);
      }

      const sequelize = Database.instance._sequelize;
      const result = await sequelize.transaction(async t => {
        // Eliminar utilizadores da empresa
        await CompanyUser.destroy({
          where: {
            cod_empresa
          }
        });

        // Eliminar empresa
        await company.destroy();
      });

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Devolve utilizadores da empresa
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getUsers(req, res, next) {
    try {
      const company_users = await CompanyUser.findAll({
        where: {
          cod_empresa: req.params.cod_empresa
        },
        include: [
          {
            model: User,
            required: false
          }
        ]
      });

      res.status(200).json(company_users);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria utilizador na empresa
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async inviteUser(req, res, next) {
    try {
      const cod_empresa = req.params.cod_empresa;
      const email = req.body.email;

      let user = await User.findOne({
        where: {
          email
        }
      });

      if(!user) {
        throw createError(404, 'User not found');
      }

      //Verifica se já existe
      let company_user = await CompanyUser.findOne({
        where: {
          cod_empresa,
          cod_user: user.cod_user
        }
      });

      if(company_user) {
        throw createError(400, 'User already invited');
      }

      //Não existe, criar
      company_user = await CompanyUser.create({
        cod_user: user.cod_user,
        cod_empresa,
        flag: Authorization.generateFlag(req.body.perms || [], Authorization.BIT_POS_EMPRESA),
        estado: ESTADOS.INVITED
      });

      res.status(200).json(await CompanyUser.findOne({
        where: {
          cod_user: user.cod_user,
          cod_empresa: req.params.cod_empresa
        },
        include: [
          {
            model: User,
            required: true,
            where: {
              cod_user: user.cod_user
            }
          }
        ]
      }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Aceita convite (muda estado para active)
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async acceptInvite(req, res, next) {
    try {
      const cod_empresa = req.params.cod_empresa;
      const cod_user = req.params.cod_user;

      //Verifica se existe
      const company_user = await CompanyUser.findOne({
        where: {
          cod_empresa,
          cod_user,
          estado: ESTADOS.INVITED
        }
      });

      if(!company_user) {
        throw createError(404);
      }

      await company_user.update({estado: ESTADOS.ACTIVE});

      res.status(200).json(await CompanyUser.findOne({
        where: {
          cod_user: cod_user,
          cod_empresa: cod_empresa
        },
        include: [
          {
            model: User,
            required: true,
            where: {
              cod_user
            }
          }
        ]
      }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza utilizador na empresa
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async updateUser(req, res, next) {
    try {
      const cod_empresa = req.params.cod_empresa;
      const cod_user = req.params.cod_user;

      //Verifica se existe
      let company_user = await CompanyUser.findOne({
        where: {
          cod_empresa,
          cod_user
        }
      });

      if(!company_user) {
        throw createError(404);
      }

      let flag = company_user.flag;

      if(req.body.perms) {
        flag = Authorization.generateFlag(req.body.perms, Authorization.BIT_POS_EMPRESA);
      }

      await company_user.update({
        ...req.body,
        flag
      });

      res.status(200).json(await CompanyUser.findOne({
        where: {
          cod_user: cod_user,
          cod_empresa: cod_empresa
        },
        include: [
          {
            model: User,
            required: true,
            where: {
              cod_user
            }
          }
        ]
      }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove utilizador da empresa
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async removeUser(req, res, next) {
    try {
      const cod_empresa = req.params.cod_empresa;
      const cod_user = req.params.cod_user;

      //Verifica se existe
      let company_user = await CompanyUser.findOne({
        where: {
          cod_empresa,
          cod_user
        }
      });

      if(!company_user) {
        throw createError(404);
      }

      await company_user.destroy();
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
};