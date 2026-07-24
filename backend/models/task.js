"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
      // Task belongs to User
      Task.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });

      // Task belongs to Category
      Task.belongsTo(models.Category, {
        foreignKey: "category_id",
        as: "category",
      });
    }
  }

  Task.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM(
          "pending",
          "in_progress",
          "completed"
        ),
        allowNull: false,
        defaultValue: "pending",
      },

      due_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Task",
    }
  );

  return Task;
};