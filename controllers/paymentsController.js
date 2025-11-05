const dbs = require("../models/");
const Sequelize = require("sequelize");
const sequelize = require("../util/database");
const { verifyMemberSavings } = require("../util/payments");
const { loan_details } = require("../util/loans");
const { postGl, deleteGl, updateGl } = require("../util/financialAccounts");
const { filtered_loan_payments } = require("../util/loans");
const { queryPromise } = require("../util/general");
const { memberSavingsPayments } = require("../util/payments");

const add_savings_payments_index_get = (req, res) => {
  sequelize
    .query(
      "SELECT *,c.id AS category_id,c.category_name FROM  savings_payments s,members m,savings_categories c WHERE s.memberId=m.id AND s.categoryId=c.id ORDER BY m.id, s.date DESC"
    )
    .then((payments) => {
      // console.log(payments);
      return res.status(200).json({ message: "success", data: payments });
    })
    .catch((err) => {
      return res.status(400).json({
        message: "error",
        description: "Error Retrieving Payments",
        data: err,
      });
    });
};
const savings_payments_join_all_get = (req, res) => {
  sequelize
    .query(
      `SELECT v.id AS savings_id,s.*,c.id AS category_id,c.category_name,m.registration_number,m.first_name,m.last_name,m.middle_name,m.id AS member_id FROM
       member_savings v 
       LEFT JOIN savings_payments s ON v.id=s.memberSavingsId 
       LEFT JOIN members m ON v.memberId=m.id
      LEFT JOIN savings_categories c ON v.categoryId=c.id  ORDER BY m.id, s.date DESC`
    )
    .then((payments) => {
      // console.log(payments);
      return res.status(200).json({ message: "success", data: payments });
    })
    .catch((err) => {
      return res.status(400).json({
        message: "error",
        description: "Error Retrieving Payments",
        data: err,
      });
    });
};

const add_savings_payments_index_get_by_member_id = (req, res) => {
  const memberId = req.params.id;

  dbs.SavingsPayments.findAll(
    { where: { memberId: memberId } },
    { order: [["categoryId", "ASC"]] }
  )
    .then((payments) => {
      return res.status(200).json({ message: "success", data: payments });
    })
    .catch((err) => {
      return res.status(400).json({
        message: "error",
        description: "Error Retrieving Payments",
        data: err,
      });
    });

  // let sql = "SELECT * FROM savings_payments WHERE memberId=?";
  // sequelize.query(sql,{
  //   replacements: [memberId],
  //   type:Sequelize.QueryTypes.SELECT
  // })
  //   .then((payments) => {
  //     return res.status(200).json({ message: "success", data: payments });
  //   })
  //   .catch((err) => {
  //     return res.status(400).json({
  //       message: "error",
  //       description: "Error Retrieving Payments",
  //       data: err,
  //     });
  //   });
};
const savings_payments_get_by_member_id_member_savings_id = (req, res) => {
  const memberId = req.params.mid;
  const savingsCategoryId = req.params.sid;
  dbs.SavingsPayments.findAll({
    where: { memberId: memberId, memberSavingsId: savingsCategoryId },
  })
    .then((payments) => {
      return res.status(200).json({ message: "success", data: payments });
    })
    .catch((err) => {
      return res.status(400).json({
        message: "error",
        description: "Error Retrieving Payments",
        data: err,
      });
    });
};

const member_savings_payments_get = async (req, res) => {
  const memberId = req.params.mid;
  try {
    const savingPayments = await memberSavingsPayments(memberId);

    return res.status(200).json({ message: "success", data: savingPayments });
  } catch (err) {
    return res.status(400).json({
      message: "error",
      description: "Error Retrieving Payments",
      data: err,
    });
  }
};

const share_capital_payments_get_by_member_id = async (req, res) => {
  const memberId = req.params.mid;
  try {
    //get all share capital payments for selected member
    const shareCapitalListQuery =
      "SELECT * FROM member_share_capital_payments WHERE memberId=? ORDER BY date";
    const shareCapitalListParams = [memberId];
    const shareCapitalList = await queryPromise(
      shareCapitalListQuery,
      shareCapitalListParams
    );

    return res.status(200).json({ message: "success", data: shareCapitalList });
  } catch (err) {
    return res.status(400).json({
      message: "error",
      description: "Error Retrieving Payments",
      data: err,
    });
  }
};

