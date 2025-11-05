const Sequelize = require("sequelize");
const dbs = require("../models/");
const sequelize = require("../util/database");
const { postGl, deleteGl } = require("../util/financialAccounts");
const conn = require("../util/database2");

const loan_index = (req, res) => {
  dbs.Loan.findAll()
    .then((data) => {
      res.status(200).json({ message: "success", data: data });
    })
    .catch((err) => {
      res
        .status(200)
        .json({ message: "error", message: "Could't fetch Loans" });
    });
};

const loan_index_join = (req, res) => {
  const sql =
    "SELECT *,l.id AS loan_id  FROM loans l, loan_types t,members m WHERE l.loanTypeId=t.id AND l.memberId=m.id";
  sequelize
    .query(sql, {
      type: Sequelize.QueryTypes.SELECT,
    })
    .then((response) => {
      return res.status(200).json({ message: "success", data: response });
    })
    .catch((err) => {
      return res.status(400).json({
        message: "error",
        description: "Error! Failed to fetch loans",
        data: err,
      });
    });
};
const loan_index_join_all = (req, res) => {
  const sql =
    "SELECT *,l.id AS loan_id,t.name as loan_type_name  FROM loans l, loan_types t,members m WHERE l.loanTypeId=t.id AND l.memberId=m.id";
  sequelize
    .query(sql, {
      type: Sequelize.QueryTypes.SELECT,
    })
    .then((response) => {
      return res.status(200).json({ message: "success", data: response });
    })
    .catch((err) => {
      return res.status(400).json({
        message: "error",
        description: "Error! Failed to fetch loans",
        data: err,
      });
    });
};

const loan_index_join_active = (req, res) => {
  const sql =
    "SELECT *,l.id AS loan_id  FROM loans l, loan_types t,members m WHERE l.loanTypeId=t.id AND l.memberId=m.id AND l.loan_status=?";
  sequelize
    .query(sql, {
      replacements: ["ACTIVE"],
      type: Sequelize.QueryTypes.SELECT,
    })
    .then((response) => {
      return res.status(200).json({ message: "success", data: response });
    })
    .catch((err) => {
      return res.status(400).json({
        message: "error",
        description: "Error! Failed to fetch loans",
        data: err,
      });
    });
};

const member_loans_left_join = (req, res) => {
  const sql =
    "SELECT *,l.id AS loanId,d.date AS disbursement_date FROM members m LEFT JOIN loans l ON l.memberId=m.id AND l.loan_status=?  LEFT JOIN loan_types t ON l.loanTypeId = t.id LEFT JOIN loan_disbursements d ON l.id=d.loanId";
  sequelize
    .query(sql, {
      replacements: ["ACTIVE"],
      type: Sequelize.QueryTypes.SELECT,
    })
    .then((response) => {
      return res.status(200).json({ message: "success", data: response });
    })
    .catch((err) => {
      return res.status(400).json({
        message: "error",
        description: "Error! Failed to fetch loans",
        data: err,
      });
    });
};

const loan_search_list_get = (req, res) => {
  sequelize
    .query(
      "SELECT CONCAT(first_name,' ',last_name,'-',registration_number) AS members,id,registration_number FROM members",
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    )
    .then((result) => {
      res.status(200).json({ message: "success", data: result });
    })
    .catch((err) => {
      res
        .status(200)
        .json({ message: "error", message: "Error Fetching Members" });
    });
};

const loan_types_list_get = (req, res) => {
  dbs.LoanType.findAll()
    .then((result) => {
      return res.status(200).json({ message: "success", data: result });
    })
    .catch((err) => {
      return res.status(200).json({
        message: "error",
        message: "Error Fetching Loan Types",
        data: err,
      });
    });
};
const loan_types_details_get = (req, res) => {
  var loanTypeId = req.params.id;
  dbs.LoanType.findAll({ where: { id: loanTypeId } })
    .then((result) => {
      return res.status(200).json({ message: "success", data: result });
    })
    .catch((err) => {
      return res.status(200).json({
        message: "error",
        message: "Error Fetching Loan Types",
        data: err,
      });
    });
};

