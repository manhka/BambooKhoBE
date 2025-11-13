const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/create", verifyToken, activityController.createActivity);
router.put("/:activityId", verifyToken, activityController.updateActivity);
router.delete(
  "/staff-activities/:staffActivityId",
  verifyToken,
  activityController.deleteStaffActivity
);
router.get("/view", verifyToken, activityController.getActivities);
router.post(
  "/staff-activities",
  verifyToken,
  activityController.assignActivity
);
router.put(
  "/staff-activities/:staffActivityId",
  verifyToken,
  activityController.updateStaffActivity
);
router.get(
  "/staff-activities/:userId",
  verifyToken,
  activityController.getStaffActivities
);

module.exports = router;
