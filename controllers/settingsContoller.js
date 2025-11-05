const conn = require("../util/database2");

const Sequelize = require("sequelize");
const dbs = require("../models/");
const sequelize = require("../util/database");
const {
  loan_details,
  all_loans,
  all_disbursed_loans,
  all_loan_payments,
  all_savings_payments,
} = require("../util/loans");
const {
  postGl,
  postGlSetUp,
  GeneralLedgerTransactions,
} = require("../util/financialAccounts");
const { queryPromise, compareDates } = require("../util/general");

const schedules_get = async (req, res) => {
  //this api call gets all loans and update the ones with no shedule set
  const all_loans = await new Promise((resolve, reject) => {
    const sql = `SELECT * FROM loans WHERE loan_status='ACTIVE'`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  const loans = all_loans;
  const loans_without_schedule = [];

  for (let i = 0; i < loans.length; i++) {
    let currentLoanId = loans[i].id;
    let loan_id = loans[i].id;
    let loanId = loans[i].id;

    const loan_amount = loans[i].loan_amount;
    const application_date = loans[i].application_date;
    const tenure_period = loans[i].tenure_period;
    const amortization_mode = loans[i].amortization_mode;
    const interest_amount = loans[i].interest_amount;
    const total_disbursed = loans[i].total_disbursed;
    const total_payable = loans[i].total_payable;
    const monthly_installment = loans[i].monthly_installment;
    const loan_refinance = loans[i].loan_refinance;
    const memberId = loans[i].memberId;

    const schedule_check = await new Promise((resolve, reject) => {
      const sql = `SELECT * FROM loan_schedules WHERE loanId='${currentLoanId}' `;
      conn.query(sql, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    if (schedule_check.length > 0) {
      continue;
    }

    // loans_without_schedule.push(loans[i]);
    // console.log(loans[i]);

    //get disbursement date
    const get_disbursement = await new Promise((resolve, reject) => {
      const sql = `SELECT * FROM loan_disbursements WHERE loanId='${currentLoanId}'`;
      conn.query(sql, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    let disbursement_date = get_disbursement[0].date;
    console.log(disbursement_date);
    let installment_number = 1;
    let currentDate = new Date(disbursement_date);
    let currentDateDay = currentDate.getDate();

    if (currentDateDay > 15) {
      currentDate.setDate(currentDate.getDate() + 30);
    }

    currentDate.setDate(5);

    let starting_principal_balance = loan_amount;
    let principal_installment =
      parseFloat(loan_amount) / parseInt(tenure_period);
    principal_installment = parseFloat(principal_installment.toFixed(2));
    let interest_installment =
      parseFloat(interest_amount) / parseInt(tenure_period);
    interest_installment = parseFloat(interest_installment.toFixed(2));
    let current_starting_principal_balance = 0;
    let current_ending_principal_balance = 0;

    // console.log(`Before loop loan Id:${loan_id} member id: ${memberId}`);

    for (let i = 0; i < tenure_period; i++) {
      // console.log(`in loop current date:${currentDate}`);
      if (installment_number === 1) {
        current_starting_principal_balance = starting_principal_balance;
      }
      let installmentAdd = await dbs.LoanSchedule.create({
        installment_date: currentDate,
        installment_number: installment_number,
        starting_principal_balance: current_starting_principal_balance,
        principal_installment: principal_installment,
        interest_installment: interest_installment,
        monthly_installment: principal_installment + interest_installment,
        ending_principal_balance: parseFloat(
          (current_starting_principal_balance - principal_installment).toFixed(
            2
          )
        ),
        total_amount_paid: 0,
        balance_amount: current_starting_principal_balance,
        loanId: loan_id,
      });

      installment_number += 1;
      currentDate.setDate(currentDate.getDate() + 30);
      currentDate.setDate(5);
      current_starting_principal_balance =
        current_starting_principal_balance - principal_installment;
      current_starting_principal_balance = parseFloat(
        current_starting_principal_balance.toFixed(2)
      );
    }

    //payments check

    const get_payments = await new Promise((resolve, reject) => {
      const sql = `SELECT * FROM loan_payments WHERE loanId='${loan_id}'`;
      conn.query(sql, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    if (get_payments.length > 0) {
      for (let k = 0; k < get_payments.length; k++) {
        let tt_amount_payable = 0;
        let tt_amount_paid = 0;
        let loan_balance = 0;

        let date = get_payments[k].date;
        let method = get_payments[k].method;
        let reference_number = get_payments[k].referenceNumber;
        let amount = parseFloat(get_payments[k].amount);
        let description = get_payments[k].description;

        let paymentDate = new Date(date);
        let paymentMonth = paymentDate.getMonth() + 1;
        let paymentYear = paymentDate.getFullYear();

        var scheduleId = 0;
        const pSchedule = await sequelize.query(
          "SELECT * FROM loan_schedules WHERE MONTH(installment_date) = ? AND YEAR(installment_date)=? AND loanId=?",
          {
            replacements: [paymentMonth, paymentYear, loan_id],
            type: Sequelize.QueryTypes.SELECT,
          }
        );

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

        const updateSuccess = await dbs.LoanSchedule.increment(
          {
            total_amount_paid: +amount,
            balance_amount: -amount,
          },
          { where: { id: scheduleId } }
        );

        const loanD = await dbs.Loan.findOne({ where: { id: loan_id } });

        tt_amount_payable =
          parseFloat(loanD.total_disbursed) + parseFloat(loanD.interest_amount);

        const resLoan = await sequelize.query(
          "SELECT SUM(total_amount_paid) AS tt_paid FROM loan_schedules WHERE loanId=?",
          {
            replacements: [loan_id],
            type: Sequelize.QueryTypes.SELECT,
          }
        );

        tt_amount_paid = resLoan[0].tt_paid;

        loan_balance = parseInt(tt_amount_payable) - parseInt(tt_amount_paid);

        if (loan_balance <= 10) {
          const updateL = await dbs.Loan.update(
            { loan_status: "CLEARED" },
            { where: { id: loan_id } }
          );
        }
      }
    }
  }

  res.status(200).json({ message: "success", loans: loans_without_schedule });
};

const loan_payments_get = async (req, res) => {};

const loan_gl_get = async (req, res) => {
  let loans;
  try {
    loans = await all_disbursed_loans().filter((loan) => {
      return loan.id == 1;
    });
    //res.status(200).json({ message: "success", data: loans });
  } catch (error) {
    res.status(200).json({ message: "error", data: error.message });
  }

  for (let i = 0; i < loans.length; i++) {
    const loan_id = loans[i].loanId;
    const disbursement_date = loans[i].date;
    const disbursementId = loans[i].id;
    const reference_number = loans[i].reference_number;
    const disbursement_amount = loans[i].amount;
    let interest_amount_loan;
    const transaction_charges_start_date = "2023-9-01";
    let include_loan_transaction_charges = 0;
    let transaction_charges_amount = 0;

    const loanDetails = await loan_details(loan_id);
    if (loanDetails) {
      interest_amount_loan = loanDetails.interest_amount;
      var memberId = loanDetails.memberId;
    } else {
      continue;
      //   res.status(200).json({ message: "error", data: "Error retrieving loan" });
    }

    let gl_account_id_to_debit_loan = 18; //account receivable increase
    let gl_account_id_to_credit_loan = 12; //collection cash account
    let gl_account_id_to_credit_processing_charges_income = 88; //revenue account for processing charges

    const date_compare = compareDates(
      transaction_charges_start_date,
      disbursement_date
    );

    if (date_compare > 1) {
      include_loan_transaction_charges = 1;
      transaction_charges_amount = parseFloat(disbursement_amount) * 0.02;
    }

    let gl_description = `Loan Disbursement: Ref #:${reference_number} Loan Id${loan_id} loan Amount:${disbursement_amount} Application Date:${disbursement_date} member Id:${memberId}`;
    let transaction_origin = `Loan Disursement`;
    let transaction_origin_ref_no = disbursementId;
    let payment_date = disbursement_date;

    let loanDisbursedGl = new GeneralLedgerTransactions(
      gl_account_id_to_debit_loan,
      gl_account_id_to_credit_loan,
      gl_description,
      transaction_origin,
      transaction_origin_ref_no,
      payment_date,
      disbursement_amount
    );

    try {
      loanDisbursedGl.getDebitAccountBalance;
      loanDisbursedGl.getCreditAccountBalance;
      loanDisbursedGl.debitGlEntry;
      loanDisbursedGl.creditGlEntry;
      loanDisbursedGl.debitUpdateGlOppositeReference;
      loanDisbursedGl.creditUpdateGlOppositeReference;
      loanDisbursedGl.debitJournalEntry;
      loanDisbursedGl.creditJournalEntry;
      loanDisbursedGl.updateDebitGlAccountBalance;
      loanDisbursedGl.updateCreditGlAccountBalance;
    } catch (error) {
      res.status.json({
        message: "error",
        data: `Error adding gl details for loan Id: ${loan_id}`,
      });
    }

    const glPostLoanPost = await postGlSetUp(
      gl_account_id_to_debit_loan,
      gl_account_id_to_credit_loan,
      gl_account_id_to_credit_processing_charges_income,
      transaction_charges_amount,
      gl_description,
      transaction_origin,
      transaction_origin_ref_no,
      payment_date,
      disbursement_amount
    );

    //post interest receivable credit and debit revenue gl
    let gl_account_id_to_debit_interest = 17; //increase in interest receivable account (credit current asset account)
    let gl_account_id_to_credit_interest = 83; //increase in revenue/income account (debit decrease in revenue account)

    // const glPostLoanInterestPost = await postGl(
    //   gl_account_id_to_debit_interest,
    //   gl_account_id_to_credit_interest,
    //   gl_description,
    //   transaction_origin,
    //   transaction_origin_ref_no,
    //   payment_date,
    //   interest_amount_loan
    // );
  }

  res.status(200).json({ message: "success", data: "loans gl entries added" });
};

const loan_payments_gl_get = async (req, res) => {
  let loansPayments;
  try {
    loansPayments = await all_loan_payments();
    //res.status(200).json({ message: "success", data: loansPayments });
  } catch (error) {
    res.status(200).json({ message: "error", data: error.message });
  }

  for (let i = 0; i < loansPayments.length; i++) {
    let paymentId = loansPayments[i].id;
    var loanId = loansPayments[i].loanId;
    let amountP = loansPayments[i].amount;
    let paymentD = loansPayments[i].date;
    let reference_number = loansPayments[i].reference_number;

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
      let gl_account_id_to_credit_loan = 18; //account receivable decrease
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
      //   throw new Error("Error fetching loan");
      continue;
    }
  }

  res.status(200).json({
    message: "success",
    data: "loan payments gl entries added successfully",
  });
};

const savings_payments_gl_get = async (req, res) => {
  let savingsPayments;
  try {
    savingsPayments = await all_savings_payments();
    //    res.status(200).json({ message: "success", data: savingsPayments });
  } catch (error) {
    res.status(200).json({ message: "error", data: error.message });
  }

  for (let i = 0; i < savingsPayments.length; i++) {
    let memberId = savingsPayments[i].memberId;
    let reference_number = savingsPayments[i].referenceNumber;
    let paymentId = savingsPayments[i].id;
    let amountP = savingsPayments[i].amount;
    let paymentD = savingsPayments[i].date;

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

  res.status(200).json({
    message: "success",
    data: "saving payments gl entries added successfully",
  });
};

const deduct_membership_fee_get = async (req, res) => {
  //get all members
  const memberListQuery = "SELECT * FROM members ORDER BY id";
  const memberListParams = [];
  const memberList = await queryPromise(memberListQuery, memberListParams);

  // return res.status(200).json({ message: "success",members:memberList });

  for (let i = 0; i < memberList.length; i++) {
    let currentMemberId = memberList[i].id;

    let totalToDeduct = 6000;
    let targetMembershipFeeAmount = 1000;
    let targetShareCapitalAmount = 5000;

    // get savings payments made by date deduct the total needed then submit the balance as savings
    const paymentsQuery =
      "SELECT * FROM savings_payments WHERE memberId=? ORDER BY date";
    const paymentsParams = [currentMemberId];
    const savingsPayments = await queryPromise(paymentsQuery, paymentsParams);

    let currentTotalToDeduct = 1000;

    for (let j = 0; j < savingsPayments.length; j++) {
      if (currentTotalToDeduct < 1) {
        break;
      }

      let currentPaymentId = savingsPayments[j].id;
      let currentPaymentAmount = savingsPayments[j].amount;
      let currentPaymentDate = savingsPayments[j].date;
      let currentPaymentMethod = savingsPayments[j].method;
      let currentPaymentReferenceNumber = savingsPayments[j].reference_number;

      if (currentTotalToDeduct >= currentPaymentAmount) {
        const insertMembershipPaymentQuery =
          "INSERT INTO membership_fee_payments(memberId,date,method,reference_number,amount,description) VALUES(?,?,?,?,?,?)";
        const insertMembershipPaymentParams = [
          currentMemberId,
          currentPaymentDate,
          currentPaymentMethod,
          currentPaymentReferenceNumber,
          currentPaymentAmount,
          `Amount deducted from savings id:${currentPaymentId}:Amount:${currentPaymentAmount}`,
        ];
        const insertMembershipPayment = await queryPromise(
          insertMembershipPaymentQuery,
          insertMembershipPaymentParams
        );

        const deleteSavingsPaymentQuery =
          "Delete FROM savings_payments WHERE memberId=? AND id=?";
        const deleteSavingsPaymentParams = [currentMemberId, currentPaymentId];
        const deleteSavingsPayment = await queryPromise(
          deleteSavingsPaymentQuery,
          deleteSavingsPaymentParams
        );

        currentTotalToDeduct = currentTotalToDeduct - currentPaymentAmount;
      } else {
        // if (currentTotalToDeduct < currentPaymentAmount) {
        const description =
          "Transaction Amount shared between membership fee and savings";

        const insertMembershipPaymentQuery =
          "INSERT INTO membership_fee_payments(memberId,date,method,reference_number,amount,description) VALUES(?,?,?,?,?,?)";
        const insertMembershipPaymentParams = [
          currentMemberId,
          currentPaymentDate,
          currentPaymentMethod,
          currentPaymentReferenceNumber,
          currentTotalToDeduct,
          description,
        ];
        const insertMembershipPayment = await queryPromise(
          insertMembershipPaymentQuery,
          insertMembershipPaymentParams
        );

        //update savings amount

        const remainingAmount = currentPaymentAmount - currentTotalToDeduct;

        const deleteSavingsPaymentQuery =
          "UPDATE savings_payments SET amount=?,description=? WHERE memberId=? AND id=?";
        const deleteSavingsPaymentParams = [
          remainingAmount,
          description,
          currentMemberId,
          currentPaymentId,
        ];
        const deleteSavingsPayment = await queryPromise(
          deleteSavingsPaymentQuery,
          deleteSavingsPaymentParams
        );

        currentTotalToDeduct = currentTotalToDeduct - currentPaymentAmount;
      }
    }
  }

  return res.status(200).json({ message: "success" });
};

const deduct_share_capital_get = async (req, res) => {
  //get all members
  const memberListQuery = "SELECT * FROM members ORDER BY id";
  const memberListParams = [];
  const memberList = await queryPromise(memberListQuery, memberListParams);

  // return res.status(200).json({ message: "success",members:memberList });

  for (let i = 0; i < memberList.length; i++) {
    let currentMemberId = memberList[i].id;

    let totalToDeduct = 6000;
    let targetMembershipFeeAmount = 1000;
    let targetShareCapitalAmount = 5000;

    // get savings payments made by date deduct the total needed then submit the balance as savings
    const paymentsQuery =
      "SELECT * FROM savings_payments WHERE memberId=? ORDER BY date";
    const paymentsParams = [currentMemberId];
    const savingsPayments = await queryPromise(paymentsQuery, paymentsParams);

    let currentTotalToDeduct = 1000;

    let currentShareTotalToDeduct = 5000;

    for (let k = 0; k < savingsPayments.length; k++) {
      if (currentShareTotalToDeduct < 1) {
        break;
      }

      let currentPaymentId = savingsPayments[k].id;
      let currentPaymentAmount = savingsPayments[k].amount;
      let currentPaymentDate = savingsPayments[k].date;
      let currentPaymentMethod = savingsPayments[k].method;
      let currentPaymentReferenceNumber = savingsPayments[k].reference_number;

      if (currentShareTotalToDeduct >= currentPaymentAmount) {
        const insertMembershipPaymentQuery =
          "INSERT INTO member_share_capital_payments(memberId,date,method,reference_number,amount,description) VALUES(?,?,?,?,?,?)";
        const insertMembershipPaymentParams = [
          currentMemberId,
          currentPaymentDate,
          currentPaymentMethod,
          currentPaymentReferenceNumber,
          currentPaymentAmount,
          `Amount deducted from savings`,
        ];
        const insertMembershipPayment = await queryPromise(
          insertMembershipPaymentQuery,
          insertMembershipPaymentParams
        );

        const deleteSavingsPaymentQuery =
          "Delete FROM savings_payments WHERE memberId=? AND id=?";
        const deleteSavingsPaymentParams = [currentMemberId, currentPaymentId];
        const deleteSavingsPayment = await queryPromise(
          deleteSavingsPaymentQuery,
          deleteSavingsPaymentParams
        );

        currentShareTotalToDeduct =
          currentShareTotalToDeduct - currentPaymentAmount;
      } else {
        // if (currentShareTotalToDeduct < currentPaymentAmount) {
        const description =
          "Transaction Amount shared between membership fee and savings";

        const insertMembershipPaymentQuery =
          "INSERT INTO member_share_capital_payments(memberId,date,method,reference_number,amount,description) VALUES(?,?,?,?,?,?)";
        const insertMembershipPaymentParams = [
          currentMemberId,
          currentPaymentDate,
          currentPaymentMethod,
          currentPaymentReferenceNumber,
          currentShareTotalToDeduct,
          description,
        ];
        const insertMembershipPayment = await queryPromise(
          insertMembershipPaymentQuery,
          insertMembershipPaymentParams
        );

        //update savings amount

        const remainingAmount =
          currentPaymentAmount - currentShareTotalToDeduct;

        const deleteSavingsPaymentQuery =
          "UPDATE savings_payments SET amount=?,description=? WHERE memberId=? AND id=?";
        const deleteSavingsPaymentParams = [
          remainingAmount,
          description,
          currentMemberId,
          currentPaymentId,
        ];
        const deleteSavingsPayment = await queryPromise(
          deleteSavingsPaymentQuery,
          deleteSavingsPaymentParams
        );

        currentShareTotalToDeduct =
          currentShareTotalToDeduct - currentPaymentAmount;
      }
    }
  }

  return res.status(200).json({ message: "success" });
};

module.exports = {
  schedules_get,
  loan_payments_get,
  loan_gl_get,
  loan_payments_gl_get,
  savings_payments_gl_get,
  deduct_membership_fee_get,
  deduct_share_capital_get,
};
