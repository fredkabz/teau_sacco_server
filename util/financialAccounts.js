const conn = require("./database2");
const { queryPromise } = require("./general");
//acount categories
const getAccountCategories = async () => {
  const accountCategories = new Promise((myResolve, myReject) => {
    const sql = "SELECT * FROM account_category";
    conn.query(sql, (error, result) => {
      if (error) {
        myReject(error);
      } else {
        myResolve(result);
      }
    });
  });

  return accountCategories;
};

//account types
const getAccountTypes = async (categoryId = null) => {
  const accountTypes = new Promise((myResolve, myReject) => {
    const sql = "SELECT * FROM account_types";
    conn.query(sql, (error, result) => {
      if (error) {
        myReject(error);
      } else {
        myResolve(result);
      }
    });
  });

  return accountTypes;
};

const getAccountTypesFiltered = async (category) => {
  const accountTypes = new Promise((myResolve, myReject) => {
    let queryFilter = `WHERE `;
    if (category) {
      queryFilter += `account_category_id = ${category}`;
    }

    sql = `SELECT * FROM account_types ${queryFilter}`;
    conn.query(sql, (error, result) => {
      if (error) {
        myReject(error);
      } else {
        myResolve(result);
      }
    });
  });

  return accountTypes;
};

//budget groupings
const getBudgetGrouping = async () => {
  const budgetGrouping = new Promise((myResolve, myReject) => {
    const sql = "SELECT * FROM budget_grouping";
    conn.query(sql, (error, result) => {
      if (error) {
        myReject(error);
      } else {
        myResolve(result);
      }
    });
  });

  return budgetGrouping;
};

//suppliers
const getSuppliers = async () => {
  const suppliers = new Promise((myResolve, myReject) => {
    const sql = "SELECT * FROM suppliers";
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
    let queryFilter = `WHERE `;
    if (id) {
      queryFilter += `supplier_id = ${id}`;
    }
    if (name) {
      queryFilter += `supplier_name=${name}`;
    }

    sql = `SELECT * FROM suppliers ${queryFilter}`;
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

//all gl accounts
const getGlAccounts = async () => {
  const glAccounts = new Promise((myResolve, myReject) => {
    sql = `SELECT * FROM gl_accounts g,account_category c, account_types t WHERE g.account_category_id=c.account_category_id AND g.account_type_id=t.account_type_id `;
    conn.query(sql, (error, result) => {
      if (error) {
        myReject(error);
      } else {
        myResolve(result);
      }
    });
  });

  return glAccounts;
};

const getGlAccountsFiltered = async (option = null, id = null) => {
  const glAccounts = new Promise((myResolve, myReject) => {
    let queryFilter = `WHERE `;
    if (option == "category") {
      queryFilter += `account_category_id = ${id}`;
    }
    if (option == "type") {
      queryFilter += `account_type_id=${id}`;
    }

    sql = `SELECT * FROM gl_accounts ${queryFilter}`;
    conn.query(sql, (error, result) => {
      if (error) {
        myReject(error);
      } else {
        myResolve(result);
      }
    });
  });

  return glAccounts;
};

const getGlAccountsFilteredDate = async (category = null,type=null) => {
  let sql;

  if (category && type) {
    sql = `SELECT t.account_type_name,a.account_no,a.account_name,a.account_id,a.account_category_id,a.balance,a.account_description,a.sub_account_id,c.account_category_name,t.account_type_name FROM gl_accounts a,account_types t,account_category c WHERE a.account_type_id = t.account_type_id AND a.account_category_id=c.account_category_id AND c.account_category_id ='${category}' AND t.account_type_id='${type}'  ORDER BY a.account_category_id`;
  }else   if (type && !category) {
    sql = `SELECT t.account_type_name,a.account_no,a.account_name,a.account_id,a.account_category_id,a.balance,a.account_description,a.sub_account_id,c.account_category_name,t.account_type_name FROM gl_accounts a,account_types t,account_category c WHERE a.account_type_id = t.account_type_id AND a.account_category_id=c.account_category_id AND c.account_type_id ='${type}'  ORDER BY a.account_category_id  `;
  } else if (category && !type) {
    sql = `SELECT t.account_type_name,a.account_no,a.account_name,a.account_id,a.account_category_id,a.balance,a.account_description,a.sub_account_id,c.account_category_name,t.account_type_name FROM gl_accounts a,account_types t,account_category c WHERE a.account_type_id = t.account_type_id AND a.account_category_id=c.account_category_id AND c.account_category_id ='${category}'  ORDER BY a.account_category_id `;
  } else {
    sql = `SELECT t.account_type_name,a.account_no,a.account_name,a.account_id,a.account_category_id,a.balance,a.account_description,a.sub_account_id,c.account_category_name,t.account_type_name FROM gl_accounts a,account_types t,account_category c WHERE a.account_type_id = t.account_type_id AND a.account_category_id=c.account_category_id ORDER BY a.account_category_id `;
  }


  // console.log(sql);
  const glAccounts = await new Promise((resolve, reject) => {
    conn.query(sql, (error, result) => {
      if (error) {
        // console.log(error);
        reject(error);
      } else {
        //  console.log(result)
        resolve(result);
      }
    })
  });

  return glAccounts;

}

const getLedgersFiltered = async (gl_account_id=null,start_date=null,end_date=null) => {
  let sql;

  if (gl_account_id && !start_date) {
    sql = `SELECT credit,debit,description  FROM general_ledger WHERE gl_account_id='${gl_account_id}'`;
  } else if (gl_account_id && start_date) {
    sql = `SELECT credit,debit,description  FROM general_ledger WHERE gl_account_id='${gl_account_id}' AND date >= '${start_date}' AND date <= '${end_date}'`;
  } else {
    sql = `SELECT credit,debit,description  FROM general_ledger`;
  }

  const glLedgers = await new Promise((resolve, reject) => {
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        // console.log(result)
        resolve(result)
      }
    })
  });

  return glLedgers;

}


