const Activity = require("../models/Activity");
const StaffActivity = require("../models/StaffActivity");
const User = require("../models/User");

exports.createActivity = async (req, res) => {
  try {
    const { ActivityName, Description } = req.body;

    if (!ActivityName) {
      return res.status(400).json({ message: "Thiếu tên hoạt động" });
    }

    const activity = await Activity.create({
      ActivityName,
      Description: Description || null,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    });

    res.status(201).json({ message: "Tạo hoạt động thành công", activity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.updateActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { ActivityName, Description } = req.body;

    const activity = await Activity.findByPk(activityId);
    if (!activity)
      return res.status(404).json({ message: "Hoạt động không tồn tại" });

    activity.ActivityName = ActivityName ?? activity.ActivityName;
    activity.Description = Description ?? activity.Description;
    activity.UpdateAt = new Date();
    await activity.save();
    res.json({ message: "Cập nhật hoạt động thành công", activity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.findAll({
      order: [["CreatedAt", "DESC"]],
      raw: true,
    });
    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.assignActivity = async (req, res) => {
  try {
    const { UserID, ActivityID } = req.body;

    if (!UserID || !ActivityID) {
      return res.status(400).json({ message: "Thiếu UserID hoặc ActivityID" });
    }

    const user = await User.findByPk(UserID);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    if (user.RoleID === 1)
      return res
        .status(400)
        .json({ message: "Không thể giao hoạt động cho admin" });

    const activityIds = Array.isArray(ActivityID) ? ActivityID : [ActivityID];

    const activities = await Activity.findAll({
      where: { ActivityID: activityIds },
    });
    if (activities.length !== activityIds.length) {
      return res
        .status(404)
        .json({ message: "Một hoặc nhiều hoạt động không tồn tại" });
    }

    const newAssignments = activityIds.map((id) => ({
      UserID,
      ActivityID: id,
      CreatedAt: new Date(),
      UpdateAt: new Date(),
    }));

    const staffActivities = await StaffActivity.bulkCreate(newAssignments);

    res.status(201).json({
      message: `Đã giao ${activityIds.length} hoạt động cho nhân viên ID ${UserID} thành công.`,
      staffActivities,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.updateStaffActivity = async (req, res) => {
  try {
    const { staffActivityId } = req.params;
    const { ActivityID } = req.body;

    if (!ActivityID)
      return res.status(400).json({ message: "Thiếu ActivityID mới" });

    const staffActivity = await StaffActivity.findByPk(staffActivityId);
    if (!staffActivity)
      return res.status(404).json({ message: "StaffActivity không tồn tại" });

    const newActivity = await Activity.findByPk(ActivityID);
    if (!newActivity)
      return res.status(404).json({ message: "Hoạt động mới không tồn tại" });

    staffActivity.ActivityID = ActivityID;
    staffActivity.UpdatedAt = new Date();
    await staffActivity.save();

    res.json({
      message: `Đã cập nhật hoạt động cho nhân viên ID ${staffActivity.UserID} thành '${newActivity.ActivityName}'`,
      staffActivity,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getStaffActivities = async (req, res) => {
  try {
    const { userId } = req.params;

    const staffActivities = await StaffActivity.findAll({
      where: { UserID: userId },
      include: [
        {
          model: Activity,
          attributes: ["ActivityName", "Description"],
        },
      ],
      order: [["CreatedAt", "DESC"]],
    });

    const result = staffActivities.map((sa) => ({
      StaffActivityID: sa.StaffActivityID,
      ActivityID: sa.ActivityID,
      ActivityName: sa.Activity.ActivityName,
      Description: sa.Activity.Description,
      CreatedAt: sa.CreatedAt,
      UpdateAt: sa.UpdateAt,
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
exports.deleteStaffActivity = async (req, res) => {
  try {
    const { staffActivityId } = req.params;

    const staffActivity = await StaffActivity.findByPk(staffActivityId);
    if (!staffActivity) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy hoạt động của nhân viên" });
    }

    await staffActivity.destroy();

    res.json({
      message: `Đã xóa hoạt động ID ${staffActivity.ActivityID} khỏi nhân viên ID ${staffActivity.UserID} thành công.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
