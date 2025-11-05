const conn = require("../util/database2");
const {
  getSupplierCategories,
  getSuppliers,
  getSuppliersFiltered,
  insertSuppliers,
  updateSuppliers,
  deleteSuppliers,
} = require("../util/suppliers");

const supplier_categories_get = async (req, res) => {
  try {
    const categories = await getSupplierCategories();
   return res.status(200).json({ message: "success", data: categories });
  } catch (err) {
   return res.status(400).json({ message: "error", data: err });
  }
};

const supplier_index = async (req, res) => {
  try {
    const suppliers = await getSuppliers();
   return res.status(200).json({ message: "success", data: suppliers });
  } catch (err) {
   return res.status(400).json({ message: "error", data: err });
  }
};

const get_supplier_id = async (req, res) => {
  const supplierName = req.params.name;
  try {
    const id = await getSuppliersFiltered(null, supplierName);
    // console.log(`id: ${id}`)
    res.status(200).json({ message: "success", data: id });
  } catch (error) {
    return res.status(400).json({message:"error",data:error})
  }

}
const get_supplier_name = async (req, res) => {
  const supplierId = req.params.id;
  try {
    const id = await getSuppliersFiltered(supplierId, null);
    res.status(200).json({ message: "success", data: id });
  } catch (error) {
    return res.status(400).json({ message: "error", data: error });
  }
};

const supplier_create_post = async (req, res) => {
  const details = req.body;
  try {
    const result = await insertSuppliers(details).then(response=>console.log(response));
    console.log(`result in main:${result}`)
return  res.status(200).json({ message: "success", data: result });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "error", data: error });
  }
};

const supplier_delete = async (req, res) => {
  let supplierId = req.params.id;
  
  try {
    const result = await deleteSuppliers(supplierId);
    return res.status(200).json({ message: "success", data: result });
  } catch (error) {
    return res.status(400).json({ message: "error", data: error });
  }
};

module.exports = {
  supplier_categories_get,
  supplier_index,
  supplier_create_post,
  supplier_delete,
  get_supplier_id,
  get_supplier_name
};
