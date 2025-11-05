const express = require('express');
const { supplier_categories_get, supplier_index, supplier_create_post, supplier_delete, get_supplier_id, get_supplier_name } = require('../controllers/suppliersController');

const router = express.Router();

router.get('/categories', supplier_categories_get);
router.get('/get_id/:name', get_supplier_id);
router.get('/get_name/:id', get_supplier_name);
router.get('/', supplier_index);
router.post('/', supplier_create_post);
router.delete('/delete/:id', supplier_delete);

module.exports = router;