const express = require("express");
const router = express.Router();
const membersController = require("../controllers/membersController");

router.get("/members", membersController.member_index);
router.post("/members", membersController.member_create_post);
router.get(
  "/members/savings_categories",
  membersController.savings_categories_get
);
router.get("/members/:id", membersController.member_details_get);
router.get("/members_by_id/:id", membersController.member_details_by_id_get);
router.put("/members/:id", membersController.member_update_put);
router.delete("/members/:id", membersController.member_delete_get);
router.get("/members_search/:number", membersController.member_search_get);
router.get("/members_max_number", membersController.members_max_number_get);

router.get("/member_savings/:id", membersController.member_savings_get);



module.exports = router;
