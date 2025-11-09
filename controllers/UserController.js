const { User } = require("../models");
const { Op } = require("sequelize");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        RoleID: {
          [Op.in]: [1, 2] 
        }
      },
      attributes: ['UserID', 'Username', 'RoleID'], 
      order: [['Username', 'ASC']]
    });

    res.status(200).json({
      status: "success",
      message: "fetch_users_success",
      data: users
    });

  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({
      status: "error",
      message: "server_error",
    });
  }
};