const loan_details = async (req, res) => {
  const loanId = req.params.id;
  const loans = await dbs.Loan.findOne({ where: { id: loanId } });
  if (!loans) {
    res.status(400).json({ message: "error", description: "No loans added" });
  } else {
    res.status(200).json({ message: "success", data: loans });
  }
};

const loan_member_details = async (req, res) => {
  const memberId = req.params.id;
  const loan_status_fetch = req.params.status;
  var loans;

  // console.log(`member id: ${memberId} loan status: ${loan_status_fetch}`)
  if (loan_status_fetch === "ALL") {
    // var loans = await dbs.Loan.findAll({
    //   where: { memberId: memberId },
    // });
    let sql =
      "SELECT l.*,t.name AS loanTypeName FROM loans l INNER JOIN loan_types t ON l.loanTypeId=t.id AND l.memberId=?";
    loans = await sequelize.query(sql, {
      replacements: [memberId],
      type: Sequelize.QueryTypes.SELECT,
    });
  } else {
    //  var loans = await dbs.Loan.findAll({
    //    where: { memberId: memberId, loan_status: loan_status_fetch },
    //  });
    let sql =
      "SELECT l.*,t.name AS loanTypeName FROM loans l INNER JOIN loan_types t ON l.loanTypeId=t.id AND l.memberId=? AND l.loan_status=?";
    loans = await sequelize.query(sql, {
      replacements: [memberId, loan_status_fetch],
      type: Sequelize.QueryTypes.SELECT,
    });
  }

  if (!loans) {
    return res
      .status(400)
      .json({ message: "error", description: "No loans added" });
  } else {
    return res.status(200).json({
      message: "success",
      description: "Member Loans fethed successfully",
      data: loans,
    });
  }
};

const loan_approve_get = (req, res) => {
  const loan_id = req.params.id;

  dbs.Loan.update({ loan_status: "APPROVED" }, { where: { id: loan_id } })
    .then((response) => {
      return res.status(200).json({
        message: "success",
        description: "Loan Successfully Approved",
        data: response,
      });
    })
    .catch((err) => {
      return res.status(400).json({
        message: "error",
        description: "Error Approving Loan",
        data: err,
      });
    });
};