const add_savings_payments_index_get_by_member_id_and_savings_category = (
  req,
  res
) => {
  const memberId = req.params.mid;
  const savingsCategoryId = req.params.cid;
  dbs.SavingsPayments.findAll({
    where: { memberId: memberId, categoryId: savingsCategoryId },
  })
    .then((payments) => {
      return res.status(200).json({ message: "success", data: payments });
    })
    .catch((err) => {
      return res.status(400).json({
        message: "error",
        description: "Error Retrieving Payments",
        data: err,
      });
    });
};
const add_savings_payments_create_post = (req, res) => {
  const pDetails = req.body;
  //  console.log(pDetails);
  // return res.status(200).json({
  //   message: "success",
  //   description: "Member Savings Added Successfully",

  // });

  const categoryId = parseInt(pDetails.categoryId);
  var memberId = pDetails.memberId;
  const date = pDetails.date;
  const method = pDetails.method;
  var reference_number = pDetails.referenceNumber;
  const amount = pDetails.amount;
  const description = pDetails.description;
  var paymentId;
  var amountP = parseFloat(pDetails.amount);
  var paymentD = pDetails.date;

  dbs.MemberSavings.findOne({
    where: { memberId: memberId, id: categoryId, status: "ACTIVE" },
  })
    .then(async (member_saving) => {
      if (member_saving) {
        try {
          const ps = await dbs.SavingsPayments.create({
            memberSavingsId: pDetails.categoryId,
            memberId: pDetails.memberId,
            date: pDetails.date,
            method: pDetails.method,
            reference_number: pDetails.referenceNumber,
            amount: pDetails.amount,
            description: pDetails.description,
          });
          paymentId = ps.id;

          //post member savings equity as credit and debit cash gl
          let gl_account_id_to_credit = 86; //owners equity account increase
          let gl_account_id_to_debit = 12; //collection cash account
          let gl_description = `Members savings Contribution: Ref #:${reference_number} Member Id${memberId} : Date:${paymentD}`;
          let transaction_origin = `Member Savings`;
          let transaction_origin_ref_no = paymentId;
          let payment_date = paymentD;

          const glPostLoanPost = await postGl(
            gl_account_id_to_debit,
            gl_account_id_to_credit,
            gl_description,
            transaction_origin,
            transaction_origin_ref_no,
            payment_date,
            amountP
          );

          return res.status(200).json({
            message: "success",
            description: "Payment Added Successfully",
            data: ps,
          });
        } catch (err) {
          return res.status(400).json({
            message: "error",
            description: "Error fetching Member Saving for this category",
            data: err,
          });
        }
      } else {
        return res.status(400).json({
          message: "error",
          description: "Member Saving does not exist for this category",
          data: "Member Saving does not exist",
        });
      }
    })

    .catch((err) => {
      res.status(400).json({
        message: "error",
        description: "Error Adding Payment",
        data: err,
      });
    });
};

const add_savings_create_post = (req, res) => {
  const pDetails = req.body;
  let memberId = pDetails.memberId;
  let categoryId = pDetails.categoryId;
  let amount = pDetails.amount;
  let frequency = pDetails.frequency;
  let amortizationMode = pDetails.amortizationMode;
  let tenurePeriod = pDetails.tenurePeriod;
  let startDate = pDetails.startDate;

  console.log(pDetails);
  if (tenurePeriod == "" || tenurePeriod < 1) {
    tenurePeriod = 0;
  }
  // return res.status(200).json({
  //   message: "success",
  //   description: "Member Savings Added Successfully",
  //   data:[{memberId,categoryId,amount,frequency,amortizationMode,tenurePeriod,startDate}]
  // });
  let query =
    "INSERT INTO member_savings(memberId,categoryId,amount,frequency,frequency_type,frequency_number,start_date) VALUES(?,?,?,?,?,?,?)";
  sequelize
    .query(query, {
      replacements: [
        memberId,
        categoryId,
        amount,
        frequency,
        amortizationMode,
        tenurePeriod,
        startDate,
      ],
      type: Sequelize.QueryTypes.INSERT,
    })

    .then((response) => {
      return res.status(200).json({
        message: "Member Savings Added Successfully",
        description: "success",
        data: response,
      });
    })
    .catch((err) => {
      return res.status(400).json({
        message: err,
        description: "Error Adding Payment",
        data: err,
      });
    });
};

