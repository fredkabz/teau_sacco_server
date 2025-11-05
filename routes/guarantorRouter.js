const express = require('express');
const router = express.Router();
const guarantor_controller = require("../controllers/guarantorController");


router.get("/", guarantor_controller.guarantor_index);
router.post("/", guarantor_controller.guarantor_create_post);
router.get(
  "/loan_guarantors/:id",
  guarantor_controller.guarantors_get_by_loan_id
);
router.get("/:id", guarantor_controller.guarantor_details_get_by_guarantor_number);
router.put("/:id", guarantor_controller.guarantor_update_put);
router.delete("/:id", guarantor_controller.guarantor_delete_get);



module.exports = router;