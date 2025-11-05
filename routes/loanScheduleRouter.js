const express = require('express');
const router = express.Router();
const loanScheduleControllers=require('../controllers/loanScheduleController')

router.get('/', loanScheduleControllers.loanSchedule_index);
router.get("/:id", loanScheduleControllers.loanschedule_details_get);
router.put('/:id', loanScheduleControllers.loanSchedule_update);
router.post("/", loanScheduleControllers.loanSchedule_create_post);
router.delete("/", loanScheduleControllers.loanSchedule_delete);

module.exports = router;
