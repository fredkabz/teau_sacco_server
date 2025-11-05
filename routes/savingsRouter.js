const express = require("express");
const router = express.Router();
const savingsController = require("../controllers/savingsController");

router.get("/get_all/", savingsController.member_savings_get_all);
router.get(
  "/get_all_join_categories/",
  savingsController.member_savings_join_categories_get
);
router.get(
  "/get_by_member_id/:id",
  savingsController.member_savings_get_by_member_id
);
router.get(
  "/get_by_member_id_category_id/:member_id/:category_id",
  savingsController.member_savings_get_by_member_id_and_category_id
);
router.get(
  "/get_by_savings_id/:id",
  savingsController.member_savings_get_by_savings_id
);

router.post("/add_member_saving", savingsController.member_savings_post);
router.put(
  "/update_member_saving/:id",
  savingsController.member_savings_update_put
);
router.delete("/delete_saving/:id", savingsController.member_savings_delete);

router.get("/set_up/", savingsController.set_up);
router.get("/set_up_payments/", savingsController.set_up_payments);

module.exports = router;
