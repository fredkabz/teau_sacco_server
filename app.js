const express = require('express');
const app = express();
const sequelize = require('./util/database');
const { sign, verify } = require('jsonwebtoken');




const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require('cors');

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({origin:true,credentials:true}));


// var corsOptions = {
//   origin: "http://localhost:3000",
// };
// app.use(cors(corsOptions));

const dbs = require("./models/index.js");
const authenticationRouter = require('./routes/authenticationRoutes');
const loanRouter = require('./routes/loanRouter');
const memberRouter = require("./routes/memberRouter");
const loanScheduleRouter = require("./routes/loanScheduleRouter");
const guarantorRouter = require("./routes/guarantorRouter");
const nextOfKinRouter = require("./routes/nextOfKinRouter")
const paymentsRouter = require("./routes/paymentsRouter");
const savingsRouter = require("./routes/savingsRouter");
const supplierRouter = require("./routes/supplierRouter");
const financeRouter = require("./routes/financeRouter");
const billsRouter = require("./routes/billsRouter");
const settingsRouter=require("./routes/settingsRouter")



dbs.LoanType.hasMany(dbs.Loan);
dbs.Loan.belongsTo(dbs.LoanType);

dbs.Member.hasMany(dbs.Loan);
dbs.Loan.belongsTo(dbs.Member);

dbs.Loan.hasMany(dbs.LoanGuarantor);
dbs.LoanGuarantor.belongsTo(dbs.Loan);

dbs.Member.hasMany(dbs.NextOfKin);
dbs.NextOfKin.belongsTo(dbs.Member);

dbs.User.hasMany(dbs.UserGroup);
dbs.UserGroup.belongsTo(dbs.User);

dbs.Loan.hasMany(dbs.LoanSchedule);
// dbs.LoanSchedule.belongsTo(dbs.Loan);

// dbs.Loan.hasOne(dbs.LoanDisbursement);
// dbs.LoanDisbursement.belongsTo(dbs.Loan);

// dbs.Member.hasMany(dbs.Loan);
// dbs.Loan.belongsTo(dbs.Member);

// sequelize.sync().then(result => {
//     console.log("iko fiti");
// }).then(
//     () => {
//         app.listen(2000, () => {
//           console.log("listening on port:2000");
//         });
//     }
// ).catch(err=>console.log(err));



app.use('/sura',authenticationRouter);
app.use('/sura',memberRouter);
app.use('/sura',nextOfKinRouter);
app.use('/sura/loans', loanRouter);
app.use("/sura/guarantor", guarantorRouter);
app.use("/sura/loan_schedule", loanScheduleRouter);
app.use('/sura', paymentsRouter);
app.use("/sura/savings", savingsRouter);
app.use("/sura/supplier", supplierRouter);
app.use("/sura/fs", financeRouter);
app.use("/sura/bills",billsRouter)
app.use("/sura/settings", settingsRouter);
app.use("/sura/payments", paymentsRouter);


   
    app.listen(2000, () => {
      console.log(`${process.pid} listening on port:2000`);
    });