const add_savings_payments_multiple_create_post = async (req, res) => {
  const pDetails = req.body;
  const date = pDetails.date;
  const method = pDetails.method;
  const reference_number = pDetails.referenceNumber;
  const memberDetails = pDetails.memberDetails;
  const description = pDetails.description;

  var paymentD = pDetails.date;

  //   console.log(pDetails);
  //  return res.json({ message: "iko fiti" });

  for (let i = 0; i < memberDetails.length; i++) {
    var memberId = memberDetails[i].member_id;
    let amount = memberDetails[i].monthly_contribution;
    const memberSavingsId = memberDetails[i].member_savings_id;
    const categoryId = memberDetails[i].category_id;
    if (amount === 0) {
      continue;
    } else {
      var amountP = parseFloat(memberDetails[i].monthly_contribution);
      var paymentId;

      const paymentAdd = await dbs.SavingsPayments.create({
        memberSavingsId: memberSavingsId,
        categoryId: categoryId,
        memberId: memberId,
        date: date,
        method: method,
        reference_number: reference_number,
        amount: amount,
        description: description,
      });

      paymentId = paymentAdd.id;

      //post member savings equity as credit and debit cash gl
      let gl_account_id_to_credit = 86; //owners equity account increase
      let gl_account_id_to_debit = 12; //collection cash account
      let gl_description = `Members savings Contribution: Ref #:${reference_number} Member Id${memberId} : Date:${paymentD}`;
      let transaction_origin = `Member Savings`;
      let transaction_origin_ref_no = paymentId;
      let payment_date = paymentD;

      const glPostLoanPost = await postGl(
        gl_account_id_to_debit,
        gl_account_id_to_credit,
        gl_description,
        transaction_origin,
        transaction_origin_ref_no,
        payment_date,
        amountP
      );
    }
  }

  return res.status(200).json({
    message: "success",
    description: "Payment  Made Successfully",
  });

  //   .catch((err) => {
  //     return res.status(400).json({
  //       message: "error",
  //       description: "Error Adding Payment",
  //       data: err,
  //     });
  //   });
};

const add_savings_payments_update_put = (req, res) => {
  const paymentId = req.params.id;
  const pDetails = req.body;
  dbs.SavingsPayments.update(
    {
      memberId: pDetails.memberId,
      date: pDetails.date,
      method: pDetails.method,
      reference_number: pDetails.reference_number,
      amount: pDetails.amount,
      description: pDetails.description,
    },
    {
      where: { id: paymentId },
    }
  )
    .then((response) => {
      return res.status(200).json({
        message: "success",
        description: "Payment Updated Successfully",
      });
    })
    .catch((err) => {
      return res.status(400).json({
        message: "error",
        description: "Error Updating Payment",
        data: err,
      });
    });
};

const add_savings_payments_details_get = (req, res) => {
  const paymentId = req.params.id;

  dbs.SavingsPayments.findOne({ where: { id: paymentId } })
    .then((response) => {
      return res.status(200).json({ message: "success", data: response });
    })
    .catch((err) => {
      return res.status(400).json({ message: "error", data: err });
    });
};

const add_savings_payments_delete = async (req, res) => {
  const paymentId = req.params.id;
  try {
    const deletePayment = await dbs.SavingsPayments.destroy({
      where: { id: paymentId },
    });

    //console.log(`payment id: ${payment_id}`)
    const transaction_type_from = "Member Savings";
    const gl_query = `SELECT * FROM general_ledger WHERE transaction_type_from = ? AND transaction_type_no= ?`;
    const get_ledger_id = await sequelize.query(gl_query, {
      replacements: [transaction_type_from, paymentId],
      type: Sequelize.QueryTypes.SELECT,
    });

    let ledger_id = get_ledger_id[0].entry_id;
    const gl_delete = await deleteGl(ledger_id);

    console.log(gl_delete);

    return res.status(200).json({
      message: "success",
      description: "Payment Deleted Successfully",
      data: response,
    });
  } catch (error) {
    return res.status(400).json({
      message: "error",
      description: "Error Deleting Payment",
      data: error,
    });
  }
};

