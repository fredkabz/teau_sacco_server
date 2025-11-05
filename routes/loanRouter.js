const express = require("express");
const router = express.Router();
const loan_controller = require("../controllers/loanController");

router.get("/", loan_controller.loan_index);
router.get("/joined", loan_controller.loan_index_join);
router.get("/join_all", loan_controller.loan_index_join_all);
router.get("/joined_active", loan_controller.loan_index_join_active);
router.get("/member_loans", loan_controller.member_loans_left_join);
router.get("/search", loan_controller.loan_search_list_get);
router.get("/member/:id/:status", loan_controller.loan_member_details);
router.get("/loan_types", loan_controller.loan_types_list_get);
router.get("/loan_types/:id", loan_controller.loan_types_details_get);
router.post("/", loan_controller.loan_create_post);
router.get("/loanDisbursement", loan_controller.loan_disbursement_get);
router.post("/loanDisbursement", loan_controller.loan_disbursement_post);
router.post(
  "/loanDisbursement_by_date",
  loan_controller.loan_disbursement_by_date_post
);
router.get("/:id", loan_controller.loan_details);

router.put("/:id", loan_controller.loan_update);
router.get("/approve_loan/:id", loan_controller.loan_approve_get);
router.delete("/:id", loan_controller.loan_delete);

module.exports = router;