const getTrialBalance = async (start_date, end_date) => {
  
  let trialBalance = [];

  //get all gl accounts
  const glAccounts = await new Promise((resolve, reject) => {

    const sql = `SELECT g.account_id,g.account_no,g.account_name,g.balance,c.account_category_id,c.account_category_name,t.account_type_name 
	  FROM gl_accounts g,account_category c,account_types t WHERE g.account_category_id=c.account_category_id AND g.account_type_id = t.account_type_id ORDER BY c.account_category_id, t.account_type_id`;
    
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    })

  });

  let account_id;
  let category_id;
  let category_name;
  let account_name;
  let account_no;
  
  //get ledgers
  for (let i = 0; i < glAccounts.length; i++){
   account_id = glAccounts[i].account_id;
    category_id = glAccounts[i].account_category_id;
    category_name = glAccounts[i].account_category_name;
    type_name = glAccounts[i].account_type_name;
    type_id = glAccounts[i].account_type_id;
    account_name = glAccounts[i].account_name;
    account_no = glAccounts[i].account_no;

    const ledgers = await new Promise((resolve, reject) => {
      const sql = `SELECT credit,debit  FROM general_ledger WHERE gl_account_id='${account_id}' AND date >= '${start_date}' AND date <= '${end_date}'`;
      conn.query(sql, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      })
    });

     let re_credit = 0;
    let re_debit = 0;
    let debit;
    let credit;
    let cr_amount;
    let db_amount;

    // console.log(`ledger length:${ledgers.length}`)

    
    for (let k = 0; k< ledgers.length; k++){
      
							    cr_amount = ledgers[k].credit;
                  db_amount = ledgers[k].debit;

                 re_credit += cr_amount;
                 re_debit += db_amount;
    }
    
    if (category_id === 1 || category_id === 5 || category_id === 6) {
      debit = re_debit - re_credit;
      //$debit=$rows['balance'];
      credit = "";
    } else {
      debit = "";
      credit = re_credit - re_debit;
    }

    let trans = {
      account_id: account_id,
      category_id: category_id,
      category_name: category_name,
      type_id: type_id,
      type_name:type_name,
      account_name: account_name,
      account_number: account_no,
      debit: debit,
      credit:credit
    }

    trialBalance.push(trans);
  }

  return trialBalance;
  

}

class GeneralLedgerTransactions{
  debit_gl_account_balance;
  credit_gl_account_balance;
  debit_gl_account_category_id;
  credit_gl_account_category_id;
  gl_debited_ref_id;
  gl_credited_ref_id;

  constructor(gl_account_id_to_debit=null,gl_account_id_to_credit=null,gl_description,transaction_origin,transaction_origin_ref_no,payment_date,amount_to_pay) {
    //transaction variables
  this.gl_account_id_to_debit=gl_account_id_to_debit;
  this.gl_account_id_to_credit=gl_account_id_to_credit;
  this.gl_description=gl_description;
  this.transaction_origin=transaction_origin;
  this.transaction_origin_ref_no=transaction_origin_ref_no;
  this.payment_date=payment_date;
  this.amount_to_pay=amount_to_pay;
  }
  