const loan_disbursement_post = (req, res) => {
  const d_details = req.body;

  const loan_id = d_details.loanId;
  const method = d_details.method;
  const reference_number = d_details.referenceNumber;
  const amount = d_details.amount;
  const date = d_details.date;

  const disbursement_amount = parseInt(d_details.amount);
  const disbursement_date = d_details.date;
  const processing_fee = disbursement_amount * 0.01;
  const internal_insurance_fund = disbursement_amount * 0.01;
  const transaction_charges_tt = processing_fee + internal_insurance_fund;

  let disbursementId;

  dbs.LoanDisbursement.create({
    loanId: loan_id,
    method: method,
    reference_number: reference_number,
    amount: parseFloat(amount) - transaction_charges_tt,
    date: date,
  })
    .then((response) => {
      disbursementId = response.id;
      const qry = `INSERT INTO loan_processing_charges(loan_id,disbursement_id,item_name,amount) VALUES(?,?,?,?)`;

      return sequelize.query(qry, {
        replacements: [
          loan_id,
          disbursementId,
          "Loan Processing Fee",
          processing_fee,
        ],
        type: Sequelize.QueryTypes.INSERT,
      });
    })
    .then((response) => {
      const qry = `INSERT INTO loan_processing_charges(loan_id,disbursement_id,item_name,amount) VALUES(?,?,?,?)`;

      return sequelize.query(qry, {
        replacements: [
          loan_id,
          disbursementId,
          "Loan Internal Insurance Fund",
          internal_insurance_fund,
        ],
        type: Sequelize.QueryTypes.INSERT,
      });
    })
    // .then((result) => {
    //   return dbs.Loan.update(
    //     { loan_status: "ACTIVE" },
    //     {
    //       where: {
    //         id: loan_id,
    //       },
    //     }
    //   );
    // })
    .then((updatedLoan) => {
      // console.log(`loan Id no 1:${loan_id}`);
      // return dbs.Loan.findOne({ where: { id: loan_id } });
      return sequelize.query(`SELECT * FROM loans WHERE id=?`, {
        replacements: [loan_id],
        type: Sequelize.QueryTypes.SELECT,
      });
    })
    .then(async (loanDetails) => {
      // console.log(loanDetails);
      // return;
      // console.log(`${loanDetails[0].loan_amount}`);
      const loan_amount = loanDetails[0].loan_amount;
      const application_date = loanDetails[0].application_date;
      const tenure_period = loanDetails[0].tenure_period;
      const amortization_mode = loanDetails[0].amortization_mode;
      const interest_amount = loanDetails[0].interest_amount;
      const total_disbursed = loanDetails[0].total_disbursed;
      const total_payable = loanDetails[0].total_payable;
      const monthly_installment = loanDetails[0].monthly_installment;
      const loan_refinance = loanDetails[0].loan_refinance;
      const loan_to_refinance_id = loanDetails[0].loan_to_refinance_id;
      const loan_topup = loanDetails[0].loan_topup;
      const loan_to_top_up_id = loanDetails[0].loan_to_top_up_id;
      const memberId = loanDetails[0].memberId;

      const interest_amount_loan = parseInt(loanDetails[0].interest_amount);
      const total_disbursed_loan = parseInt(loanDetails[0].total_disbursed);

      //if loan_refinance is set to true find existing loans and fund them first

      if (loan_refinance > 0) {
        var active_loan_balance = 0;
        var active_loan_paid = 0;
        try {
          //get details of active loan
          // const activeLoan = await dbs.Loan.findAll({ where: { loan_status: 'ACTIVE', id: { [Op.ne]: loan_id } } });
          const activeLoan = await sequelize.query(
            // "SELECT * FROM loans WHERE loan_status=? AND id != ? AND memberId=?",
            "SELECT * FROM loans WHERE loan_status=? AND id = ? AND memberId=?",
            {
              replacements: ["ACTIVE", loan_to_refinance_id, memberId],
              type: Sequelize.QueryTypes.SELECT,
            }
          );

          // console.log(`ACTIVE LOAN: ${activeLoan}`);

          // console.log(
          //   "/************************************************************************************/"
          // );

          if (activeLoan.length > 0) {
            // console.log(`activeloan length:${activeLoan.length}`);

            var active_loan_id = activeLoan[0].id;
            var active_loan_amount =
              parseInt(activeLoan[0].interest_amount) +
              parseInt(activeLoan[0].total_disbursed);

            //get total paid for this loan
            const get_tt_paid = await sequelize.query(
              "SELECT SUM(total_amount_paid) AS tt_paid FROM loan_schedules WHERE loanId=?",
              {
                replacements: [active_loan_id],
                type: Sequelize.QueryTypes.SELECT,
              }
            );

            // console.log(
            //   `#1 active loan id:${active_loan_id} active loan amount:${active_loan_amount}`
            // );

            active_loan_paid = parseInt(get_tt_paid[0].tt_paid);
            active_loan_balance = active_loan_amount - active_loan_paid;

            let percentage_remaining =
              (parseFloat(active_loan_balance) /
                parseFloat(active_loan_amount)) *
              100;
            let interest_amount_remaining =
              (percentage_remaining / 100) *
              parseInt(activeLoan[0].interest_amount);
            let loan_amount_remaining =
              (percentage_remaining / 100) *
              parseInt(activeLoan[0].total_disbursed);

            // console.log(
            //   `#2 active_loan_paid:${active_loan_paid} active_loan_balance:${active_loan_balance}`
            // );

            // return;

            if (active_loan_balance > 10) {
              //add payment
              const payBalance = await dbs.LoanPayments.create({
                loanId: active_loan_id,
                date: application_date,
                method: "Loan Refinance",
                reference_number: "001",
                amount: active_loan_balance,
                description: "Loan Refinance",
              });

              const paymentId = payBalance.id;

              //post loan receivable credit gl and debit cash gl
              let gl_account_id_to_debit_loan = 12; //collection cash account
              let gl_account_id_to_credit_loan = 18; //account receivable
              let gl_account_id_to_credit_processing_charges_income = 88; //revenue account for processing charges

              let gl_description = `Loan Refinance Disbursement: Ref #:${reference_number} Loan Id${loan_id} loan Amount:${loan_amount} Application Date:${application_date} member Id:${memberId}`;
              let transaction_origin = `Loan Refinance`;
              let transaction_origin_ref_no = paymentId;
              let payment_date = application_date;

              const glPostLoan = await postGl(
                gl_account_id_to_debit_loan,
                gl_account_id_to_credit_loan,
                gl_account_id_to_credit_processing_charges_income,
                gl_description,
                transaction_origin,
                transaction_origin_ref_no,
                payment_date,
                loan_amount_remaining
              );

              //post interest receivable credit and debit revenue gl
              let gl_account_id_to_debit_interest = 83; //decrease in revenue/income account (debit decrease in revenue account)
              let gl_account_id_to_credit_interest = 17; //decrease in interest receivable account (credit current asset account)

              const glPostLoanInterest = await postGl(
                gl_account_id_to_debit_interest,
                gl_account_id_to_credit_interest,
                gl_description,
                transaction_origin,
                transaction_origin_ref_no,
                payment_date,
                interest_amount_remaining
              );

              //add schedule
              var schedId = 0;
              const getScheduleId = await sequelize.query(
                "SELECT MAX(id) AS schedule_id FROM loan_schedules WHERE loanId=?",
                {
                  replacements: [active_loan_id],
                  type: Sequelize.QueryTypes.SELECT,
                }
              );
              schedId = getScheduleId[0].schedule_id;

              //update schedule with the balance amount
              const updateSchedule = await dbs.LoanSchedule.increment(
                {
                  total_amount_paid: +active_loan_balance,
                  balance_amount: -active_loan_balance,
                },
                { where: { id: schedId } }
              );

              //update loan to "CLEARED" status
              const updateAciveLoan = await dbs.Loan.update(
                { loan_status: "CLEARED" },
                { where: { id: active_loan_id } }
              );
            }
          }
        } catch (err) {
          return res.status(400).json({
            message: "error",
            description: "Error Refinancing",
            data: err,
          });
        }
      }

      // if (loan_topup) {
      //   console.log(loan_to_top_up_id);
      // }

      let installment_number = 1;
      let currentDate = new Date(date);
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
            (
              current_starting_principal_balance - principal_installment
            ).toFixed(2)
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

      //post loan receivable credit gl and debit cash gl
      let gl_account_id_to_debit_loan = 18; //account receivable increase
      let gl_account_id_to_credit_loan = 12; //collection cash account
      let gl_description = `Loan Disbursement: Ref #:${reference_number} Loan Id${loan_id} loan Amount:${disbursement_amount} Application Date:${disbursement_date} member Id:${memberId}`;
      let transaction_origin = `Loan Disursement`;
      let transaction_origin_ref_no = disbursementId;
      let payment_date = disbursement_date;

      //console.log(`after loop:gl id 1:${gl_account_id_to_credit_loan} 2: ${gl_account_id_to_debit_loan} ${transaction_origin} gl_descr:${gl_description} origin ref no:${transaction_origin_ref_no} paymentDate:${payment_date} totalDisbursed:${total_disbursed_loan} member id: ${memberId}`);

      const glPostLoanPost = await postGl(
        gl_account_id_to_debit_loan,
        gl_account_id_to_credit_loan,
        gl_description,
        transaction_origin,
        transaction_origin_ref_no,
        payment_date,
        total_disbursed_loan
      );

      //post interest receivable credit and debit revenue gl
      let gl_account_id_to_debit_interest = 17; //increase in interest receivable account (credit current asset account)
      let gl_account_id_to_credit_interest = 83; //increase in revenue/income account (debit decrease in revenue account)

      const glPostLoanInterestPost = await postGl(
        gl_account_id_to_debit_interest,
        gl_account_id_to_credit_interest,
        gl_description,
        transaction_origin,
        transaction_origin_ref_no,
        payment_date,
        interest_amount_loan
      );

      //post interest receivable credit and debit revenue gl
      let gl_account_id_to_debit_transaction_charges = 87; //increase in interest receivable account (credit current asset account)
      let gl_account_id_to_credit_transaction_charges = 88; //increase in revenue/income account (debit decrease in revenue account)
      let transaction_charges_amount = 1000;

      const glPostLoanTransactionChargesPost = await postGl(
        gl_account_id_to_debit_transaction_charges,
        gl_account_id_to_credit_transaction_charges,
        gl_description,
        transaction_origin,
        transaction_origin_ref_no,
        payment_date,
        transaction_charges_amount
      );

      // console.log(`after loop loan Id:${loan_id}`);

      return res.status(200).json({
        message: "success",
        description: "Loan Disbursed Successfully",
      });
    })
    .then((result) => {
      return dbs.Loan.update(
        { loan_status: "ACTIVE" },
        {
          where: {
            id: loan_id,
          },
        }
      );
    })
    // .then(addedSchedule => {
    //   return res.status(200).json({message:"success",description:"Loan Disbursed Successfully"})
    // })
    .catch((err) => {
      return res.status(400).json({ message: "error", data: err });
    });
};

