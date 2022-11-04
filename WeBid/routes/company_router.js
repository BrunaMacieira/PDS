// ... Dependencies
const Authorization = require('../middlewares/authorization.js');
const CompanyController = require('../controllers/company_controller.js');
const CompanyValidator = require('../validators/company_validator.js');
const BIT_POS_EMPRESA = Authorization.BIT_POS_EMPRESA;

const {
  models: {
    Company,
    CompanyUser,
    CompanyUser: {
      ESTADOS
    },
  },
  others: {
    USER_ROLES
  }
} = require('../models/models.js');

module.exports = function (path, express) {
  const router = require('express').Router();

  /* Auxiliary fn to check if user matches own */
  const matchCodUser = (user, paramCodUser) => {
    if(user.cod_user !== paramCodUser) {
      throw new Error('Can only update itself');
    }

    //allowed
    return true;
  };

  /* Devolve flag do utilizador actual */
  const getFlagFn = async (req) => {
    const cod_empresa = req.params.cod_empresa;
    const cod_user = req.user.cod_user;

    //check if its the company owner
    const company = await Company.findOne({
      where: {
        cod_empresa
      }
    });

    if(!company) {
      throw new Error('Invalid company');
    }

    if(company.cod_owner === cod_user) {
      //its owner, return all flags 'on'
      return Authorization.generateFlag(Object.keys(BIT_POS_EMPRESA), BIT_POS_EMPRESA);
    }

    const company_user = await CompanyUser.findOne({
      where: {
        cod_empresa,
        cod_user,
      }
    });

    if(!company_user) {
      throw new Error('Not found');
    }

    if(
      company_user.estado === ESTADOS.INVITED ||
      company_user.estado === ESTADOS.SUSPENDED
    ) {
      throw new Error('User not active');
    }

    return company_user.flag;
  };

  router
    //Ensure user is logged int (attach user to req => req.user)
    .use(Authorization.jwtMiddleware)    

    // Min role level allowed: MEMBER
    .use(Authorization.enforceRole(USER_ROLES.MEMBER))

    // Company
    .get(
      '/',
      CompanyController.findAll
    )
    .post(
      '/',
      CompanyValidator.create,
      CompanyController.create
    )
    .put(
      '/:cod_empresa',
      Authorization.enforceFlagPermission(BIT_POS_EMPRESA.EDIT_COMPANY_INFO, getFlagFn),
      CompanyValidator.update,
      CompanyController.update
    )
    .delete(
      '/:cod_empresa',
      Authorization.enforceFlagPermission(BIT_POS_EMPRESA.DELETE_COMPANY, getFlagFn),
      CompanyController.delete
    )

    // Company - User
    .get(
      '/:cod_empresa/users',
      Authorization.enforceFlagPermission(BIT_POS_EMPRESA.READ_USERS, getFlagFn),
      CompanyController.getUsers
    )
    .get(
      '/:cod_empresa/users/:cod_user',
      Authorization.enforceParam('cod_user', matchCodUser),
      CompanyController.acceptInvite
    )
    .post(
      '/:cod_empresa/users',
      Authorization.enforceFlagPermission(BIT_POS_EMPRESA.INVITE_USERS, getFlagFn),
      CompanyValidator.companyUser(Object.keys(BIT_POS_EMPRESA)),
      CompanyController.inviteUser
    )
    .put(
      '/:cod_empresa/users/:cod_user',
      Authorization.enforceFlagPermission(BIT_POS_EMPRESA.EDIT_USERS, getFlagFn),
      CompanyValidator.companyUser(Object.keys(BIT_POS_EMPRESA)),
      CompanyController.updateUser
    )
    .delete(
      '/:cod_empresa/users/:cod_user',
      Authorization.enforceFlagPermission(BIT_POS_EMPRESA.REMOVE_USERS, getFlagFn),
      CompanyController.removeUser
    );

  express.use(path, router);
};