  async getDebitAccountBalance() {

    const sqlDebitAccountBalance = `SELECT balance,account_category_id FROM gl_accounts WHERE account_id=?`;
    const paramsDebitAccountBalance = [this.gl_account_id_to_debit];
    const debitAccountbalance = await queryPromise(sqlDebitAccountBalance, paramsDebitAccountBalance);

    this.debit_gl_account_balance = debitAccountbalance[0].balance;
    this.debit_gl_account_category_id = debitAccountbalance[0].account_category_id;
    
  }

  async getCreditAccountBalance() {
    const sqlCreditAccountBalance = `SELECT balance,account_category_id FROM gl_accounts WHERE account_id=?`;
    const paramsCreditAccountBalance = [this.gl_account_id_to_credit];
    const creditAccountbalance = await queryPromise(sqlCreditAccountBalance, paramsCreditAccountBalance);

    this.credit_gl_account_balance = creditAccountbalance[0].balance;
    this.credit_gl_account_category_id = creditAccountbalance[0].account_category_id;
  }


  async debitGlEntry() {


    const sqlGlAccountEntry = `INSERT INTO general_ledger(gl_account_id,date,description,debit,credit,balance) VALUES(?,?,?,?,?,?)`;
    const paramsGlAccountEntry = [this.gl_account_id_to_debit,this.payment_date,this.gl_description,this.amount_to_pay,0,0];
    const glEntry = await queryPromise(sqlGlAccountEntry, paramsGlAccountEntry);

    this.gl_debited_ref_id = glEntry.insertId;
    
  } 

  async creditGlEntry() {

    const sqlGlAccountEntry = `INSERT INTO general_ledger(gl_account_id,date,description,debit,credit,balance) VALUES(?,?,?,?,?,?)`;
    const paramsGlAccountEntry = [this.gl_account_id_to_credit,this.payment_date,this.gl_description,0,this.amount_to_pay,0];
    const glEntry = await queryPromise(sqlGlAccountEntry, paramsGlAccountEntry);

    this.gl_credited_ref_id = glEntry.insertId;
    

   
  }

  async debitUpdateGlOppositeReference() {
    const sqlUpdateOppositeGl = `UPDATE general_ledger SET 
    opposite_gl_account_id=? ,transaction_type_from=?,transaction_type_no=?  WHERE entry_id=?`;
    const paramsUpdateOppositeGl = [this.gl_credited_ref_id,this.this.transaction_origin,this.transaction_origin_ref_no,this.gl_debited_ref_id];
    const updateOppositeGL = await queryPromise(sqlUpdateOppositeGl, paramsUpdateOppositeGl);
  }

  async creditUpdateGlOppositeReference() {
    const sqlUpdateOppositeGl = `UPDATE general_ledger SET 
    opposite_gl_account_id=? ,transaction_type_from=?,transaction_type_no=?  WHERE entry_id=?`;
    const paramsUpdateOppositeGl = [this.gl_debited_ref_id,this.this.transaction_origin,this.transaction_origin_ref_no,this.gl_credited_ref_id];
    const updateOppositeGL = await queryPromise(sqlUpdateOppositeGl, paramsUpdateOppositeGl);
  }

  async debitJournalEntry() {
    const sqlJournalEntry = `INSERT INTO general_journal(date,description,post_ref,debit) VALUES(?,?,?,?)`;
    const paramsJournalEntry = [this.payment_date,this.this.gl_description,this.gl_debited_ref_id,this.amount_to_pay];
    const journalEntry = await queryPromise(sqlJournalEntry, paramsJournalEntry)
  }

  async creditJournalEntry() {
    const sqlJournalEntry = `INSERT INTO general_journal(date,description,post_ref,debit) VALUES(?,?,?,?)`;
    const paramsJournalEntry = [this.payment_date,this.this.gl_description,this.gl_credited_ref_id,this.amount_to_pay];
    const journalEntry = await queryPromise(sqlJournalEntry, paramsJournalEntry)
  }

  async updateDebitGlAccountBalance() {


    const sqlEntryBalances= `SELECT debit,credit FROM general_ledger WHERE entry_id=?`;
    const paramsEntryBalances = [this.gl_debited_ref_id];
    const entryBalances = await queryPromise(sqlEntryBalances, paramsEntryBalances);

    let debit_gl_dr  = entryBalances[0].debit;
    let debit_gl_cr = entryBalances[0].credit;
    let new_balance;

  

  

  if (this.debit_gl_account_category_id == 1 || this.debit_gl_account_category_id == 5) {
    new_balance = this.debit_gl_account_balance + debit_gl_dr - debit_gl_cr;
  } else {
    new_balance = this.debit_gl_account_balance + debit_gl_cr - debit_gl_dr;
  }

    //update debit gl account with new balance
    const sqlUpdateGlAccount = `UPDATE gl_accounts SET balance=? WHERE account_id=?`;
    const paramsUpdateGlAccount = [new_balance,this.gl_account_id_to_debit];
    const updatedGLAccount = await queryPromise(sqlUpdateGlAccount, paramsUpdateGlAccount);



  
  }