const loan_disbursement_get = (req, res) => {
  sequelize
    .query(
      "SELECT * FROM loan_disbursements d, loans l,members m WHERE d.loanId=l.id AND l.memberId=m.id",
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    )
    .then((response) => {
      res.status(200).json({ message: "success", data: response });
    })
    .catch((err) => {
      res.status(400).json({
        message: "error",
        description: "Error fetching loans disbursed",
        data: err,
      });
    });
};

const loan_disbursement_by_date_post = (req, res) => {
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;

  sequelize
    .query(
      "SELECT * FROM loan_disbursements d, loans l,members m,loan_types t WHERE d.loanId=l.id AND l.loanTypeId=t.id AND (l.loan_status=? OR l.loan_status=?) AND l.memberId=m.id AND d.date >= ? AND d.date <= ? ORDER BY d.date",
      {
        replacements: ["ACTIVE", "CLEARED", startDate, endDate],
        type: Sequelize.QueryTypes.SELECT,
      }
    )
    .then((response) => {
      res.status(200).json({ message: "success", data: response });
    })
    .catch((err) => {
      res.status(400).json({
        message: "error",
        description: "Error fetching loans disbursed",
        data: err,
      });
    });
};

const loan_create_post = (req, res) => {
  var loan_details = req.body;
  console.log("****************************");
  console.log(loan_details);

  const loan_type_name = loan_details.loanProduct;
  const member = loan_details.registrationNumber;

  var interestAmount = 0;
  var totalDisbursed = 0;
  var totalPayable = 0;
  var monthlyInstallment = 0;
  // var interestAmount =
  //   (parseInt(loan_details.loanAmount) * 0.12 * loan_details.tenurePeriod) / 12;

  // const totalDisbursed = parseInt(loan_details.loanAmount);
  // const totalPayable = parseInt(totalDisbursed + interestAmount);

  // const monthlyInstallment = totalPayable / parseInt(loan_details.tenurePeriod);

  var loanTypeId = null;
  var memberId = null;
  // console.log(`type ${loan_type_name} member: ${member}`);

  let interestRate = null;

  dbs.LoanType.findOne({ where: { name: loan_type_name } })
    .then((type) => {
      loanTypeId = type.id;
      interestRate = type.interestRate;

      if (loanTypeId == 2) {
        interestAmount =
          (parseInt(loan_details.loanAmount) *
            interestRate *
            loan_details.tenurePeriod) /
          6;
      } else if (loanTypeId == 3) {
        interestAmount = parseInt(loan_details.loanAmount) * interestRate;
      } else if (loanTypeId == 6) {
        interestAmount =
          (parseInt(loan_details.loanAmount) *
            interestRate *
            loan_details.tenurePeriod) /
          12;
      } else if (loanTypeId == 7) {
        interestAmount =
          (parseInt(loan_details.loanAmount) *
            interestRate *
            loan_details.tenurePeriod) /
          6;
      } else if (loanTypeId == 8) {
        interestAmount = parseInt(loan_details.loanAmount) * interestRate;
      } else if (loanTypeId == 9) {
        interestAmount =
          (parseInt(loan_details.loanAmount) *
            interestRate *
            loan_details.tenurePeriod) /
          12;
      } else if (loanTypeId == 10) {
        interestAmount =
          (parseInt(loan_details.loanAmount) *
            interestRate *
            loan_details.tenurePeriod) /
          12;
      } else {
        res.status(400).json({
          message: "error",
          description: "Invalid Loan Type Selected",
        });
      }

      totalDisbursed = parseInt(loan_details.loanAmount);
      totalPayable = parseInt(totalDisbursed + interestAmount);

      monthlyInstallment = totalPayable / parseInt(loan_details.tenurePeriod);

      // console.log(
      //   `typeid:${loanTypeId} ***** interestAmount:${interestAmount} ***** totalDisbursed:${totalDisbursed} ***** totalPayable:${totalPayable} *****  monthlyInstallment:${monthlyInstallment} ***** `
      // );

      return sequelize.query(
        "SELECT * FROM members WHERE CONCAT(first_name,' ',last_name,'-',registration_number) = ?",
        {
          replacements: [req.body.registrationNumber],
          type: Sequelize.QueryTypes.SELECT,
        }
      );
    })
    .then((mem) => {
      // console.log(mem[0])
      // console.log(loan_details);
      // console.log(`interest ${interestAmount} total disbursed:${totalDisbursed} monthly installment:${monthlyInstallment} `)

      // return dbs.Loan.create({
      //   loanTypeId: loanTypeId,
      //   memberId: mem[0].id,
      //   application_date: loan_details.dateOfApplication,
      //   loan_amount: loan_details.loanAmount,
      //   grace_period: loan_details.gracePeriod,
      //   tenure_period: loan_details.tenurePeriod,
      //   amortization_mode: loan_details.amortizationMode,
      //   interest_amount: interestAmount,
      //   total_disbursed: totalDisbursed,
      //   total_payable: totalPayable,
      //   monthly_installment: monthlyInstallment,
      //   reasons_for_applying: loan_details.reasonsForApplying,
      //   loan_refinance: loan_details.loanRefinance.toString(),
      //   loan_status: "PENDING",
      // });
      // console.log(`member ${mem[0].id} type id:${loanTypeId}`);
      var sql_insert =
        "INSERT INTO loans(application_date,loan_amount,grace_period,tenure_period,amortization_mode,interest_amount,total_disbursed,total_payable,monthly_installment,reasons_for_applying,loan_refinance,loan_to_refinance_id,loan_topup,loan_to_top_up_id,loanTypeId,memberId) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
      return sequelize.query(sql_insert, {
        replacements: [
          loan_details.dateOfApplication,
          loan_details.loanAmount,
          loan_details.gracePeriod,
          loan_details.tenurePeriod,
          loan_details.amortizationMode,
          interestAmount,
          totalDisbursed,
          totalPayable,
          monthlyInstallment,
          loan_details.reasonsForApplying,
          loan_details.loanRefinance,
          loan_details.loanToRefinanceId,
          loan_details.loanTopUp,
          loan_details.loanToTopUpId,
          loanTypeId,
          mem[0].id,
        ],
        type: Sequelize.QueryTypes.INSERT,
      });
    })
    .then((response) => {
      return res.status(200).json({
        message: "error",
        description: "Loan Added Successfully",
        data: response,
      });
    })
    .catch((err) => {
      console.error(err);
      return res.status(400).json({
        message: "error",
        description: "Error Adding loan",
        data: err,
      });
    });
};

