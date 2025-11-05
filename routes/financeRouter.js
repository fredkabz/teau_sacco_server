const express = require("express");
const router = express.Router();

const {
  categories_get,
  types_get,
  types_filtered_get,
  budget_grouping_get,
  gl_accounts_get,
  gl_accounts_filtered_get,
  gl_ledgers_query_get,
  gl_accounts_query_get,
  gl_account_create_post,
  gl_account_delete,
  gl_account_update,
  gl_trial_balance_get,
  audit_report_get,
} = require("../controllers/financeController");

router.get("/categories", categories_get);
router.get("/types", types_get);
router.get("/types/:category", types_filtered_get);
router.get("/budget-grouping", budget_grouping_get);
router.get("/gl-accounts", gl_accounts_get);
router.get("/gl-accounts-query", gl_accounts_query_get);
router.get("/gl-ledgers-query", gl_ledgers_query_get);
router.get("/gl-accounts/:option/:id", gl_accounts_filtered_get);
router.post("/gl_account", gl_account_create_post);
router.delete("/gl_account/:id", gl_account_delete);
router.put("/gl_account/:id", gl_account_update);
router.get("/gl_tbalance", gl_trial_balance_get);
router.get("/audit-report/:category/:type", audit_report_get);

module.exports = router;
