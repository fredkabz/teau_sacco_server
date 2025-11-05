const Sequelize = require("sequelize");
const sequelize = require("./database");
const dbs = require("../models/");
const { queryPromise } = require("./general");

const verifyMemberSavings = (req, res, next) => {
  const pDetails = req.body.data;

  const categoryId = parseInt(pDetails.categoryId);
  const memberId = pDetails.memberId;

  dbs.MemberSavings.findOne({
    where: { memberId: memberId, categoryId: categoryId, status: "ACTIVE" },
  })
    .then((result) => {
      if (result) {
        next();
      } else {
        return res.status(400).json({
          message: "error",
          description: "Error Adding Payment",
          data: "Error Fetching Member savings",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({
        message: "error",
        description: "Error Adding Payment",
        data: err,
      });
    });
};

const verifyMemberLoans = (memberId, loanId) => {};

const memberSavingsPayments = async (memberId) => {
  try {
    //get all payments for selected member
    const memberPaymentsQuery =
      "SELECT * FROM savings_payments WHERE memberId=? ORDER BY date";
    const memberPaymentsParams = [memberId];
    const memberPayments = await queryPromise(
      memberPaymentsQuery,
      memberPaymentsParams
    );

    //get all savings
    const memberSavingsQuery = `SELECT s.*,c.id AS category_id,c.category_name 
    FROM member_savings s, savings_categories c
    WHERE s.memberId =? AND s.categoryId = c.id`;
    const memberSavingsParams = [memberId];
    const memberSavings = await queryPromise(
      memberSavingsQuery,
      memberSavingsParams
    );

    for (let i = 0; i < memberSavings.length; i++) {
      let savingsId = memberSavings[i].id;

      const currentSavingPayments = memberPayments.filter((payment) => {
        return payment.memberSavingsId == savingsId;
      });

      memberSavings[i].payments = currentSavingPayments;

      let totalPayments = currentSavingPayments.reduce((total, payment) => {
        return total + payment.amount;
      }, 0);

      memberSavings[i].payments_total = totalPayments;
    }

    return memberSavings;
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  verifyMemberSavings,
  verifyMemberLoans,
  memberSavingsPayments,
};
