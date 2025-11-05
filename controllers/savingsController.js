const express = require("express");
const Sequelize = require("sequelize");
const sequelize = require("../util/database");
const dbs = require("../models/");

const member_savings_post = (req, res) => {
  const details = req.body;
  const member_id = details.memberId;
  const category_id = details.categoryId;
  const amount = details.amount;
  const frequency = details.frequency;
  const frequency_type = details.frequency_type;
  const frequency_number = details.frequency_number;
  const start_date = details.start_date;

  dbs.MemberSavings.create({
    memberId: member_id,
    categoryId: category_id,
    amount: amount,
    frequency: frequency,
    frequency_type: frequency_type,
    frequency_number: frequency_number,
    start_date: start_date,
  })
    .then((saving) => {
      return res.status(200).json({
        message: "success",
        description: "Member Savings Added Successfully",
        data: saving,
      });
    })
    .catch((err) => {
      return res.status(400).json({
        message: "error",
        description: "Error! failed to add Member Savings",
        data: err,
      });
    });
};

const member_savings_get_all = (req, res) => {
  dbs.MemberSavings.findAll()
    .then((savings) => {
      return res.status(200).json({
        message: "success",
        description: "Member Fetched Fetched Successfully",
        data: savings,
      });
    })
    .catch((err) => {
      return res.status(400).json({
        message: "error",
        description: "Error! failed to fetch Member Savings",
        data: err,
      });
    });
};
const member_savings_join_categories_get = (req, res) => {
  sequelize
    .query(
      "SELECT m.id AS member_id,m.registration_number,m.first_name,m.last_name,m.middle_name,m.mobile_number,s.id AS member_savings_id,s.amount AS monthly_contribution,s.status, c.id AS category_id,c.category_name FROM members m, member_savings s, savings_categories c WHERE s.memberId=m.id AND s.categoryId=c.id ORDER BY m.id"
    )
    .then((savings) => {
      return res.status(200).json({
        message: "success",
        description: "Member Fetched Fetched Successfully",
        data: savings,
      });
    })
    .catch((err) => {
      return res.status(400).json({
        message: "error",
        description: "Error! failed to fetch Member Savings",
        data: err,
      });
    });
};

const member_savings_get_by_savings_id = (req, res) => {
  const savings_id = req.params.id;
  dbs.MemberSavings.findOne({ where: { id: savings_id } })
    .then((saving) => {
      return res.status(200).json({
        message: "success",
        description: "Member Savings Fetched Successfully",
        data: saving,
      });
    })
    .catch((err) => {
      return res.status(400).json({
        message: "error",
        description: "Error! failed to fetch Member Savings",
        data: err,
      });
    });
};

const member_savings_get_by_member_id = (req, res) => {
  const member_id = req.params.id;
  const query = `SELECT s.*,c.id AS category_id,c.category_name 
    FROM member_savings s, savings_categories c
    WHERE s.memberId =? AND s.categoryId = c.id`;
  sequelize
    .query(query, {
      replacements: [member_id],
      type: Sequelize.QueryTypes.SELECT,
    })
    .then((saving) => {
      return res.status(200).json({
        message: "success",
        description: "Member Savings Fetched Successfully",
        data: saving,
      });
    })
    .catch((err) => {
      return res.status(400).json({
        message: "error",
        description: "Error! failed to fetch Member Savings",
        data: err,
      });
    });
};

const member_savings_get_by_member_id_and_category_id = (req, res) => {
  const member_id = req.params.member_id;
  const category_id = req.params.category_id;
  dbs.MemberSavings.findOne({
    where: { memberId: member_id, categoryId: category_id },
  })
    .then((savings) => {
      return res.status(200).json({
        message: "success",
        description: "Member Savings Fetched Successfully",
        data: savings,
      });
    })
    .catch((err) => {
      return res.status(400).json({
        message: "error",
        description: "Error! failed to fetch Member Savings",
        data: err,
      });
    });
};

const member_savings_update_put = (req, res) => {
  const saving_id = req.params.id;
  const details = req.body;
  const member_id = details.memberId;
  const category_id = details.categoryId;
  const amount = details.amount;
  const frequency = details.frequency;
  const frequency_type = details.frequency_type;
  const frequency_number = details.frequency_number;
  const start_date = details.start_date;

  dbs.MemberSavings.update(
    {
      memberId: member_id,
      categoryId: category_id,
      amount: amount,
      frequency: frequency,
      frequency_type: frequency_type,
      frequency_number: frequency_number,
      start_date: start_date,
    },
    { where: { id: saving_id } }
  )
    .then((saving) => {
      return res.status(200).json({
        message: "success",
        description: "Member Savings Updated Successfully",
        data: saving,
      });
    })
    .catch((err) => {
      return res.status(400).json({
        message: "error",
        description: "Error! failed to update Member Savings",
        data: err,
      });
    });
};

const member_savings_delete = (req, res) => {
  const savings_id = req.params.id;
  dbs.MemberSavings.destroy({ where: { id: savings_id } })
    .then((saving) => {
      return res.status(200).json({
        message: "success",
        description: "Member Savings Deleted Successfully",
        data: saving,
      });
    })
    .catch((err) => {
      return res.status(400).json({
        message: "error",
        description: "Error! failed to delete Member Savings",
        data: err,
      });
    });
};

const set_up = async (req, res) => {
  const members = await dbs.Member.findAll();

  for (let i = 0; i < members.length; i++) {
    let member_id = members[i].id;
    let monthly_contribution = members[i].monthly_contribution;
    try {
      const add_member_saving = await dbs.MemberSavings.create({
        memberId: member_id,
        categoryId: 1,
        amount: monthly_contribution,
        frequency: "Regular",
        frequency_type: "Monthly",
        frequency_number: 0,
      });
    } catch (error) {
      continue;
    }
  }

  res.json({ message: "member savings added successfully" });
};

const set_up_payments = async (req, res) => {
  const payments = await dbs.SavingsPayments.findAll();

  for (let i = 0; i < payments.length; i++) {
    let member_id = payments[i].memberId;

    let savings = await dbs.MemberSavings.findOne({
      where: { memberId: member_id },
    });
    let memberSavingsId = savings.id;
    let categoryId = savings.categoryId;

    const updatePayments = dbs.SavingsPayments.update(
      { memberSavingsId, categoryId },
      { where: { memberId: member_id } }
    );
  }
  console.log("update successfull");
  res.json({ message: "iko poa" });
};

module.exports = {
  member_savings_post,
  member_savings_get_all,
  member_savings_join_categories_get,
  member_savings_get_by_member_id,
  member_savings_get_by_member_id_and_category_id,
  member_savings_get_by_savings_id,
  member_savings_update_put,
  member_savings_delete,
  set_up,
  set_up_payments,
};