const add_savings_payments_delete_multiple = async (req, res) => {
  const paymentIdArr = req.params.id;
  let idsArray = paymentIdArr.split(",");
  // console.log(idsArray);
  // return res.status(200).json({ message: "success", description: "Payments Deleted Successfully" });
  try {
    for (let i = 0; i < idsArray.length; i++) {
      let currentPaymentId = parseInt(idsArray[i]);
      const deletePayment = await dbs.SavingsPayments.destroy({
        where: { id: currentPaymentId },
      });
    }
    return res.status(200).json({
      message: "success",
      description: "Payment Deleted Successfully",
      data: deletePayment,
    });
  } catch (err) {
    return res.status(400).json({
      message: "error",
      description: "Error Deleting Payment",
      data: err,
    });
  }
};

const add_loan_payments_index_get = (req, res) => {
  dbs.LoanPayments.findAll()
    .then((payments) => {
      return res.status(200).json({ message: "success", data: payments });
    })
    .catch((err) => {
      return res.status(400).json({
        message: "error",
        description: "Error Retrieving Payments",
        data: err,
      });
    });
};

const add_loan_payments_index_get_by_loan_id = (req, res) => {
  const loanId = req.params.id;
  dbs.LoanPayments.findAll({ where: { loanId: loanId } })
    .then((payments) => {
      return res.status(200).json({ message: "success", data: payments });
    })
    .catch((err) => {
      return res.status(400).json({
        message: "error",
        description: "Error Retrieving Payments",
        data: err,
      });
    });
};

