const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User } = require("../models");

exports.register = async (req, res) => {
  try {
    const { username, password, phone } = req.body;

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
      RoleID: 2,
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

    console.log("Login attempt:", { username, password }); // log input

    if (!username || !password) {
      console.log("Missing username or password");
      return res.status(400).json({ message: "Thiếu username hoặc password" });
    }

    const user = await User.findOne({
      where: { Username: { [Op.eq]: username } },
    });

    if (!user) {
      console.log("User not found:", username);
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }

    console.log("User object from DB:", user.toJSON()); // check tất cả field

    let isMatch = false;

    if (user.RoleID === 1) {
      console.log("RoleID = 1 (plain text password check)");
      isMatch = password === user.Password;
    } else {
      console.log("RoleID != 1 (bcrypt check)");
      isMatch = await bcrypt.compare(password, user.Password);
    }

    console.log("Password match result:", isMatch);

    if (!isMatch) {
      console.log("Password incorrect for user:", username);
      return res.status(401).json({ message: "Sai mật khảuaaaaaaaaa" });
    }

    console.log(
      "Login successful. UserID:",
      user.UserID,
      "RoleID:",
      user.RoleID
    );

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
