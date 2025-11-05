const express = require("express");
const router = express.Router();
const nextOfKinController = require("../controllers/nextOfKinController");

router.get("/nextOfKin/", nextOfKinController.nextOfKin_index);
router.get("/next_of_kin_by_member_id/:id", nextOfKinController.nextOfKin_by_member_id_GET);
router.post("/nextOfKin/", nextOfKinController.nextOfKin_create_post);
router.get("/nextOfKin/:id", nextOfKinController.nextOfKin_details_get);
router.put("/nextOfKin/:id", nextOfKinController.nextOfKin_update_put);
router.delete("/nextOfKin/:id", nextOfKinController.nextOfKin_delete_get);

router.get("/nextOfKinByMember/:id", nextOfKinController.nextOfKinByMember_get);

module.exports = router;
