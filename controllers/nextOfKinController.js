const dbs = require("../models/");
const Sequelize = require("sequelize");
const sequelize = require("../util/database");
const conn = require("../util/database2");



const nextOfKin_index = (req, res) => {
  dbs.NextOfKin.findAll()
    .then((member) => {
      res.status(200).json({ message: "success", data: member });
    })
    .catch((err) => {
      res.status(400).json({
        message: "error",
        description: "Error Retrieving Next Of Kin List",
      });
    });
};
const nextOfKin_by_member_id_GET = (req, res) => {
  const memberId = req.params.id;
  dbs.NextOfKin.findAll({where:{memberId:memberId}})
    .then((member) => {
      res.status(200).json({ message: "success", data: member });
    })
    .catch((err) => {
      res.status(400).json({
        message: "error",
        description: "Error Retrieving Next Of Kin List",
      });
    });
};
const nextOfKinByMember_get = (req, res) => {
  const memberId = req.params.id;
   dbs.NextOfKin.findAll({where:{memberId:memberId}})
     .then((member) => {
       res.status(200).json({ message: "success", data: member });
     })
     .catch((err) => {
       res.status(400).json({
         message: "error",
         description: "Error Retrieving Next Of Kin List",
       });
     });
}
const nextOfKin_create_post = (req, res) => {
  const data_fetch = req.body;
  const memberId = null;
  const registration_number = data_fetch.registrationNo;
  var currentMemberNumber;

  sequelize
    .query(
      "SELECT * FROM members WHERE CONCAT(first_name,' ',last_name,'-',registration_number) LIKE ? ",
      {
        replacements: [registration_number],
        type: Sequelize.QueryTypes.SELECT,
      }
    )
    .then((result) => {
      currentMemberNumber = result[0].id;
        console.log(currentMemberNumber);
        
        return dbs.NextOfKin.create({
          first_name: data_fetch.firstName,
          last_name: data_fetch.lastName,
          middle_name: data_fetch.middleName,
          date_of_birth: data_fetch.dateOfBirth,
          gender: data_fetch.gender,
          relationship: data_fetch.relationship,
          id_number: data_fetch.identificationNo,
          trustee: data_fetch.trustee,
          inheritance_percentage: data_fetch.inheritancePercentage,
          mobile_number: data_fetch.mobileNo,
          email: data_fetch.email,
          postal_address: data_fetch.postalAddress,
          postal_code: data_fetch.postalCode,
          town: data_fetch.town,
          memberId:currentMemberNumber,
        });
        // return sequelize.query(
        //   // "INSERT INTO next_of_kins(first_name,last_name,middle_name,date_of_birth,gender,relationship,id_number,trustee,inheritance_percentage,mobile_number,email,postal_address,postal_code,town,memberId) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        //   "INSERT INTO next_of_kins(first_name,last_name,middle_name,date_of_birth,gender,relationship,id_number,trustee,inheritance_percentage,mobile_number,email,postal_address,postal_code,town,memberId) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        //   // "INSERT INTO next_of_kins(first_name,last_name,memberId) VALUES(?,?,?)",

        //   {
        //     replacements: [
        //       data_fetch.firstName,
        //       data_fetch.lastName,
        //       data_fetch.middleName,
        //       data_fetch.dateOfBirth,
        //       data_fetch.gender,
        //       data_fetch.relationship,
        //       data_fetch.identificationNo,
        //       data_fetch.trustee,
        //       data_fetch.inheritancePercentage,
        //       data_fetch.mobileNo,
        //       data_fetch.email,
        //       data_fetch.postalAddress,
        //       data_fetch.postalCode,
        //       data_fetch.town,
        //       currentMemberNumber,
        //     ],
        //     type: Sequelize.QueryTypes.INSERT,
        //   }
        // );
    })
    .then((newNextOfKin) => {
      return res.json({
        message: `Next of kin data for ${registration_number} added successfully`,
        data: newNextOfKin,
      });
    })
    .catch((err) => {
      return res.json({
        message: `error fetching Member details ${registration_number}`,
        data: err,
      });
    });

  
};

const nextOfKin_details_get = (req, res) => {
  const nextOfKin_number = req.params.id;
  dbs.NextOfKin.findOne({ where: { id: nextOfKin_number } })
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

const nextOfKin_update_put = (req, res) => {
  const nextOfKin_id = req.params.id;
  const data_fetch = req.body;
  // console.log(data_fetch);
  // console.log(`nextOfKin_id ${nextOfKin_id}`);
  const member = {
    first_name: data_fetch.firstName,
    last_name: data_fetch.lastName,
    middle_name: data_fetch.middleName,
    date_of_birth: data_fetch.dateOfBirth,
    gender: data_fetch.gender,
    relationship: data_fetch.relationship,
    id_number: data_fetch.identificationNo,
    trustee: data_fetch.trustee,
    inheritance_percentage: data_fetch.inheritancePercentage,

    mobile_number: data_fetch.mobileNo,
    email: data_fetch.email,
    postal_address: data_fetch.postalAddress,
    postal_code: data_fetch.postalCode,
    town: data_fetch.town,
  };

  dbs.NextOfKin.update(member, { where: { id: nextOfKin_id } })
    .then((mem) => {
      res.status(200).json({ message: "success",description:"Next of Kin Updated Successfully", data: mem });
    })
    .catch((err) => {
      res.status(400).json({
        message: "error",
        description: "Error! failed to Update Member Details",
      });
    });
};

const nextOfKin_delete_get = (req, res) => {
  const nextOfKin_id = req.params.id;
  dbs.NextOfKin.destroy({ where: { id: nextOfKin_id } })
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
  nextOfKin_index,
  nextOfKin_by_member_id_GET,
  nextOfKin_create_post,
  nextOfKin_details_get,
  nextOfKin_update_put,
  nextOfKin_delete_get,
  nextOfKinByMember_get,
};
