// ... Dependencies
const {
    Model,
    DataTypes
  } = require('sequelize');
  
  const {nanoid} = require('nanoid');
  
  module.exports = class Payment extends Model{
    static initModel(sequelize){
      Payment.init({
        cod_payment: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
        },
        cod_user_payment: {
          type: DataTypes.UUID,
          allowNull: false
        },
        cod_user_receive: {
          type: DataTypes.UUID,
          allowNull: false
        },
        value: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('completed', 'pending', 'rejected'),
          defaultValue: 'pending',
          allowNull: false
        },
        date_created: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
      },
      date_payment: {
        type: DataTypes.DATE,
        allowNull: true
    },

    },{
        sequelize,
        modelName: 'Payment',
        tableName: 'Pagamento',
        underscored: true,
        timestamps: true, //created_at, updated_at
        // paranoid: true,  // deleted_at
      });
    }
  
    static associate(models) {
      //Criar associações
      models.Payment.belongsTo(models.Proposal, {
        foreignKey: {
          name: 'cod_proposal',
          allowNull: false
        }
      });

      models.Proposal.hasOne(models.Payment, {
        foreignKey: {
          name: 'cod_proposal',
          allowNull: false
        }
      });
    }
  };