const add_loan_payments_create_post = (req, res) => {
  var tt_amount_payable = 0;
  var tt_amount_paid = 0;
  var loan_balance = 0;
  var paymentId;

  const pDetails = req.body;
  var loanId = pDetails.loanId;
  let amountP = parseFloat(pDetails.amount);
  let paymentD = pDetails.date;

  dbs.LoanPayments.create({
    loanId: pDetails.loanId,
    date: pDetails.date,
    method: pDetails.method,
    reference_number: pDetails.referenceNumber,
    amount: pDetails.amount,
    description: pDetails.description,
  })
    .then(async (response) => {
      paymentId = response.id;
      let paymentDate = new Date(pDetails.date);
      let paymentMonth = paymentDate.getMonth() + 1;
      let paymentYear = paymentDate.getFullYear();

      //get loan details to determine the percentage going to interest and loan repayments

      const loanDetails = await loan_details(loanId);
      if (loanDetails) {
        let interest_amount = parseFloat(loanDetails.interest_amount);
        let loan_amount = parseFloat(loanDetails.loan_amount);
        let total_payable = parseFloat(loanDetails.total_payable);
        let application_date = loanDetails.application_date;
        let memberId = loanDetails.memberId;

        let percentage_paid =
          (parseFloat(amountP) / parseFloat(total_payable)) * 100;
        let loan_interest_installment_paid =
          (percentage_paid / 100) * interest_amount;
        let loan_repayment_installment_paid =
          (percentage_paid / 100) * loan_amount;

        //post loan receivable credit gl and debit cash gl
        let gl_account_id_to_credit_loan = 18; //account receivable increase
        let gl_account_id_to_debit_loan = 12; //collection cash account
        let gl_description = `Loan Payment: Ref #:${paymentD} Loan Id${loanId} loan tt:${total_payable} Application Date:${application_date} member Id:${memberId}`;
        let transaction_origin = `Loan Payments`;
        let transaction_origin_ref_no = paymentId;
        let payment_date = paymentD;

        const glPostLoanPost = await postGl(
          gl_account_id_to_debit_loan,
          gl_account_id_to_credit_loan,
          gl_description,
          transaction_origin,
          transaction_origin_ref_no,
          payment_date,
          loan_repayment_installment_paid
        );

        //post interest receivable credit and debit revenue gl
        let gl_account_id_to_credit_interest = 17; //increase in interest receivable account (credit current asset account)
        let gl_account_id_to_debit_interest = 83; //increase in revenue/income account (debit decrease in revenue account)

        const glPostLoanInterestPost = await postGl(
          gl_account_id_to_debit_interest,
          gl_account_id_to_credit_interest,
          gl_description,
          transaction_origin,
          transaction_origin_ref_no,
          payment_date,
          loan_interest_installment_paid
        );
      } else {
        throw new Error("Error fetching loan");
      }

      return sequelize.query(
        "SELECT * FROM loan_schedules WHERE MONTH(installment_date) = ? AND YEAR(installment_date)=? AND loanId=?",
        {
          replacements: [paymentMonth, paymentYear, loanId],
          type: Sequelize.QueryTypes.SELECT,
        }
      );
    })
    .then(async (pSchedule) => {
      var scheduleId = 0;

      if (pSchedule.length === 0) {
        const getScheduleId = await sequelize.query(
          "SELECT MAX(id) AS schedule_id FROM loan_schedules WHERE loanId=?",
          {
            replacements: [loanId],
            type: Sequelize.QueryTypes.SELECT,
          }
        );
        scheduleId = getScheduleId[0].schedule_id;
      } else {
        scheduleId = pSchedule[0].id;
      }

      return dbs.LoanSchedule.increment(
        {
          total_amount_paid: +pDetails.amount,
          balance_amount: -pDetails.amount,
        },
        { where: { id: scheduleId } }
      );
    })
    .then((updateSuccess) => {
      return dbs.Loan.findOne({ where: { id: loanId } });
    })
    .then((loanD) => {
      tt_amount_payable =
        parseFloat(loanD.total_disbursed) + parseFloat(loanD.interest_amount);

      return sequelize.query(
        "SELECT SUM(total_amount_paid) AS tt_paid FROM loan_schedules WHERE loanId=?",
        {
          replacements: [loanId],
          type: Sequelize.QueryTypes.SELECT,
        }
      );
    })
    .then(async (resLoan) => {
      //get tt amount paid in loan schedules
      tt_amount_paid = resLoan[0].tt_paid;

      loan_balance = parseInt(tt_amount_payable) - parseInt(tt_amount_paid);

      if (loan_balance <= 10) {
        const updateL = await dbs.Loan.update(
          { loan_status: "CLEARED" },
          { where: { id: loanId } }
        );
      }

      return res.status(200).json({
        message: "success",
        description: "Payment Added Successfully",
      });
    })
    .catch((err) => {
      return res.status(400).json({
        message: "error",
        description: "Error Adding Payment",
        data: err,
      });
    });
};

