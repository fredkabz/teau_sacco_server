const conn = require("./database2");
const { getSuppliersFiltered } = require("./suppliers");
const { postGl } = require("./financialAccounts");

const insert_bill = async (fields) => {
  const ref_no = fields.ref_no;
  const date_on_bill = fields.date_on_bill;
  const date_due = fields.date_due;
  const amount_due = fields.amount_due;
  const supplier_name = fields.supplier_name;
  const memo = fields.memo;
  const billItems = fields.billItems;

  //   const gl_account_name = fields.gl_account_name;
  //   const particulars = fields.particulars;
  //   const amount = fields.amount;
  //   const unit_amount = fields.unit_amount;
  //   const quantity = fields.quantity;
  //   const vat = fields.vat;

  const supplier = await getSuppliersFiltered(null, supplier_name);
  const supplier_id = supplier[0].supplier_id;

  const validate = await new Promise((myResolve, myReject) => {
    const sqlValidate = `SELECT * FROM bills WHERE ref_no='${ref_no}' AND supplier_id='${supplier_id}'`;
    conn.query(sqlValidate, (error, result) => {
      if (error) {
        myReject(error);
      } else {
        myResolve(result);
      }
    });
  });

  // console.log(`length: ${validate.length}`);
  if (validate.length > 0) {
    throw new Error("duplicate");
  }

  let addBillPromise = new Promise((myResolve, myReject) => {
    const sql = `INSERT INTO bills(ref_no,supplier_id,date_on_bill,date_due,amount_due,balance,memo,user_id)       
		       VALUES('${ref_no}','${supplier_id}','${date_on_bill}','${date_due}','${amount_due}','${amount_due}','${memo}','${1}')`;
    conn.query(sql, (error, result) => {
      if (error) {
        myReject(error);
      } else {
        myResolve(result);
      }
    });
  }).then(async (response) => {
    let bill_id = response.insertId;

    for (let i = 0; i < billItems.length; i++) {
      let gl_aid = billItems[i].gl_account_name;
      let unit_amount = billItems[i].unit_amount;
      let quantity = billItems[i].quantity;
      let amount = billItems[i].amount;
      let vat = billItems[i].vat;
      let particulars = billItems[i].particulars;

      let vat_amount = vat * amount;
      let net_amount = amount - vat_amount;

      const sqlItems = `INSERT INTO
      	   bill_items(bill_id,item_name,gl_account_item_id,unit_amount,quantity,net_amount,gross_amount,vat,vat_amount)
      	   VALUES('${bill_id}','${particulars}','${gl_aid}','${unit_amount}','${quantity}','${net_amount}','${amount}','${vat}','${vat_amount}')`;

      try {
        let insertItem = await new Promise((myResolve, myReject) => {
          conn.query(sqlItems, (error, result) => {
            if (error) {
              myReject(error);
            } else {
              myResolve(result);
            }
          });
        });
      } catch (error) {
        throw new Error(error);
      }
    }
  });

  return addBillPromise;
};

const update_bill = async (id, fields) => {
  const bill_id = fields.bill_id;
  const ref_no = fields.ref_no;
  const date_on_bill = fields.date_on_bill;
  const date_due = fields.date_due;
  const amount_due = fields.amount_due;
  const supplier_name = fields.supplier_name;
  const memo = fields.memo;

  const gl_account_name = fields.gl_account_name;
  const particulars = fields.particulars;
  const amount = fields.amount;
  const unit_amount = fields.unit_amount;
  const quantity = fields.quantity;
  const vat = fields.vat;
};

