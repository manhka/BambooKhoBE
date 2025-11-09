const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

router.post('/create', activityController.createActivity);
router.put('/:activityId', activityController.updateActivity);
router.delete('/staff-activities/:staffActivityId', activityController.deleteStaffActivity);
router.get('/view', activityController.getActivities);
router.post('/staff-activities', activityController.assignActivity);
router.put('/staff-activities/:staffActivityId', activityController.updateStaffActivity);
router.get('/staff-activities/:userId', activityController.getStaffActivities);

module.exports = router;