const add_loan_payments_multiple_create_post = async (req, res) => {
  var tt_amount_payable = 0;
  var tt_amount_paid = 0;
  var loan_balance = 0;

  const pDetails = req.body;

  const loanDetails = pDetails.loanDetails;
  //  loanId: pDetails.loanId,
  const date = pDetails.date;
  const method = pDetails.method;
  const reference_number = pDetails.referenceNumber;
  // const amount: pDetails.amount;
  const description = pDetails.description;
  //console.log(`loanId: ${loanDetails[0].monthly_installment}`);
  // return;
  for (let i = 0; i < loanDetails.length; i++) {
    if (loanDetails[i].monthly_contribution === 0) {
      continue;
    }
    var paymentId;
    let amountP = loanDetails[i].monthly_installment;
    let paymentD = pDetails.date;

    dbs.LoanPayments.create({
      // loanId: pDetails.loanId,
      loanId: loanDetails[i].loan_id,
      date: date,
      method: method,
      reference_number: reference_number,
      amount: loanDetails[i].monthly_installment,
      description: description,
    })
      .then(async (response) => {
        paymentId = response.id;
        let paymentDate = new Date(pDetails.date);
        let paymentMonth = paymentDate.getMonth() + 1;
        let paymentYear = paymentDate.getFullYear();

        //get loan details to determine the percentage going to interest and loan repayments

        const loanDetails = await loan_details(loanId);
        if (loanDetails) {
          let interest_amount = loanDetails.interest_amount;
          let loan_amount = loanDetails.loan_amount;
          let total_payable = loanDetails.total_payable;
          let application_date = loanDetails.application_date;
          let memberId = loanDetails.memberId;

          let percentage_paid =
            (parseFloat(amountP) / parseFloat(total_payable)) * 100;
          let loan_interest_installment_paid =
            (percentage_paid / 100) * interest_amount;
          let loan_repayment_installment_paid =
            (percentage_paid / 100) * loan_amount;

          //post loan receivable credit gl and debit cash gl
          let gl_account_id_to_credit_loan = 18; //account receivable increase
          let gl_account_id_to_debit_loan = 12; //collection cash account
          let gl_description = `Loan Payment: Ref #:${reference_number} Loan Id${loanId} loan tt:${total_payable} Application Date:${application_date} member Id:${memberId}`;
          let transaction_origin = `Loan Payments`;
          let transaction_origin_ref_no = paymentId;
          let payment_date = paymentD;

          const glPostLoanPost = await postGl(
            gl_account_id_to_debit_loan,
            gl_account_id_to_credit_loan,
            gl_description,
            transaction_origin,
            transaction_origin_ref_no,
            payment_date,
            loan_repayment_installment_paid
          );

          //post interest receivable credit and debit revenue gl
          let gl_account_id_to_credit_interest = 17; //increase in interest receivable account (credit current asset account)
          let gl_account_id_to_debit_interest = 83; //increase in revenue/income account (debit decrease in revenue account)

          const glPostLoanInterestPost = await postGl(
            gl_account_id_to_debit_interest,
            gl_account_id_to_credit_interest,
            gl_description,
            transaction_origin,
            transaction_origin_ref_no,
            payment_date,
            loan_interest_installment_paid
          );
        } else {
          throw new Error("Error fetching loan");
        }

        return sequelize.query(
          "SELECT * FROM loan_schedules WHERE MONTH(installment_date) = ? AND YEAR(installment_date)=? AND loanId=?",
          {
            replacements: [paymentMonth, paymentYear, loanDetails[i].loan_id],
            type: Sequelize.QueryTypes.SELECT,
          }
        );
      })
      .then(async (pSchedule) => {
        var scheduleId = 0;

        if (pSchedule.length === 0) {
          const getScheduleId = await sequelize.query(
            "SELECT MAX(id) AS schedule_id FROM loan_schedules WHERE loanId=?",
            {
              replacements: [loanDetails[i].loan_id],
              type: Sequelize.QueryTypes.SELECT,
            }
          );
          scheduleId = getScheduleId[0].schedule_id;
        } else {
          scheduleId = pSchedule[0].id;
        }
        // const scheduleId = pSchedule[0].id;
        //  console.log(`schedule id: ${scheduleId}`);

        return dbs.LoanSchedule.increment(
          {
            total_amount_paid: +loanDetails[i].monthly_installment,
            balance_amount: -loanDetails[i].monthly_installment,
          },
          { where: { id: scheduleId } }
        );
      })
      .then((updateSuccess) => {
        return dbs.Loan.findOne({ where: { id: loanDetails[i].loan_id } });
      })
      .then((loanD) => {
        tt_amount_payable =
          parseFloat(loanD.total_disbursed) + parseFloat(loanD.interest_amount);

        return sequelize.query(
          "SELECT SUM(total_amount_paid) AS tt_paid FROM loan_schedules WHERE loanId=?",
          {
            replacements: [loanDetails[i].loan_id],
            type: Sequelize.QueryTypes.SELECT,
          }
        );
      })
      .then(async (resLoan) => {
        //get tt amount paid in loan schedules
        tt_amount_paid = resLoan[0].tt_paid;

        loan_balance = parseInt(tt_amount_payable) - parseInt(tt_amount_paid);

        if (loan_balance <= 10) {
          const updateL = await dbs.Loan.update(
            { loan_status: "CLEARED" },
            { where: { id: loanDetails[i].loan_id } }
          );
        }
      });
    //  .then((updateSuccess) => {
    //    return res.status(200).json({
    //      message: "success",
    //      description: "Payment Added Successfully",
    //    });
    //  })
    //  .catch((err) => {
    //    return res.status(400).json({
    //      message: "error",
    //      description: "Error Adding Payment",
    //      data: err,
    //    });
    //  });
  }

  return res.status(200).json({
    message: "success",
    description: "Payment Added Successfully",
  });
};