const pay_bill = async (fields) => {
  // console.log(fields)
  const {
    payment_date,
    method,
    reference_no,
    amount_paid,
    gl_account_id,
    billsToPay,
  } = fields;
  //check if their exists payments of the same bill with the same reference number
  let error_message = "";
  let duplicate_count = 0;

  let validatePromise =await new Promise(async (resolve, reject) => {
    for (let i = 0; i < billsToPay.length; i++) {
      sqlCheck = `SELECT * FROM pay_bill WHERE reference_no = '${reference_no}' AND bill_id='${billsToPay[i].entry_id}'`;
      let check = await new Promise((resolve, reject) => {
        conn.query(sqlCheck, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
         
        
        });
      }).then(response => {
        if (response.length > 0) {
          duplicate_count += 1;
        }
      }).catch(error => {
        throw new Error("Error fetching bills");
      });

    
      // console.log(check);
    }
    resolve(duplicate_count);
  });
 

  if (validatePromise > 0) {
    throw new Error(
      `${validatePromise} bill(s) already have similar reference number`
    );
  } else {
    console.log(validatePromise);
  }

  //insert bill payments
  const insertPromise = await new Promise(async(resolve, reject) => {

    
    for (let i = 0; i < billsToPay.length; i++) {
      let payBillNo;
      // console.log(billsToPay[i].amount_to_pay);
      // continue;
    let sqlInsert = `INSERT INTO pay_bill(bill_id,payment_date,payment_method,reference_no,amount_paid,payment_gl_account_id,user_id) 
					   VALUES('${billsToPay[i].entry_id}','${payment_date}','${method}','${reference_no}','${parseFloat(billsToPay[i].amount_to_pay)}','${gl_account_id}','${1}')`;
    let insertPay = await new Promise((myResolve, myReject) => {
      conn.query(sqlInsert, (error, result) => {
        if (error) {
          myReject(error);
        } else {
          myResolve(result);
        }
      });
    }).then(async (result) => {
      payBillNo = result.insertId;
      let newAmountPaid = parseFloat(billsToPay[i].amount_to_pay) + (billsToPay[i].amount_paid ? parseFloat(billsToPay[i].amount_paid): 0);
      let newBalance =
        (billsToPay[i].balance ? parseFloat(billsToPay[i].balance) : 0) -
        parseFloat(billsToPay[i].amount_to_pay);
      //console.log(`newAmountPaid: ${newAmountPaid} newBalance:${newBalance}`);
     
      let updateBill = await new Promise((myResolve, myReject) => {
        let sqlUpdateBill = `UPDATE bills SET amount_paid='${newAmountPaid}',balance='${newBalance}' WHERE entry_id='${billsToPay[i].entry_id}'`;
        conn.query(sqlUpdateBill, (error, result) => {
          if (error) {
            myReject(error);
          } else {
            myResolve(result);
          }
        });
      });
    }).then(async (result) => {
      //console.log(`pay bill no:${payBillNo}`)
      let gl_description = `PAYMENT of BILL/INVOICE: Pay Bill Receipt #:${payBillNo} Supplier:${billsToPay[i].supplier_name} bill #:${billsToPay[i].entry_id} bill ref#:${billsToPay[i].ref_no}`;
      let transaction_origin = `Supplier BIll Payment`;
      let transaction_origin_ref_no = payBillNo;
      let gl_account_id_to_credit = gl_account_id; //cash account to pay from
      let gl_account_id_to_debit = 79; //supplier invoices gl account
   const glPost = await postGl(
     gl_account_id_to_debit,
     gl_account_id_to_credit,
     gl_description,
     transaction_origin,
     transaction_origin_ref_no,
     payment_date,
     billsToPay[i].amount_to_pay
   );
    })
      .catch(error => {
      throw new Error(error);
    });
     
      
  }
   
      
    resolve("Payment added successfully")
    
  })
  
  //end of inserting payments
 


};

