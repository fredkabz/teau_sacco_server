const express = require("express");
const router = express.Router();
const {
  schedules_get,
  loan_payments_get,
  loan_payments_gl_get,
  loan_gl_get,
  savings_payments_gl_get,
  deduct_membership_fee_get,
  deduct_share_capital_get,
} = require("../controllers/settingsContoller");
router.get(`/clean_schedules`, schedules_get);
router.get(`/clean_loan_payments`, loan_payments_get);
router.get(`/loans_gl`, loan_gl_get);
router.get(`/loans_payments_gl`, loan_payments_gl_get);
router.get(`/savings_payments_gl`, savings_payments_gl_get);
router.get(`/move_payments_membership`, deduct_membership_fee_get);
router.get(`/move_payments_shares`, deduct_share_capital_get);

module.exports = router;