const add_loan_payments_update_put = (req, res) => {
  const paymentId = req.params.id;

  const pDetails = req.body;
  const loanId = pDetails.loan_id;
  const payment_amount = pDetails.amount;
  // const paymentDate = new Date(pDetails.date);
  // const paymentMonth = getMonth(paymentDate) + 1;
  // const paymentYear = getFullYear(paymentDate);
  let paymentDate = new Date(pDetails.date);
  let paymentMonth = paymentDate.getMonth() + 1;
  let paymentYear = paymentDate.getFullYear();

  // console.log(`payment date: ${paymentDate} Month:${paymentMonth} Year:${paymentYear}`)
  // return res.status(200).json({message:"sucess"})
  const query =
    "UPDATE loan_schedules SET total_amount_paid=total_amount_paid - ?,balance_amount=balance_amount + ? WHERE MONTH(installment_date) = ? AND YEAR(installment_date) = ? AND loanId=?";
  sequelize
    .query(query, {
      replacements: [
        payment_amount,
        payment_amount,
        paymentMonth,
        paymentYear,
        loanId,
      ],
    })
    .then((loan) => {
      return dbs.LoanPayments.update(
        {
          date: pDetails.date,
          method: pDetails.method,
          reference_number: pDetails.reference_number,
          amount: pDetails.amount,
          description: pDetails.description,
        },
        {
          where: { id: paymentId },
        }
      );
    })

    .then((response) => {
      return res.status(200).json({
        message: "success",
        description: "Payment Updated Successfully",
      });
    })
    .catch((err) => {
      return res.status(400).json({
        message: "error",
        description: "Error Updating Payment",
        data: err,
      });
    });
};

const add_loan_payments_details_get = (req, res) => {
  const paymentId = req.params.id;

  dbs.LoanPayments.findOne({ where: { id: paymentId } })
    .then((response) => {
      return res.status(200).json({ message: "success", data: response });
    })
    .catch((err) => {
      return res.status(400).json({ message: "error", data: err });
    });
};