const delete_bill = async (id) => {
  const deleteBill = new Promise((myResolve, myReject) => {
    const sql = `DELETE FROM bills WHERE entry_id='${id}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        myReject(error);
      } else {
        myResolve(result);
      }
    });
  });

  return deleteBill;
};
const approve_bill = async (id, amount) => {

  const bill_id = id;
  const amount_due = amount;

  const getBillDetails = await new Promise((resolve, reject) => {
    const sql = `SELECT s.supplier_name,i.date_on_bill,i.date_due,i.memo FROM suppliers s,bills i WHERE s.supplier_id=i.supplier_id AND i.entry_id='${bill_id}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    })
  })
  const bill_supplier_name = getBillDetails[0].supplier_name;
  const bill_date_on_bill = getBillDetails[0].date_on_bill;
  const bill_date_due = getBillDetails[0].date_due;
  const bill_memo = getBillDetails[0].memo;




  const approveBillPromise = await new Promise(async(resolve, reject) => {
    try {
        
        //update bill status
        const updatePromise = await new Promise((resolve, reject) => {
          const sql = `UPDATE bills SET status='APPROVED' WHERE entry_id='${bill_id}'`;
          conn.query(sql, (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });
      
        //post individual bill items gl 
      const itemsGlUpdate = await new Promise((resolve, reject) => {
        const sql = `SELECT entry_id,gl_account_item_id,item_name,gross_amount FROM bill_items WHERE bill_id='${bill_id}'`;
        conn.query(sql, (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result);
          }
        })
      })

     
      
      for (let i = 0; i < itemsGlUpdate.length; i++){
        let bill_item_id = itemsGlUpdate[i].entry_id;
        let bill_item_gl_expense_account_id = itemsGlUpdate[i].gl_account_item_id; //expense account to be debited (expense account increase)
        let bill_item_name = itemsGlUpdate[i].item_name;
        let bill_item_gross_amount = itemsGlUpdate[i].gross_amount;
        let transaction_origin = "Supplier BIlls";
        let transaction_origin_ref_no = bill_item_id;
        let payment_date = new Date(bill_date_on_bill).toISOString().slice(0, 19).replace('T', ' ');
        let gl_description = `supplier:${bill_supplier_name} Bill #:${bill_id} Bill Memo:${bill_memo} Bill Item:${bill_item_name} Bill Items #:${bill_item_id} `;

        let date = payment_date;
        let gl_account_id_to_credit = 79; //supplier invoices gl account liability account increase
        let gl_account_id_to_debit = bill_item_gl_expense_account_id;

         const glPost = await postGl(
           gl_account_id_to_debit,
           gl_account_id_to_credit,
           gl_description,
           transaction_origin,
           transaction_origin_ref_no,
           payment_date,
           bill_item_gross_amount
         );

       
      }
     

      resolve("success");
    } catch (error) {
      reject(error);
   }
  
    
  })

  
  return approveBillPromise;
};

