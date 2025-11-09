const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User } = require("../models");

exports.register = async (req, res) => {
  try {
    const { username, password, phone, roleId } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Vui lòng nhập đủ thông tin" });
    }

    const userCheck = await User.findOne({
      where: { Username: { [Op.eq]: username } },
    });

    if (userCheck) {
      return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      Username: username,
      Password: hashedPassword,
      Phone: phone || null,
      Status: true,
      RoleID: roleId || 1,
    });

    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (err) {
    console.error("Lỗi register:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Thiếu username hoặc password" });

    const user = await User.findOne({
      where: { Username: { [Op.eq]: username } },
    });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }

    let isMatch = false;

    if (user.RoleID === 1) {
      isMatch = password === user.Password;
    } else {
      isMatch = await bcrypt.compare(password, user.Password);
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Sai mật khẩu" });
    }

    const token = jwt.sign(
      { userId: user.UserID, roleID: user.RoleID },
      "123456789abcdef",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user.UserID,
        username: user.Username,
        roleID: user.RoleID,
      },
    });
  } catch (err) {
    console.error("Lỗi login:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
