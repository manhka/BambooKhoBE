const jwt = require("jsonwebtoken");
const pool = require("../configs/db");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require("../models/User");

exports.verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Không có token, vui lòng đăng nhập" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    req.user = decoded; // chứa { userId, roleID }
    next();
  } catch (err) {
    console.error("verifyToken error:", err);
    return res.status(403).json({ message: "Token không hợp lệ" });
  }
};

exports.verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Chưa xác thực người dùng" });
    }

    // Dùng Sequelize thay cho pool.query
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    if (user.RoleID !== 1) {
      return res.status(403).json({ message: "Bạn không có quyền Admin" });
    }

    next();
  } catch (err) {
    console.error("verifyAdmin error:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};


