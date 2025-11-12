const jwt = require("jsonwebtoken");
const pool = require("../configs/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");

exports.verifyToken = async (req, res, next) => {
  console.log("sfsaf");
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
    const userInfo = req.user;

    // 🔹 Kiểm tra xác thực
    if (!userInfo || !userInfo.id) {
      return res.status(401).json({ message: "Chưa xác thực người dùng" });
    }

    // 🔹 Lấy thông tin người dùng từ DB
    const user = await User.findByPk(userInfo.id, {
      attributes: ["id", "username", "roleID", "status"],
    });

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // 🔹 Kiểm tra trạng thái tài khoản
    if (!user.status) {
      return res.status(403).json({ message: "Tài khoản đã bị khóa" });
    }

    // 🔹 Kiểm tra quyền Admin
    if (Number(user.roleID) !== 1) {
      return res.status(403).json({ message: "Bạn không có quyền Admin" });
    }

    // 🔹 Cho phép đi tiếp nếu hợp lệ
    next();
  } catch (err) {
    console.error("❌ verifyAdmin error:", err);
    res.status(500).json({ message: "Lỗi server nội bộ", error: err.message });
  }
};
