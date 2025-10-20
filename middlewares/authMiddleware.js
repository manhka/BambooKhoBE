const jwt = require("jsonwebtoken");
const pool = require("../configs/db");

exports.verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res
      .status(401)
      .json({ message: "Không có token, vui lòng đăng nhập" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token không hợp lệ" });
  }
};

exports.verifyAdmin = async (req, res, next) => {
  try {
    const [users] = await pool.query("SELECT * FROM User WHERE UserID = ?", [
      req.user.userId,
    ]);

    if (users.length === 0)
      return res.status(404).json({ message: "Người dùng không tồn tại" });

    const user = users[0];

    if (user.RoleID !== 2) {
      return res.status(403).json({ message: "Bạn không có quyền Admin" });
    }

    next();
  } catch (err) {
    console.error("verifyAdmin error:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
