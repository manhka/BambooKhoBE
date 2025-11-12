const { User, Role } = require("../models");
const { Op } = require("sequelize");
exports.getUsersByRole = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { RoleID: 2 },
      include: [
        {
          model: Role,
          as: "Role",
          attributes: ["RoleName"],
        },
      ],
      attributes: ["UserID", "Username", "Phone", "Status", "RoleID"],
    });

    const result = users.map((u) => ({
      UserID: u.UserID,
      Username: u.Username,
      Phone: u.Phone,
      Status: u.Status,
      RoleName: u.Role?.RoleName || null,
    }));

    res.json(result);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách user:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        RoleID: {
          [Op.in]: [1, 2],
        },
      },
      attributes: ["UserID", "Username", "RoleID"],
      order: [["Username", "ASC"]],
    });

    res.status(200).json({
      status: "success",
      message: "fetch_users_success",
      data: users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({
      status: "error",
      message: "server_error",
    });
  }
};
exports.toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(200).json({ message: "Không tìm thấy user" });
    }
    const newStatus = !Boolean(user.Status);
    user.Status = newStatus;
    await user.save();
    res.json({ message: "Đã cập nhật trạng thái user", newStatus });
  } catch (error) {
    console.error("Lỗi khi cập nhật status:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { Username, Password, Phone } = req.body;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(200).json({ message: "Không tìm thấy user" });
    }

    if (Username) user.Username = Username;
    if (Phone) user.Phone = Phone;

    if (Password) {
      const salt = await bcrypt.genSalt(10);
      user.Password = await bcrypt.hash(Password, salt);
    }

    await user.save();

    res.json({ message: "Cập nhật thông tin user thành công" });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật user:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
