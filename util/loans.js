const Sequelize = require("sequelize");
const sequelize = require("./database");
const dbs = require("../models/");
const conn = require("./database2");

const getLoanTypes = async () => {
  let loanTypes;

  try {
    loanTypes = await dbs.LoanType.findAll();
  } catch (error) {
    throw new Error(error);
  }
  return loanTypes;
};

const getLoanTypeById = async (id) => {
  let loanType;

  try {
    loanType = await dbs.LoanType.findOne({ where: { id } });
  } catch (error) {
    throw new Error(error);
  }
  return loanType;
};

generateLoanSchedule = (
  loanAmount,
  interestRate,
  tenureMonths,
  interestType
) => {
  let schedule = [];
  let monthlyPrincipal = loanAmount / tenureMonths;
  let monthlyInterest = (loanAmount * (interestRate / 100)) / 12;
  let monthlyPayment = monthlyPrincipal + monthlyInterest;
  let balance = loanAmount;
  let totalInterest = 0;
  let totalPayment = 0;
  let paymentDate = new Date();
  paymentDate.setDate(paymentDate.getDate() + 30); //first payment after 30 days
  for (let i = 0; i < tenureMonths; i++) {
    balance -= monthlyPrincipal;
    totalInterest += monthlyInterest;
    totalPayment += monthlyPayment;

    schedule.push({
      installment: i + 1,
      paymentDate: new Date(paymentDate),
      principal: parseFloat(monthlyPrincipal.toFixed(2)),
      interest: parseFloat(monthlyInterest.toFixed(2)),
      totalPayment: parseFloat(monthlyPayment.toFixed(2)),
      balance: parseFloat(balance.toFixed(2)),
    });
    paymentDate.setDate(paymentDate.getDate() + 30); //next payment after 30 days
  }

  return {
    schedule,
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    totalPayment: parseFloat(totalPayment.toFixed(2)),
  };
};

const loan_details = async (loanId) => {
  const loan_id = loanId;
  let loan_details;
  try {
    loan_details = await dbs.Loan.findOne({ where: { id: loan_id } });
  } catch (error) {
    throw new Error(error);
  }

  // console.log(loan_details)
  return loan_details;
};

const all_loans = async () => {
  let loans;
  try {
    loans = await dbs.Loan.findAll();
  } catch (error) {
    throw new Error(error);
  }

  return loans;
};

const all_disbursed_loans = async () => {
  let loans;
  try {
    loans = await dbs.LoanDisbursement.findAll();
  } catch (error) {
    throw new Error(error);
  }

  return loans;
};

const all_loan_payments = async () => {
  let loansPayments;
  try {
    loansPayments = await dbs.LoanPayments.findAll();
  } catch (error) {
    throw new Error(error);
  }

  return loansPayments;
};

const filtered_loan_payments = async (start_date, end_date) => {
  let loansPayments = await new Promise((resolve, reject) => {
    const sql = `SELECT p.*,l.*,p.id as 'paymentId',CONCAT(m.first_name,' ',m.last_name,' ',m.middle_name) AS 'member_name',m.registration_number FROM loan_payments p INNER JOIN loans l ON p.loanId=l.id JOIN members m ON l.memberId=m.id WHERE  p.date >= '${start_date}' && p.date <= '${end_date}' ORDER BY p.date`;
    conn.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });

  return loansPayments;
};

const all_savings_payments = async () => {
  let savingsPayments;
  try {
    savingsPayments = await dbs.SavingsPayments.findAll();
  } catch (error) {
    throw new Error(error);
  }

  return savingsPayments;
};

module.exports = {
  getLoanTypes,
  getLoanTypeById,
  loan_details,
  all_loans,
  all_disbursed_loans,
  all_loan_payments,
  all_savings_payments,
  filtered_loan_payments,
};
