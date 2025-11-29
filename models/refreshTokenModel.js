'use strict';
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const RefreshToken = sequelize.define('RefreshToken', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    token_hash: { type: DataTypes.STRING(255), allowNull: false }, 
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    user_agent: { type: DataTypes.STRING(255), allowNull: true },
    ip_address: { type: DataTypes.STRING(45), allowNull: true },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    revoked: { type: DataTypes.BOOLEAN, defaultValue: false },
    replaced_by: { type: DataTypes.INTEGER, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'refresh_tokens',
    timestamps: false,
  });

  RefreshToken.associate = (db) => {
    RefreshToken.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
  };

  return RefreshToken;
};