const loan_update = (req, res) => {
  const loan_id = req.params.id;
  const loan_details = {
    loanTypeId: loanTypeId,
    application_date: loan_details.dateOfApplication,
    loan_amount: loan_details.amount,
    grace_period: loan_details.gracePeriod,
    tenure_period: loan_details.tenurePeriod,
    amortization_mode: loan_details.amortizationMode,
    reasons_for_applying: loan_details.reasonsForApplying,
    loan_refinance: loan_details.loanRefinance,
  };
  dbs.Loan.update({ loan_details }, { where: { id: loan_id } })
    .then((mem) => {
      res.status(200).json({
        message: "success",
        description: "Loan Updated Successfully",
      });
    })
    .catch((err) => {
      res.status(400).json({
        message: "error",
        description: "Error! Loan Update failed",
      });
    });
};

const loan_delete = async (req, res) => {
  const loan_id = req.params.id;
  // console.log(`Niaje ${loan_id}`);
  // return res.status(200).json({message:"success",data:loan_id})

  try {
    //1. delete loan entry
    const deleteLoan = await dbs.Loan.destroy({ where: { id: loan_id } });

    //2. get and delete payments on loan

    const get_loan_payments = await new Promise((resolve, reject) => {
      const sql = `SELECT * FROM loan_payments WHERE loanId='${loan_id}'`;
      conn.query(sql, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    if (get_loan_payments.length > 0) {
      for (let i = 0; i < get_loan_payments.length; i++) {
        let payment_id = get_loan_payments[i].id;
        //delete payment entry
        const deletePay = await dbs.LoanPayments.destroy({
          where: { id: payment_id },
        });

        //console.log(`payment id: ${payment_id}`);
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
        const get_ledger_id_interest = await sequelize.query(
          gl_query_interest,
          {
            replacements: [transaction_type_from, payment_id],
            type: Sequelize.QueryTypes.SELECT,
          }
        );

        let ledger_id_interest = get_ledger_id_interest[0].entry_id;
        const gl_delete_interest = await deleteGl(ledger_id_interest);

        // console.log(`ledger id interest:${ledger_id_interest}`);
      }
    }

    //console.log(`loan payments length: ${get_loan_payments.length}`);
    // return res.status(200).json({message:"success",data:loan_id})

    //3. get and delete disbursed loan

    const get_disbursement = await new Promise((resolve, reject) => {
      const sql = `SELECT * FROM loan_disbursements WHERE loanId='${loan_id}'`;
      conn.query(sql, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    for (let i = 0; i < get_disbursement.length; i++) {
      const disbursement_id = get_disbursement[i].id;

      //delete disbursement
      const delete_disbursement = await new Promise((resolve, reject) => {
        const sql = `DELETE FROM loan_disbursements WHERE id='${disbursement_id}'`;
        conn.query(sql, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });

      //get and delete ledger entries

      const transaction_type_from = "Loan Disursement";
      const get_ledger_id = await new Promise((resolve, reject) => {
        // console.log(
        //   `transaction type from 1: ${transaction_type_from}  transaction type no:${disbursement_id}`
        // );
        const gl_query = `SELECT * FROM general_ledger WHERE transaction_type_from = '${transaction_type_from}' AND transaction_type_no= '${disbursement_id}'`;
        conn.query(gl_query, (error, result) => {
          if (error) {
            // console.log(error);

            reject(error);
          } else {
            resolve(result);
          }
        });
      });

      let ledger_id = get_ledger_id[0].entry_id;
      // console.log(`ledger id: ${ledger_id}`);

      const gl_delete = await deleteGl(ledger_id);
      // console.log("niaje wasee");
      // console.log(gl_delete);

      //delete interest ledger entry

      const get_ledger_id_interest = await new Promise((resolve, reject) => {
        // console.log(
        //   `transaction type from interest: ${transaction_type_from}  transaction type no interest:${disbursement_id}`
        // );
        const gl_query_interest = `SELECT * FROM general_ledger WHERE transaction_type_from = '${transaction_type_from}' AND transaction_type_no= '${disbursement_id}'`;
        conn.query(gl_query_interest, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });

      let ledger_id_interest = get_ledger_id_interest[0].entry_id;
      const gl_delete_interest = await deleteGl(ledger_id_interest);

      // console.log(`ledger id interest:${ledger_id_interest}`);
    }

    res.status(200).json({
      message: "success",
      description: "Loan Deleted Successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "error",
      description: "Error! failed to Delete Loan",
    });
  }
};

module.exports = {
  loan_index,
  loan_details,
  loan_create_post,
  loan_update,
  loan_delete,
  loan_search_list_get,
  loan_types_list_get,
  loan_index_join,
  loan_member_details,
  loan_types_details_get,
  loan_approve_get,
  loan_disbursement_get,
  loan_disbursement_post,
  loan_disbursement_by_date_post,
  loan_index_join_active,
  member_loans_left_join,
  loan_index_join_all,
};
