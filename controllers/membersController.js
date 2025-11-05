const dbs = require("../models/");
const Sequelize = require("sequelize");
const sequelize = require("../util/database");
const conn = require('../util/database2');

const member_index = (req, res) => {
  dbs.Member.findAll()
    .then((member) => {
      res.status(200).json({ message: "success", data: member });
    })
    .catch((err) => {
      res.status(400).json({
        message: "error",
        description: "Error Retrieving Member List",
      });
    });
};

const member_create_post = ((req, res) => {
    var data_fetch = req.body;
    console.log(data_fetch);
  
    dbs.Member.create({
            registration_number:data_fetch.registrationNo,
          first_name:data_fetch.firstName,
          last_name: data_fetch.lastName,
          middle_name:data_fetch.middleName,
          date_of_birth: data_fetch.dateOfBirth,
          gender: data_fetch.gender,
          marital_status: data_fetch.maritalStatus,
          id_number: data_fetch.identificationNo,
          employer: data_fetch.employer,
          terms_of_service: data_fetch.termsOfService,
          position_in_employment: data_fetch.positionInEmployment,
          position_in_society: data_fetch.positionInTheSociety,
          monthly_contribution: data_fetch.monthlyContribution,
          share_capital: data_fetch.shareCapital,
          mobile_number: data_fetch.mobileNo,
          email:data_fetch.email,
          postal_address: data_fetch.postalAddress,
          postal_code: data_fetch.postalCode,
          town:data_fetch.town,
        })
          .then((newMember) => {
            return res.status(200).json({
              message: "success",
              description: "New Member Added Successfully",
              data: newMember,
            });
          })
          .catch((err) => {
            return res.status(400).json({
              message: "error",
              description: "Error Adding New Member",
              data: err,
            });
          });
})
const member_search_get = (req, res) => {
  const memberNumber = req.params.number;
  sequelize.query(
    "SELECT * FROM members WHERE CONCAT(first_name,' ',last_name,'-',registration_number) = ?",
    {
      replacements: [memberNumber],
      type: Sequelize.QueryTypes.SELECT,
    }
  )
    .then(response => {
      console.log(response);
      return res
        .status(200)
        .json({ message: "success", description: "Member Id retrieval success",data:response });
    })
    .catch(err => {
      return res.status(400).json({ message: "error", description: "Error Retrieving Member Id",data:err });
  })
};

const members_max_number_get = (req, res) => {
  var new_reg_number = null;
  const sql =
    "SELECT MAX(CAST(SUBSTRING(registration_number,8,4) AS UNSIGNED)) AS max_reg_no FROM members";
  sequelize
    .query(sql, {
      type: Sequelize.QueryTypes.SELECT,
    })
    .then((result) => {

      if (result.length < 1) {
        new_reg_number = "TEAUSA-0001";
      } else {
        reg_number = result[0].max_reg_no + 1;
        new_reg_number = reg_number.toString();

        //you can use padStart() method instead of the loop below to insert 0s at the front of the number
        while (new_reg_number.length < 4) {
          new_reg_number = "0" + new_reg_number;
        }
        new_reg_number = "TEAUSA-" + new_reg_number;
        
      }

      return res
        .status(200)
        .json({
          message: "success",
          description: "Max Registration Number Retrieved",
          data: new_reg_number,
        });
    })
    .catch((err) => {
      return res
        .status(400)
        .json({
          message: "error",
          description: "Error Fetching Max Registration No",
          data: err,
        });
    });
};

const member_details_get = (req, res) => {
  const member_number = req.params.id;
  dbs.Member.findOne({ where: { registration_number: member_number } })
    .then((mem) => {
      res.status(200).json({ message: "success", data: mem });
    })
    .catch((err) => {
      res.status(400).json({
        message: "error",
        description: "Cannot Retrieve Member Details",
      });
    });
};

const member_details_by_id_get = (req, res) => {
  const member_number = req.params.id;
  dbs.Member.findOne({ where: { id: member_number } })
    .then((mem) => {
      res.status(200).json({ message: "success", data: mem });
    })
    .catch((err) => {
      res.status(400).json({
        message: "error",
        description: "Cannot Retrieve Member Details",
      });
    });
};

const member_update_put = (req, res) => {
  const memberId = req.params.id;
 
  const data_fetch = req.body;
  const member = {
    registration_number: data_fetch.registrationNo,
    first_name: data_fetch.firstName,
    last_name: data_fetch.lastName,
    middle_name: data_fetch.middleName,
    date_of_birth: data_fetch.dateOfBirth,
    gender: data_fetch.gender,
    marital_status: data_fetch.maritalStatus,
    id_number: data_fetch.identificationNo,
    employer: data_fetch.employer,
    terms_of_service: data_fetch.termsOfService,

    position_in_employment: data_fetch.positionInEmployment,
    position_in_society: data_fetch.positionInSociety,
    monthly_contribution: data_fetch.monthlyContribution,
    share_capital: data_fetch.shareCapital,
    mobile_number: data_fetch.mobileNo,
    email: data_fetch.email,
    postal_address: data_fetch.postalAddress,
    postal_code: data_fetch.postalCode,
    town: data_fetch.town,
    status: data_fetch.status,
  };

  dbs.Member.update(member, { where: { id: memberId } })
    .then((mem) => {
      res.status(200).json({ message: "success", description:"Biodata Updated Successfully",data: mem });
    })
    .catch((err) => {
      res.status(400).json({
        message: "error",
        description: "Error! failed to Update Member Details",
      });
    });
};

const member_delete_get = (req, res) => {
  const registrationNo = req.params.id;
  dbs.Member.destroy({ where: { registration_number: registrationNo } })
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


const member_savings_get = (req, res) => {
  const member_id = req.params.id;
  dbs.SavingsPayments.findAll({ where: { memberId: member_id } })
    .then(response => {
    return res.status(200).json({
      message: "success",
      data:response,
    });
    })
    .catch(err => {
    return res.status(400).json({
       message: "error",
      description: "Error! failed to fetch Member Savings",
       data:err
     });
  })
  
}

const savings_categories_get = (req, res) => {
  sequelize.query("SELECT * FROM savings_categories", {
    type:Sequelize.QueryTypes.SELECT
  })
 .then(categories => {
      return res.status(200).json({message:"success",data:categories})
    })
    .catch((err) => {
    return res.status(400).json({
      message: "error",
      description: "Error! failed to fetch savings categories",
    });
  })
}

module.exports = {
  member_index,
  member_create_post,
  member_details_get,
  member_details_by_id_get,
  member_update_put,
  member_delete_get,
  member_search_get,
  members_max_number_get,
  member_savings_get,
  savings_categories_get,
};