  async updateCreditGlAccountBalance() {
    
     
    const sqlEntryBalances = `SELECT debit,credit FROM general_ledger WHERE entry_id=?`;
    const paramsEntryBalances = [this.gl_credited_ref_id];
    const entryBalances = await queryPromise(sqlEntryBalances, paramsEntryBalances);

    
     
    let credit_gl_dr = entryBalances[0].debit;
    let credit_gl_cr = entryBalances[0].credit;
    let new_balance;

  

  

    if (
      this.credit_gl_account_category_id == 1 ||
      this.credit_gl_account_category_id == 5
    ) {
      new_balance = this.credit_gl_account_balance + credit_gl_dr - credit_gl_cr;
    } else {
      new_balance = this.credit_gl_account_balance + credit_gl_cr - credit_gl_dr;
    }

    //update debit gl account with new balance
    const sqlUpdateGlAccount = `UPDATE gl_accounts SET balance=? WHERE account_id=?`;
    const paramsUpdateGlAccount = [new_balance, this.gl_account_id_to_credit];
    const updatedGLAccount = await queryPromise(sqlUpdateGlAccount, paramsUpdateGlAccount);

     
    
    

  }




}

const postGlSetUp=async (
  gl_account_id_to_debit,
  gl_account_id_to_credit,
  gl_description,
  transaction_origin,
  transaction_origin_ref_no,
  payment_date,
  amount_to_pay
) => {
  
  //get gl balances
  const debit_account_balance = await new Promise((resolve, reject) => {
    const sql = `SELECT balance,account_category_id FROM gl_accounts WHERE account_id='${gl_account_id_to_debit}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  const credit_account_balance = await new Promise((resolve, reject) => {
    const sql = `SELECT balance,account_category_id FROM gl_accounts WHERE account_id='${gl_account_id_to_credit}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  const debit_gl_balance = debit_account_balance[0].balance;
  const debit_gl_account_category_id =
    debit_account_balance[0].account_category_id;

  const credit_gl_balance = credit_account_balance[0].balance;
  const credit_gl_account_category_id =
    credit_account_balance[0].account_category_id;

 // console.log(`dr balance: ${debit_gl_balance} acc id:${debit_gl_account_category_id} cr balance:${credit_gl_balance} acc id:${credit_gl_account_category_id}`)
  //gl entry for both accounts

  // console.log(`payment date: ${payment_date}`)
  const gl_entry_for_acct_to_debit = await new Promise((resolve, reject) => {
    const sql = `INSERT INTO general_ledger(gl_account_id,date,description,debit,credit,balance) VALUES('${gl_account_id_to_debit}','${payment_date}','${gl_description}','${amount_to_pay}',0,0)`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  const gl_debited_ref_id = gl_entry_for_acct_to_debit.insertId;



  const gl_entry_for_acct_to_credit = await new Promise((resolve, reject) => {
    const sql = `INSERT INTO general_ledger(gl_account_id,date,description,debit,credit,balance) VALUES('${gl_account_id_to_credit}','${payment_date}','${gl_description}',0,'${amount_to_pay}',0)`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  const gl_credited_ref_id = gl_entry_for_acct_to_credit.insertId;
    console.log(`insert id dr:${gl_debited_ref_id} insert id cr:${gl_credited_ref_id}`);


  //update gl entries with opposite accounts references
  const debitUpdateGlOpposite = await new Promise((resolve, reject) => {
    const sql = `UPDATE general_ledger SET opposite_gl_account_id='${gl_credited_ref_id}' ,transaction_type_from='${transaction_origin}',transaction_type_no='${transaction_origin_ref_no}'  WHERE entry_id='${gl_debited_ref_id}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  const creditUpdateGlOpposite = await new Promise((resolve, reject) => {
    const sql = `UPDATE general_ledger SET opposite_gl_account_id='${gl_debited_ref_id}' ,transaction_type_from='${transaction_origin}',transaction_type_no='${transaction_origin_ref_no}'  WHERE entry_id='${gl_credited_ref_id}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

 // console.log(`update opposite done!`)
  //general journal entries

  const debitJournalEntry = await new Promise((resolve, reject) => {
    const sql = `  INSERT INTO general_journal(date,description,post_ref,debit) VALUES('${payment_date}','${gl_description}','${gl_debited_ref_id}','${amount_to_pay}')`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
  const creditJournalEntry = await new Promise((resolve, reject) => {
    const sql = `  INSERT INTO general_journal(date,description,post_ref,credit) VALUES('${payment_date}','${gl_description}','${gl_credited_ref_id}','${amount_to_pay}')`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  //get gl debit and credit and update balance

  const get_debit_gl_entry_balances = await new Promise((resolve, reject) => {
    const sql = `SELECT debit,credit FROM general_ledger WHERE entry_id='${gl_debited_ref_id}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  let debit_gl_dr = get_debit_gl_entry_balances[0].debit;
  let debit_gl_cr = get_debit_gl_entry_balances[0].credit;
  let new_balance;

  if (debit_gl_account_category_id == 1 || debit_gl_account_category_id == 5) {
    new_balance = debit_gl_balance + debit_gl_dr - debit_gl_cr;
  } else {
    new_balance = debit_gl_balance + debit_gl_cr - debit_gl_dr;
  }

  //update debit gl account with new balance
  const update_dr_gl_balance = await new Promise((resolve, reject) => {
    const sql = `UPDATE gl_accounts SET balance='${new_balance}' WHERE account_id='${gl_account_id_to_debit}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  const get_credit_gl_entry_balances = await new Promise((resolve, reject) => {
    const sql = `SELECT debit,credit FROM general_ledger WHERE entry_id='${gl_credited_ref_id}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  let credit_gl_dr = get_credit_gl_entry_balances[0].debit;
  let credit_gl_cr = get_credit_gl_entry_balances[0].credit;
  let new_balance_cr;

  if (
    credit_gl_account_category_id == 1 ||
    credit_gl_account_category_id == 5
  ) {
    new_balance_cr = credit_gl_balance + credit_gl_dr - credit_gl_cr;
  } else {
    new_balance_cr = credit_gl_balance + credit_gl_cr - credit_gl_dr;
  }

  //update credit gl account with new balance
  const update_cr_gl_balance = await new Promise((resolve, reject) => {
    const sql = `UPDATE gl_accounts SET balance='${new_balance_cr}' WHERE account_id='${gl_account_id_to_credit}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

const postGl = async (
  gl_account_id_to_debit,
  gl_account_id_to_credit,
  gl_description,
  transaction_origin,
  transaction_origin_ref_no,
  payment_date,
  amount_to_pay
) => {
  
  //get gl balances
  const debit_account_balance = await new Promise((resolve, reject) => {
    const sql = `SELECT balance,account_category_id FROM gl_accounts WHERE account_id='${gl_account_id_to_debit}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  const credit_account_balance = await new Promise((resolve, reject) => {
    const sql = `SELECT balance,account_category_id FROM gl_accounts WHERE account_id='${gl_account_id_to_credit}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  const debit_gl_balance = debit_account_balance[0].balance;
  const debit_gl_account_category_id =
    debit_account_balance[0].account_category_id;

  const credit_gl_balance = credit_account_balance[0].balance;
  const credit_gl_account_category_id =
    credit_account_balance[0].account_category_id;

 // console.log(`dr balance: ${debit_gl_balance} acc id:${debit_gl_account_category_id} cr balance:${credit_gl_balance} acc id:${credit_gl_account_category_id}`)
  //gl entry for both accounts

  // console.log(`payment date: ${payment_date}`)
  const gl_entry_for_acct_to_debit = await new Promise((resolve, reject) => {
    const sql = `INSERT INTO general_ledger(gl_account_id,date,description,debit,credit,balance) VALUES('${gl_account_id_to_debit}','${payment_date}','${gl_description}','${amount_to_pay}',0,0)`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  const gl_debited_ref_id = gl_entry_for_acct_to_debit.insertId;



  const gl_entry_for_acct_to_credit = await new Promise((resolve, reject) => {
    const sql = `INSERT INTO general_ledger(gl_account_id,date,description,debit,credit,balance) VALUES('${gl_account_id_to_credit}','${payment_date}','${gl_description}',0,'${amount_to_pay}',0)`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  const gl_credited_ref_id = gl_entry_for_acct_to_credit.insertId;
    console.log(`insert id dr:${gl_debited_ref_id} insert id cr:${gl_credited_ref_id}`);


  //update gl entries with opposite accounts references
  const debitUpdateGlOpposite = await new Promise((resolve, reject) => {
    const sql = `UPDATE general_ledger SET opposite_gl_account_id='${gl_credited_ref_id}' ,transaction_type_from='${transaction_origin}',transaction_type_no='${transaction_origin_ref_no}'  WHERE entry_id='${gl_debited_ref_id}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  const creditUpdateGlOpposite = await new Promise((resolve, reject) => {
    const sql = `UPDATE general_ledger SET opposite_gl_account_id='${gl_debited_ref_id}' ,transaction_type_from='${transaction_origin}',transaction_type_no='${transaction_origin_ref_no}'  WHERE entry_id='${gl_credited_ref_id}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

 // console.log(`update opposite done!`)
  //general journal entries

  const debitJournalEntry = await new Promise((resolve, reject) => {
    const sql = `  INSERT INTO general_journal(date,description,post_ref,debit) VALUES('${payment_date}','${gl_description}','${gl_debited_ref_id}','${amount_to_pay}')`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
  const creditJournalEntry = await new Promise((resolve, reject) => {
    const sql = `  INSERT INTO general_journal(date,description,post_ref,credit) VALUES('${payment_date}','${gl_description}','${gl_credited_ref_id}','${amount_to_pay}')`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  //get gl debit and credit and update balance

  const get_debit_gl_entry_balances = await new Promise((resolve, reject) => {
    const sql = `SELECT debit,credit FROM general_ledger WHERE entry_id='${gl_debited_ref_id}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  let debit_gl_dr = get_debit_gl_entry_balances[0].debit;
  let debit_gl_cr = get_debit_gl_entry_balances[0].credit;
  let new_balance;

  if (debit_gl_account_category_id == 1 || debit_gl_account_category_id == 5) {
    new_balance = debit_gl_balance + debit_gl_dr - debit_gl_cr;
  } else {
    new_balance = debit_gl_balance + debit_gl_cr - debit_gl_dr;
  }

  //update debit gl account with new balance
  const update_dr_gl_balance = await new Promise((resolve, reject) => {
    const sql = `UPDATE gl_accounts SET balance='${new_balance}' WHERE account_id='${gl_account_id_to_debit}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  const get_credit_gl_entry_balances = await new Promise((resolve, reject) => {
    const sql = `SELECT debit,credit FROM general_ledger WHERE entry_id='${gl_credited_ref_id}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  let credit_gl_dr = get_credit_gl_entry_balances[0].debit;
  let credit_gl_cr = get_credit_gl_entry_balances[0].credit;
  let new_balance_cr;

  if (
    credit_gl_account_category_id == 1 ||
    credit_gl_account_category_id == 5
  ) {
    new_balance_cr = credit_gl_balance + credit_gl_dr - credit_gl_cr;
  } else {
    new_balance_cr = credit_gl_balance + credit_gl_cr - credit_gl_dr;
  }

  //update credit gl account with new balance
  const update_cr_gl_balance = await new Promise((resolve, reject) => {
    const sql = `UPDATE gl_accounts SET balance='${new_balance_cr}' WHERE account_id='${gl_account_id_to_credit}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

const deleteGl = async (id) => {
  let entry_id = id;
  let testReturnData = [{gl_account_id:"",balance:"",new_balance:"",account_category_name:"",opposite_gl_account_id:""}];
  //get ledger details
  const getLedgerDetails = await new Promise((resolve, reject) => {
    let sql = `SELECT * FROM general_ledger WHERE entry_id='${id}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  let opposite_gl_account_id = getLedgerDetails[0].opposite_gl_account_id;
  let debit = getLedgerDetails[0].debit;
  let credit = getLedgerDetails[0].credit;
  let gl_account_id = getLedgerDetails[0].gl_account_id;

  testReturnData[0].gl_account_id = gl_account_id;
  testReturnData[0].opposite_gl_account_id = opposite_gl_account_id;

  const getGlAcccountDetails = await new Promise((resolve, reject) => {
    const sql = `SELECT g.balance,c.account_category_name FROM gl_accounts g,account_category c WHERE g.account_id='${gl_account_id}' AND g.account_category_id=c.account_category_id`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  let balance = getGlAcccountDetails[0].balance;
  let account_category_name = getGlAcccountDetails[0].account_category_name;
  let new_balance;

  testReturnData[0].balance = balance;
  testReturnData[0].account_category_name = account_category_name;

  if (
    account_category_name === "Assets" ||
    account_category_name === "Expenses"
  ) {
    if (credit > 0) {
      new_balance = balance + credit;
    } else {
      new_balance = balance - debit;
    }
  } else {
    if (credit > 0) {
      new_balance = balance - credit;
    } else {
      new_balance = balance + debit;
    }
  }

  testReturnData[0].new_balance = new_balance;

  
  // update gl account
  const updateGl = await new Promise((resolve, reject) => {
    const sql = `UPDATE gl_accounts SET balance='${new_balance}' WHERE account_id='${gl_account_id}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  //delete general ledger entry
  const deleteGeneralLedger = await new Promise((resolve, reject) => {
    const sql = `DELETE FROM general_ledger WHERE entry_id='${entry_id}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        throw new Error(error);
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  //delete general journal entry
  const deleteGeneralJournal = await new Promise((resolve, reject) => {
    const sql = `DELETE FROM general_journal WHERE post_ref='${entry_id}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  //repeat same transactions for the balancing account**************************

  //get oppsite ledger details
  const getLedgerDetailsOpposite = await new Promise((resolve, reject) => {
    let sql = `SELECT * FROM general_ledger WHERE entry_id='${opposite_gl_account_id}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

 
  let debit_opposite = getLedgerDetailsOpposite[0].debit;
  let credit_opposite = getLedgerDetailsOpposite[0].credit;
  let gl_account_id_opposite = getLedgerDetailsOpposite[0].gl_account_id;

  

  const getGlAcccountDetailsOpposite = await new Promise((resolve, reject) => {
    const sql = `SELECT g.balance,c.account_category_name FROM gl_accounts g,account_category c WHERE g.account_id='${gl_account_id_opposite}' AND g.account_category_id=c.account_category_id`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  let balance_opposite = getGlAcccountDetailsOpposite[0].balance;
  let account_category_name_opposite = getGlAcccountDetailsOpposite[0].account_category_name;
  let new_balance_opposite;

  if (
    account_category_name_opposite === "Assets" ||
    account_category_name_opposite === "Expenses"
  ) {
    if (credit_opposite > 0) {
      new_balance_opposite = balance_opposite + credit_opposite;
    } else {
      new_balance_opposite = balance_opposite - debit_opposite;
    }
  } else {
    if (credit_opposite > 0) {
      new_balance_opposite = balance_opposite - credit_opposite;
    } else {
      new_balance_opposite = balance_opposite + debit_opposite;
    }
  }

  testReturnData.push({
    gl_account_id: gl_account_id_opposite,
    balance: balance_opposite,
    new_balance: new_balance_opposite,
    account_category_name: account_category_name_opposite,
  });

  // update gl account
  const updateGlOpposite = await new Promise((resolve, reject) => {
    const sql = `UPDATE gl_accounts SET balance='${new_balance_opposite}' WHERE account_id='${gl_account_id_opposite}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  //delete general ledger entry
  const deleteGeneralLedgerOpposite = await new Promise((resolve, reject) => {
    const sql = `DELETE FROM general_ledger WHERE entry_id='${opposite_gl_account_id}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  //delete general journal entry
  const deleteGeneralJournalOpposite = await new Promise((resolve, reject) => {
    const sql = `DELETE FROM general_journal WHERE post_ref='${opposite_gl_account_id}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  return testReturnData;
}

const updateGl = async (transaction_id,transaction_type_from,old_amount,new_amount,gl_account_id_edit) => {
  const transactionID = transaction_id;
  // const transaction_type_from = transaction_type_from;
  // const old_amount = old_amount;
  // const new_amount = new_amount;
  // const gl_account_id_edit = gl_account_id_edit;

  //get general ledger details
  const getGeneralLedgerDetails = await new Promise((resolve, reject) => {
    const sql = `SELECT * FROM general_ledger WHERE transaction_type_no='${transactionID}' AND transaction_type_from='${transaction_type_from}' AND gl_account_id='${gl_account_id_edit}'`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  const opposite_gl_account_id =
    getGeneralLedgerDetails[0].opposite_gl_account_id;
  const debit = getGeneralLedgerDetails[0].debit;
  const credit = getGeneralLedgerDetails[0].credit;
  const gl_account_id = getGeneralLedgerDetails[0].gl_account_id;
  const entry_id = getGeneralLedgerDetails[0].entry_id;

  //update general ledger
  if (debit > 0) {
    const updateGeneralLedger = await new Promise((resolve, reject) => {
      const sql = `UPDATE general_ledger SET debit='${new_amount}' WHERE entry_id='${entry_id}'`;
      conn.query(sql, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    const updateGeneralJournal = await new Promise((resolve, reject) => {
      const sql = `UPDATE general_journal SET debit='${new_amount}' WHERE post_ref='${entry_id}'`;
      conn.query(sql, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
  if (credit > 0) {
    const updateGeneralLedger = await new Promise((resolve, reject) => {
      const sql = `UPDATE general_ledger SET credit='${new_amount}' WHERE entry_id='${entry_id}'`;
      conn.query(sql, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    const updateGeneralJournal = await new Promise((resolve, reject) => {
      const sql = `UPDATE general_journal SET credit='${new_amount}' WHERE post_ref='${entry_id}'`;
      conn.query(sql, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  //get values for corresponding opposite journal entry
  const getGeneralLedgerDetailsOpposite = await new Promise(
    (resolve, reject) => {
      const sql = `SELECT * FROM general_ledger WHERE entry_id='${opposite_gl_account_id}'`;
      conn.query(sql, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    }
  );

  const debit_opposite = getGeneralLedgerDetailsOpposite[0].debit;
  const credit_opposite = getGeneralLedgerDetailsOpposite[0].credit;
  const gl_account_id_opposite =
    getGeneralLedgerDetailsOpposite[0].gl_account_id;

  //update general ledger of opposite account
  
  if (debit_opposite > 0) {
    const updateGeneralLedger = await new Promise((resolve, reject) => {
      const sql = `UPDATE general_ledger SET debit='${new_amount}' WHERE entry_id='${opposite_gl_account_id}'`;
      conn.query(sql, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    const updateGeneralJournal = await new Promise((resolve, reject) => {
      const sql = `UPDATE general_journal SET debit='${new_amount}' WHERE post_ref='${opposite_gl_account_id}'`;
      conn.query(sql, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
  if (credit_opposite > 0) {
    const updateGeneralLedger = await new Promise((resolve, reject) => {
      const sql = `UPDATE general_ledger SET credit='${new_amount}' WHERE entry_id='${opposite_gl_account_id}'`;
      conn.query(sql, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    const updateGeneralJournal = await new Promise((resolve, reject) => {
      const sql = `UPDATE general_journal SET credit='${new_amount}' WHERE post_ref='${opposite_gl_account_id}'`;
      conn.query(sql, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  //get gl account balance for the first account

   const getGlAccountBalance = await new Promise((resolve, reject) => {
     const sql = `SELECT g.balance,c.account_category_name FROM gl_accounts g,account_category c WHERE g.account_id='${gl_account_id}' AND g.account_category_id=c.account_category_id`;
     conn.query(sql, (error, result) => {
       if (error) {
         reject(error);
       } else {
         resolve(result);
       }
     });
   });
  
  let balance_before;
  let balance_now;
  let balance = getGlAccountBalance[0].balance;
  let account_category_name = getGlAccountBalance[0].account_category_name;

  if (account_category_name === "Assets" || account_category_name === "Expenses") {
    if (credit > 0) {
      balance_before = balance + credit;
      balance_now = balance_before - new_amount;
    } else {
      balance_before = balance - debit;
      balance_now = balance + new_amount;
    }
  } else {
      if (credit > 0) {
        balance_before = balance - credit;
        balance_now = balance_before + new_amount;
      } else {
        balance_before = balance + debit;
        balance_now = balance - new_amount;
      }
  }

  //get account balance for the second account
const getGlAccountBalanceOpposite = await new Promise((resolve, reject) => {
  const sql = `SELECT g.balance,c.account_category_name FROM gl_accounts g,account_category c WHERE g.account_id='${gl_account_id_opposite}' AND g.account_category_id=c.account_category_id`;
  conn.query(sql, (error, result) => {
    if (error) {
      reject(error);
    } else {
      resolve(result);
    }
  });
});

let balance_before_opposite;
let balance_now_opposite;
let balance_opposite = getGlAccountBalanceOpposite[0].balance;
let account_category_name_opposite = getGlAccountBalanceOpposite[0].account_category_name;

if (
  account_category_name_opposite === "Assets" ||
  account_category_name_opposite === "Expenses"
) {
  if (credit_opposite > 0) {
    balance_before_opposite = balance_opposite + credit_opposite;
    balance_now_opposite = balance_before_opposite - new_amount;
  } else {
    balance_before_opposite = balance_opposite - debit_opposite;
    balance_now_opposite = balance_opposite + new_amount;
  }
} else {
  if (credit_opposite > 0) {
    balance_before_opposite = balance_opposite - credit_opposite;
    balance_now_opposite = balance_before_opposite + new_amount;
  } else {
    balance_before_opposite = balance_opposite + debit_opposite;
    balance_now_opposite = balance_opposite - new_amount;
  }
  }
  
  if (old_amount != new_amount) {

    //update gl account 
    const updateGlBalance = await new Promise((resolve, reject) => {
      const sql = `UPDATE gl_accounts SET balance='${balance_now}' WHERE account_id='${gl_account_id}'`;
      conn.query(sql, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      })
    })

    //update opposite gl account
    const updateGlBalanceOpposite = await new Promise((resolve, reject) => {
      const sql = `UPDATE gl_accounts SET balance='${balance_now_opposite}' WHERE account_id='${gl_account_id_opposite}'`;
      conn.query(sql, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

  }

}




module.exports = {
  getAccountCategories,
  getAccountTypes,
  getAccountTypesFiltered,
  getBudgetGrouping,
  getGlAccounts,
  postGlSetUp,
  GeneralLedgerTransactions,
  postGl,
  deleteGl,
  updateGl,
  getGlAccountsFiltered,
  getLedgersFiltered,
  getGlAccountsFilteredDate,
  getTrialBalance,
};
