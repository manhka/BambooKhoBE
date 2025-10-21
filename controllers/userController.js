const bcrypt = require("bcrypt");
const User = require("../models/User");
const Role = require("../models/Role");

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

// 🔄 Bật/tắt trạng thái người dùng
exports.toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
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
      return res.status(404).json({ message: "Không tìm thấy user" });
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
