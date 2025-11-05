const conn = require("../util/database2");
const {
  getAccountCategories,
  getAccountTypes,
  getAccountTypesFiltered,
  getBudgetGrouping,
  getGlAccounts,
  getGlAccountsFiltered,
  getLedgersFiltered,
  getGlAccountsFilteredDate,
  getTrialBalance,
} = require("../util/financialAccounts");
const Audit = require("../util/classes/audit_report");

const categories_get = async (req, res) => {
  try {
    let categories = await getAccountCategories();
    return res.status(200).json({ message: "success", data: categories });
  } catch (error) {
    return res.status(400).json({ message: "error", data: error });
  }
};
const types_get = async (req, res) => {
  try {
    let types = await getAccountTypes();
    return res.status(200).json({ message: "success", data: types });
  } catch (error) {
    return res.status(400).json({ message: "error", data: error });
  }
};
const types_filtered_get = async (req, res) => {
  let category = req.params.category;
  try {
    let types = await getAccountTypesFiltered(category);
    return res.status(200).json({ message: "success", data: types });
  } catch (error) {
    return res.status(400).json({ message: "error", data: error });
  }
};

const budget_grouping_get = async (req, res) => {
  try {
    let budget_grouping = await getBudgetGrouping();
    return res.status(200).json({ message: "success", data: budget_grouping });
  } catch (error) {
    return res.status(400).json({ message: "error", data: error });
  }
};
const gl_accounts_get = async (req, res) => {
  try {
    let gl_accounts = await getGlAccounts();
    return res.status(200).json({ message: "success", data: gl_accounts });
  } catch (error) {
    return res.status(400).json({ message: "error", data: error });
  }
};

const gl_accounts_filtered_get = async (req, res) => {
  let option = req.params.option;
  let id = req.params.id;
  try {
    let gl_accounts = await getGlAccountsFiltered(option, id);
    return res.status(200).json({ message: "success", data: gl_accounts });
  } catch (error) {
    return res.status(400).json({ message: "error", data: error });
  }
};

//gl-accounts-query api
const gl_accounts_query_get = async (req, res) => {
  const { category, type } = req.query;
  // console.log(req.query);
  try {
    const accounts = await getGlAccountsFilteredDate(category, type);
    console.log(accounts);
    return res.status(200).json({ message: "success", data: accounts });
  } catch (error) {
    console.log(error.message);
    return res.status(200).json({ message: "error", data: error });
  }
};
//gl-ledgers-query api
const gl_ledgers_query_get = async (req, res) => {
  const { account_id, start_date, end_date } = req.query;
  try {
    const ledgers = await getLedgersFiltered(account_id, start_date, end_date);
    return res.status(200).json({ message: "success", data: ledgers });
  } catch (error) {
    return res.status(200).json({ message: "error", data: error });
  }
};

//gl_account post api
const gl_account_create_post = (req, res) => {};

//gl_account/:id delete api
const gl_account_delete = (req, res) => {};

//gl_account/:id put api
const gl_account_update = (req, res) => {};

const gl_trial_balance_get = async (req, res) => {
  const { start_date, end_date } = req.query;

  console.log(`start date: ${start_date}  end date: ${end_date}`);

  try {
    const trialBalance = await getTrialBalance(start_date, end_date);
    return res.status(200).json({ message: "succcess", data: trialBalance });
  } catch (error) {
    return res.status(200).json({ message: "error", data: error });
  }
};
const audit_report_get = async (req, res) => {
  const { category, type } = req.params;
  const year = req.query.year;

  // console.log(req.params);
  // console.log(year);

  const report = new Audit(type, year);
  let details = [];
  if (category == "savings") {
    details = await report.retrieve_savings_list();
  } else {
    details = await report.retrieve_loans_list();
  }

  res.status(200).json({ message: "success", data: details });
};

module.exports = {
  categories_get,
  types_get,
  types_filtered_get,
  budget_grouping_get,
  gl_accounts_get,
  gl_accounts_filtered_get,
  gl_ledgers_query_get,
  gl_accounts_query_get,
  gl_account_create_post,
  gl_account_delete,
  gl_account_update,
  gl_trial_balance_get,
  audit_report_get,
};
