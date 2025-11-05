const dbs = require("../models/");
const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const guarantor_index = (req, res) => {
  dbs.LoanGuarantor.findAll()
    .then((guarantors) => {
      res.status(200).json({ message: "success", data: guarantors });
    })
    .catch((err) => {
      res.status(400).json({
        message: "error",
        description: "Error Retrieving Guarantor List",
      });
    });
};

const guarantor_create_post =async (req, res) => {
   
  const data_fetch = req.body;
  const loanId = data_fetch.loanId;
  const memberId = data_fetch.memberId;
  const loanAmount = data_fetch.amountToGuarantee;
  if (!loanId || !memberId || !loanAmount) {
     return res.status(400).json({
        message: "error",
        description: "New Member Not Added! Please Try again",
      });
  }
  console.log(`loanid: ${loanId} memberId:${memberId} loan amount: ${loanAmount}`)
  try { 

    //  const add_guarantor = await sequelize.query(
    //    "INSERT INTO loan_guarantors(member_id,amount_to_gurantor,loanId) VALUES(?,?,?)",
    //    {
    //      replacements: [memberId, loanAmount, loanId],
    //      type: Sequelize.QueryTypes.INSERT,
    //    }
    //  );
    const add_guarantor = dbs.LoanGuarantor.create({
      member_id: memberId,
         loanId: loanId,
         amount_to_gurantor: loanAmount,
    });
     return res.status(200).json({
       message: "success",
       description: "New Guarantor Added Successfully",
       data: add_guarantor,
     });
  } catch (err) {
    res.status(400).json({
        message: "error",
      description: "New Member Not Added! Please Try again",
        data:err
      });
  }
  
  
 
    //  dbs.LoanGuarantor.create({
    //    member_id: memberId,
    //    loanId: loanId,
    //    amount_to_gurantor: loanAmount,
    //  })
    //  .then((response) => {
    //    return res
    //      .status(200)
    //      .json({
    //        message: "success",
    //        description: "New Guarantor Added Successfully",
    //        data: mem,
    //      });
    //  })
    //  .catch((err) => {
    //    return res.status(400).json({
    //      message: "error",
    //      description: "New Guarantor Not Added! Please Try again",
    //      data: err,
    //    });
    //  });
     
  // const data_fetch = req.body;
  // const client = data_fetch.client;
  // const guarantor = data_fetch.guarantor;
  // const loanAmount = data_fetch.loanAmount;
  // const memberId = null;
  // const guarantorId = null;
  // const loanId = null;

  // sequelize
  //   .query(
  //     "SELECT * FROM members WHERE CONCAT(first_name,' ',last_name,'-',registration_number) = ?",
  //     { replacements: [client], type: Sequelize.QueryTypes.SELECT }
  //   )
  //   .then((mem) => {
  //     memberId = mem.registration_number;
  //     return dbs.Loan.findOne({
  //       where: {
  //         memberId: memberId,
  //         loan_status: "ACTIVE",
  //       },
  //     });
  //   })
  //   .then((loan) => {
  //     loanId = loan.id;
  //     return sequelize.query(
  //       "SELECT * FROM members WHERE CONCAT(first_name,' ',last_name,'-',registration_number) = ?",
  //       { replacements: [guarantor], type: Sequelize.QueryTypes.SELECT }
  //     );
  //   })
  //   .then((mem) => {
  //     guarantorId = mem.registration_number;
  //     return dbs.LoanGuarantor.create({
  //       member_id: guarantorId,
  //       loanId: loanId,
  //       amount_to_gurantor: data_fetch.amountToGurantor,
  //     });
  //   })
  //   .then((result) => {
  //     res
  //       .status(200)
  //       .json({ message: "New Guarantor Added Successfully", data: mem });
  //   })
  //   .catch((err) => {
  //     res.status(400).json({
  //       message: "error",
  //       description: "New Member Not Added! Please Try again",
  //     });
  //   });
};

const guarantor_details_get_by_guarantor_number = (req, res) => {
  const guarantor_number = req.params.id;
  const sql =
    "SELECT * FROM loan_guarantors g,loans l WHERE g.loanId=l.id AND g.member_id=?";
  sequelize
    .query(sql, {
      replacements: [guarantor_number],
      type: Sequelize.QueryTypes.SELECT,
    })
    .then((mem) => {
      return res.status(200).json({ message: "success", data: mem });
    })
    .catch((err) => {
      return res.status(400).json({
        message: "error",
        description: "Cannot Retrieve Member Details",
      });
    });
};

const guarantors_get_by_loan_id = (req, res) => {
  const loan_id = req.params.id;
  const sql = "SELECT * FROM loan_guarantors g,members m WHERE g.member_id=m.id AND g.loanId=? ";
  sequelize.query(sql, {
    replacements: [loan_id],
    type:Sequelize.QueryTypes.SELECT
  }).then((response) => {
      return res.status(200).json({ message: "success", data: response });
    })
    .catch((err) => {
      return res.status(400).json({ message: "error", data: err });
    });
}

const guarantor_update_put = (req, res) => {
  const registrationNo = req.params.id;
  const data_fetch = req.body;
  const member = {
    first_name: data_fetch.first_name,
    last_name: data_fetch.last_name,
    middle_name: data_fetch.middle_name,
    date_of_birth: data_fetch.date_of_birth,
    gender: data_fetch.gender,
    marital_status: data_fetch.maritalStatus,
    id_number: data_fetch.idNumber,
    employer: data_fetch.employer,
    terms_of_service: data_fetch.termsOfService,

    position_in_employment: data_fetch.positionInEmployment,
    position_in_society: data_fetch.positionInSociety,
    monthly_contribution: data_fetch.monthlyContribution,
    share_capital: data_fetch.shareCapital,
    mobile_number: data_fetch.mobileNumber,
    email: data_fetch.email,
    postal_address: data_fetch.postalAddress,
    postal_code: data_fetch.postalCode,
    town: data_fetch.town,
    status: data_fetch.staus,
  };

  dbs.LoanGuarantor.update(member, {
    where: { registration_number: registrationNo },
  })
    .then((mem) => {
      res.status(200).json({ message: "success", data: mem });
    })
    .catch((err) => {
      res.status(400).json({
        message: "error",
        description: "Error! failed to Update Member Details",
      });
    });
};

const guarantor_delete_get = (req, res) => {
  const registrationNo = req.params.id;
  dbs.LoanGuarantor.destroy({ where: { registration_number: registrationNo } })
    .then((mem) => {
      res.status(200).json({
        message: "success",
        description: "Member Deleted Successfully",
      });
    })
    .catch((err) => {
      res.status(400).json({
        message: "error",
        description: "Error! failed to Delete Member",
      });
    });
};

module.exports = {
  guarantor_index,
  guarantor_create_post,
  guarantor_details_get_by_guarantor_number,
  guarantor_update_put,
  guarantor_delete_get,
  guarantors_get_by_loan_id,
};
