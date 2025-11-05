const express = require('express');
const router = express.Router();

const {
  all_bills_get,
  bills_by_supplier_id_get,
  uncleared_bills_get,
  pending_bills_get,
  bill_delete,
  bills_create_post,
  bill_details_get,
  bill_update,
  bill_items_get,
  bills_by_params_post,
  bill_approve_post,
  pay_bill_report_post,
  bills_pay_post,
} = require("../controllers/billsController");

router.get('/all', all_bills_get);
router.get('/details/:id', bill_details_get);
router.get("/items/:id", bill_items_get);
router.get('/by_supplier_id/:id',bills_by_supplier_id_get);
router.get('/pending', pending_bills_get);
router.get('/uncleared', uncleared_bills_get);
router.post('/add', bills_create_post);
router.post("/pay", bills_pay_post);
router.post('/approve', bill_approve_post);
router.post("/pay_bill_report", pay_bill_report_post);
router.put('/update/:id', bill_update);
router.delete('/:id', bill_delete);
router.post('/by_params',bills_by_params_post)


module.exports = router;