const add_loan_payments_delete_post = async (req, res) => {
  const payment_details = req.body;
  const payment_id = payment_details.id;
  const payment_amount = parseFloat(payment_details.amount);
  const loan_id = parseInt(payment_details.loanId);
  const payment_date = new Date(payment_details.date);

  let paymentMonth = payment_date.getMonth() + 1;
  let paymentYear = payment_date.getFullYear();

  try {
    //update loan schedule
    const query =
      "UPDATE loan_schedules SET total_amount_paid=total_amount_paid - ?,balance_amount=balance_amount + ? WHERE MONTH(installment_date) = ? AND YEAR(installment_date) = ? AND loanId=?";
    const update_schedule = await sequelize.query(query, {
      replacements: [
        payment_amount,
        payment_amount,
        paymentMonth,
        paymentYear,
        loan_id,
      ],
    });

    //delete payment entry
    const deletePay = await dbs.LoanPayments.destroy({
      where: { id: payment_id },
    });

    //console.log(`payment id: ${payment_id}`)
    const transaction_type_from = "Loan Payments";
    const gl_query = `SELECT * FROM general_ledger WHERE transaction_type_from = ? AND transaction_type_no= ?`;
    const get_ledger_id = await sequelize.query(gl_query, {
      replacements: [transaction_type_from, payment_id],
      type: Sequelize.QueryTypes.SELECT,
    });

    let ledger_id = get_ledger_id[0].entry_id;
    const gl_delete = await deleteGl(ledger_id);

    //console.log(gl_delete);

    //delete interest ledger entry
    const gl_query_interest = `SELECT * FROM general_ledger WHERE transaction_type_from = ? AND transaction_type_no= ?`;
    const get_ledger_id_interest = await sequelize.query(gl_query_interest, {
      replacements: [transaction_type_from, payment_id],
      type: Sequelize.QueryTypes.SELECT,
    });

    let ledger_id_interest = get_ledger_id_interest[0].entry_id;
    const gl_delete_interest = await deleteGl(ledger_id_interest);

    console.log(`ledger id interest:${ledger_id_interest}`);

    return res.status(200).json({
      message: "success",
      description: "Payment Deleted Successfully",
      data: deletePay,
    });
  } catch (error) {
    return res.status(400).json({
      message: "error",
      description: "Error Deleting Payment",
      data: error,
    });
  }

  // const query =
  //   "UPDATE loan_schedules SET total_amount_paid=total_amount_paid - ?,balance_amount=balance_amount + ? WHERE MONTH(installment_date) = ? AND YEAR(installment_date) = ? AND loanId=?";
  // sequelize
  //   .query(query, {
  //     replacements: [
  //       payment_amount,
  //       payment_amount,
  //       paymentMonth,
  //       paymentYear,
  //       loan_id,
  //     ],
  //   })
  //   .then((loan) => {
  //     return dbs.LoanPayments.destroy({ where: { id: payment_id } }).then(
  //       (response) => {
  //         return res.status(200).json({
  //           message: "success",
  //           description: "Payment Deleted Successfully",
  //           data: response,
  //         });
  //       }
  //     );
  //   })

  //   .catch((err) => {
  //     return res.status(400).json({
  //       message: "error",
  //       description: "Error Deleting Payment",
  //       data: err,
  //     });
  //   });
};

const add_loan_payments_delete = (req, res) => {
  const payment_details = req.body;
  const payment_id = payment_details.id;
  const payment_amount = payment_details.amount;
  const loan_id = payment_details.loanId;
  const payment_date = payment_details.date;

  let paymentMonth = payment_date.getMonth() + 1;
  let paymentYear = payment_date.getFullYear();

  const query =
    "UPDATE loan_schedules SET total_amount_paid=total_amount_paid - ?,balance_amount=balance_amount + ? WHERE MONTH(installment_date) = ? AND YEAR(installment_date) = ?";
  sequelize
    .query(query, {
      replacements: [payment_amount, payment_amount, paymentMonth, paymentYear],
    })
    .then((loan) => {
      return dbs.LoanPayments.destroy({ where: { id: payment_id } }).then(
        (response) => {
          return res.status(200).json({
            message: "success",
            description: "Payment Deleted Successfully",
            data: response,
          });
        }
      );
    })

    .catch((err) => {
      return res.status(400).json({
        message: "error",
        description: "Error Deleting Payment",
        data: err,
      });
    });
};

const loan_payments_by_date_post = async (req, res) => {
  console.log(req.body);
  const { start_date, end_date } = req.body;
  try {
    const payments = await filtered_loan_payments(start_date, end_date);
    console.log(payments);
    return res.status(200).json({ message: "success", data: payments });
  } catch (error) {
    return res.status(200).json({ message: "error", data: error.message });
  }
};

module.exports = {
  add_savings_payments_index_get,
  savings_payments_join_all_get,
  member_savings_payments_get,
  share_capital_payments_get_by_member_id,
  add_savings_payments_index_get_by_member_id,
  add_savings_payments_index_get_by_member_id_and_savings_category,
  savings_payments_get_by_member_id_member_savings_id,
  add_savings_payments_create_post,
  add_savings_payments_update_put,
  add_savings_payments_details_get,
  add_savings_payments_delete,
  add_savings_payments_delete_multiple,
  add_loan_payments_index_get,
  add_loan_payments_create_post,
  add_loan_payments_update_put,
  add_loan_payments_details_get,
  add_loan_payments_delete,
  add_loan_payments_index_get_by_loan_id,
  add_savings_payments_multiple_create_post,
  add_loan_payments_multiple_create_post,
  add_loan_payments_delete_post,
  add_savings_create_post,
  loan_payments_by_date_post,
};
