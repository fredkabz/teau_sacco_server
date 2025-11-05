const express = require("express");
const router = express.Router();
const paymentsController = require("../controllers/paymentsController");
const { verifyMemberSavings } = require("../util/payments");

// router.get('/add_savings_payments/', paymentsController.add_savings_payments_index_get);
// router.post("/add_savings_payments/",paymentsController.add_savings_payments_create_post);
// router.get("/add_savings_payments/:id", paymentsController.add_loan_payments_details_get);
// router.put("/add_savings_payments/:id", paymentsController.add_loan_payments_update_put);
// router.delete("/add_savings_payments/:id",paymentsController.add_savings_payments_delete);

router.get(
  "/savings_payments/",
  paymentsController.add_savings_payments_index_get
);
router.get(
  "/savings_payments_join_all/",
  paymentsController.savings_payments_join_all_get
);
router.get(
  "/member-savings-payments-get/:mid",
  paymentsController.member_savings_payments_get
);

router.get(
  "/share-capital-payments-by-memberId/:mid",
  paymentsController.share_capital_payments_get_by_member_id
);
router.get(
  "/savings_payments_by_memberId/:id",
  paymentsController.add_savings_payments_index_get_by_member_id
);
router.get(
  "/savings_payments_by_memberId_and_savings_category/:mid/:cid",
  paymentsController.add_savings_payments_index_get_by_member_id_and_savings_category
);
router.get(
  "/savings_payments_by_memberId_and_member_saving_id/:mid/:sid",
  paymentsController.savings_payments_get_by_member_id_member_savings_id
);
router.post(
  "/add_savings_payments/",
  paymentsController.add_savings_payments_create_post
);
router.post(
  "/payments_multiple/",
  paymentsController.add_savings_payments_multiple_create_post
);
router.get(
  "/add_savings_payments/:id",
  paymentsController.add_savings_payments_details_get
);
router.put(
  "/add_savings_payments/:id",
  paymentsController.add_savings_payments_update_put
);
router.delete(
  "/add_savings_payments/:id",
  paymentsController.add_savings_payments_delete
);

router.delete(
  "/add_savings_payments_multiple/:id",
  paymentsController.add_savings_payments_delete_multiple
);

//loan payments
router.get(
  "/add_loan_payments/",
  paymentsController.add_loan_payments_index_get
);
router.get(
  "/add_loan_payments_by_loan_id/:id",
  paymentsController.add_loan_payments_index_get_by_loan_id
);
router.post(
  "/loan_payments/",
  paymentsController.add_loan_payments_create_post
);
//savings
router.post(
  "/add_new_member_savings/",
  paymentsController.add_savings_create_post
);
//savings end//
router.post(
  "/loan_payments_multiple/",
  paymentsController.add_loan_payments_multiple_create_post
);
router.get(
  "/add_loan_payments/:id",
  paymentsController.add_loan_payments_details_get
);
router.put(
  "/add_loan_payments/:id",
  paymentsController.add_loan_payments_update_put
);
router.post(
  "/add_loan_payments_delete_post/",
  paymentsController.add_loan_payments_delete_post
);
router.delete(
  "/add_loan_payments/:id",
  paymentsController.add_loan_payments_delete
);

router.post(
  "/loan_payments_bydate/",
  paymentsController.loan_payments_by_date_post
);

module.exports = router;
