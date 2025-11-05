const conn = require("./database2");

//supplier categories
const getSupplierCategories = async () => {
  const categories = new Promise((myResolve, myReject) => {
    const sql = "SELECT * FROM supplier_category";
    conn.query(sql, (error, result) => {
      if (error) {
        myReject(error);
      } else {
        myResolve(result);
      }
    });
  });

  return categories;
};



//suppliers
const getSuppliers = async () => {
  const suppliers = new Promise((myResolve, myReject) => {
    const sql = "SELECT * FROM suppliers s,supplier_category c WHERE s.category_id=c.category_id";
    conn.query(sql, (error, result) => {
      if (error) {
        myReject(error);
      } else {
        myResolve(result);
      }
    });
  });

  return suppliers;
};

const getSuppliersFiltered = async (id = null, name = null) => {
 
  const suppliers = new Promise((myResolve, myReject) => {
    let queryFilter = ` WHERE `;
    if (id) {
      queryFilter += `supplier_id = '${id}'`;
    }
    if (name) {
      queryFilter += `supplier_name='${name}'`;
    }

   
   

    let sql = `SELECT * FROM suppliers ${queryFilter}`;
  
    conn.query(sql, (error, result) => {
      if (error) {
        myReject(error);
      } else {
        myResolve(result);
      }
    });
  });

  return suppliers;
};

const insertSuppliers = async(details) => {
    let supplier_category = details.supplier_category;
    let supplier_name = details.supplier_name;
    let pin_no = details.pin_no;
    let postal_address = details.postal_address;
    let postal_code = details.postal_code;

    let town = details.town;
    let tel_no = details.tel_no;
    let fax_no = details.fax_no;
    let email = details.email;
    let website = details.website;

    let physical_address = details.physical_address;
    let contact_person = details.contact_person;
    let designation = details.designation;
    let mobile_no = details.mobile_no;
    let extension_no = details.extension_no;
    let cp_email = details.cp_email;
    let notes = details.notes;

    const supplierPromise = new Promise((myResolve, myReject) => {
        const sql = `SELECT * FROM suppliers WHERE supplier_name='${supplier_name}'`;
        conn.query(sql, (error, result) => {
            if (error) {
              return  myReject(error);
          }
          if (result.length > 0) {
            myReject("Supplier already exists");
          } else {
            myResolve(result);
          }
        })

    }).then(result => {
        if (result.length > 0) {
            throw new error("Supplier already exists!");
        } else {
            const sql = `INSERT INTO suppliers(category_id,supplier_name,pin_number,postal_address,postal_code,
		town,tel_no,fax_no,email,website,physical_address,contact_person,contact_person_designation,
		contact_person_extension_no,contact_person_mobile_no,contact_person_email_address,notes) VALUES('${supplier_category}','${supplier_name}','${pin_no}','${postal_address}','${postal_code}','${town}','${tel_no}','${fax_no}','${email}','${website}',
'${physical_address}','${contact_person}','${designation}','${extension_no}','${mobile_no}','${cp_email}','${notes}')`;
            
            conn.query(sql, (error, result) => {
                if (error) {
                    throw new error(error);
                }
                 return result;
            })
           
        }
    }).catch(error => {
        return {error:error}
    })

    
}

const deleteSuppliers = async (id) => {
    const deletePromise = new Promise((myResolve, myReject) => {
        const sql = `DELETE FROM suppliers WHERE supplier_id='${id}'`;
        conn.query(sql, (error, result) => {
            if (error) {
                myReject(error);
          }
            else {
 myResolve(result);
          }
           
        })
    })

    return deletePromise;
}

const updateSuppliers = async (id,details) => {
    
}


module.exports = {
  getSupplierCategories,
  getSuppliers,
    getSuppliersFiltered,
    insertSuppliers,
    deleteSuppliers,
  updateSuppliers

};