const bill_details = async (id) => {
  const billDetails = new Promise((myResolve, myReject) => {
    const sql = `SELECT * FROM bills b,suppliers s WHERE b.supplier_id = s.supplier_id AND b.entry_id='${id}'  ORDER BY b.date_due DESC`;
    conn.query(sql, (error, result) => {
      if (error) {
        myReject(error);
      } else {
        myResolve(result);
      }
    });
  });

  return billDetails;
};
const bill_items = async (id) => {
  const billItems = new Promise((myResolve, myReject) => {
    const sql = `SELECT * FROM bill_items WHERE bill_id='${id}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        myReject(error);
      } else {
        myResolve(result);
      }
    });
  });
  return billItems;
};
const pay_bills_report = async (start_date, end_date, supplier_id = 0) => {
  const billsReport = new Promise((myResolve, myReject) => {
    let sql = "";

    if (supplier_id == 0) {
      sql = `SELECT p.entry_id AS receipt_no,p.payment_date,p.payment_method,p.reference_no,p.payment_gl_account_id,g.account_name,p.amount_paid AS amount_p,p.date,i.ref_no,i.entry_id AS bill_id,i.date_on_bill,i.date_due,i.amount_due,i.amount_paid,i.balance,i.status,i.memo,i.user_id,i.supplier_id,s.supplier_name,s.postal_address,s.postal_code,s.contact_person,s.contact_person_mobile_no,s.contact_person_email_address,s.tel_no FROM pay_bill p, suppliers s,gl_accounts g,bills i
	  WHERE p.payment_gl_account_id = g.account_id  AND p.bill_id = i.entry_id AND i.supplier_id=s.supplier_id AND p.payment_date >= '${start_date}' AND p.payment_date <= '${end_date}' ORDER BY p.payment_date `;
    } else {
      sql = `SELECT p.entry_id AS receipt_no,p.payment_date,p.payment_method,p.reference_no,p.payment_gl_account_id,g.account_name,p.amount_paid AS amount_p,p.date,i.ref_no,i.entry_id AS bill_id,i.date_on_bill,i.date_due,i.amount_due,i.amount_paid,i.balance,i.status,i.memo,i.user_id,i.supplier_id,s.supplier_name,s.postal_address,s.postal_code,s.contact_person,s.contact_person_mobile_no,s.contact_person_email_address,s.tel_no FROM pay_bill p, suppliers s,gl_accounts g,bills i
	  WHERE p.payment_gl_account_id = g.account_id  AND p.bill_id = i.entry_id AND i.supplier_id=s.supplier_id AND s.supplier_id='${supplier_id}' AND p.payment_date >= '${start_date}' AND p.payment_date <= '${end_date}' ORDER BY p.payment_date `;
    }

    conn.query(sql, (error, result) => {
      if (error) {
        myReject(error);
      }
      myResolve(result);
    });
  });

  return billsReport;
};

const bills_by_params = async (
  status,
  supplier_id = null,
  start_date = null,
  end_date = null
) => {
  const billsByStatus = new Promise((myResolve, myReject) => {
    let sql = "";

    let supplier = "";
    let period = "";
    if (supplier_id && supplier_id > 0) {
      supplier = `AND s.supplier_id='${supplier_id}'`;
    }

    if (status === "all") {
      status = "";
    } else {
      status = `AND b.status = '${status}'`;
    }

    if (start_date) {
      period = `AND b.date_on_bill >= '${start_date}' AND b.date_on_bill <= '${end_date}'`;
    }

    sql = `SELECT b.entry_id,b.memo,b.ref_no,b.date_on_bill,b.date_due,b.amount_due,b.amount_paid,b.balance,b.status,b.user_id, b.date_added,s.supplier_name
				  FROM bills b,suppliers s WHERE b.supplier_id = s.supplier_id  ${status} ${supplier} ${period} ORDER BY s.supplier_name, b.date_due DESC`;

    conn.query(sql, (error, result) => {
      if (error) {
        myReject(error);
      }
      myResolve(result);
    });
  });
  return billsByStatus;
};

const bills_by_status = async (status, supplier_id = null) => {
  const billsByStatus = new Promise((myResolve, myReject) => {
    let sql = "";

    let supplier = "";
    if (supplier_id) {
      supplier = `AND s.supplier_id='${supplier_id}'`;
    }

    if (status === "all") {
      status = "";
    } else {
      status = `AND b.status = '${status}'`;
    }

    sql = `SELECT b.entry_id,b.memo,b.ref_no,b.date_on_bill,b.date_due,b.amount_due,b.amount_paid,b.balance,b.status,b.user_id, b.date_added,s.supplier_name
				  FROM bills b,suppliers s WHERE b.supplier_id = s.supplier_id  ${status} ${supplier} ORDER BY b.date_due DESC`;

    conn.query(sql, (error, result) => {
      if (error) {
        myReject(error);
      }
      myResolve(result);
    });
  });
  return billsByStatus;
};

const uncleared = async () => {
  const unclearedBills = new Promise((myResolve, myReject) => {
    const sql = `SELECT b.entry_id,b.memo,b.ref_no,b.date_on_bill,b.date_due,b.amount_due,b.amount_paid,b.balance,b.status,b.user_id, b.date_added,s.supplier_name
				  FROM bills b,suppliers s WHERE b.supplier_id = s.supplier_id AND b.status='APPROVED'  AND b.balance > 0 ORDER BY b.date_due DESC`;
    conn.query(sql, (error, result) => {
      if (error) {
        myReject(error);
      }
      myResolve(result);
    });
  });
  return unclearedBills;
};

const supplier_bills = async (
  searchType = "supplier_id",
  supplier_search_value,
  bill_balance = 0
) => {
  const supplierBills = new Promise((myResolve, myReject) => {
    let sql = "";
    let balance;
    if ((bill_balance = 0)) {
      balance = `AND b.balance <= 0`;
    } else {
      balance = `AND b.balance > 0`;
    }
    if (searchType === "supplier_id") {
      sql = `SELECT b.entry_id,b.memo,b.ref_no,b.date_on_bill,b.date_due,b.amount_due,b.amount_paid,b.balance,b.status,b.user_id, b.date_added,s.supplier_name
				  FROM bills b,suppliers s WHERE b.supplier_id = s.supplier_id AND b.status='APPROVED' ${balance} > 0 AND s.supplier_id='${supplier_search_value}'  ORDER BY b.date_due DESC`;
    } else {
      sql = `SELECT b.entry_id,b.memo,b.ref_no,b.date_on_bill,b.date_due,b.amount_due,b.amount_paid,b.balance,b.status,b.user_id, b.date_added,s.supplier_name
				  FROM bills b,suppliers s WHERE b.supplier_id = s.supplier_id AND b.status='APPROVED' ${balance} > 0 AND s.supplier_name='${supplier_search_value}'  ORDER BY b.date_due DESC`;
    }

    conn.query(sql, (error, result) => {
      if (error) {
        myReject(error);
      }
      myResolve(result);
    });
  });
  return supplierBills;
};

module.exports = {
  insert_bill,
  pay_bill,
  update_bill,
  delete_bill,
  pay_bills_report,
  bills_by_status,
  bills_by_params,
  supplier_bills,
  uncleared,
  bill_details,
  bill_items,
  approve_bill,
};
