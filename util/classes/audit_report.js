const conn = require("../database2");
class Audit {
  constructor(type, year) {
    this.type = type;
    this.year = year;
  }

  async retrieve_savings_list() {
    let memberList = [];

    const sqlMembers = "SELECT * FROM members order by registration_number";
    const members = await new Promise((resolve, reject) => {
      conn.query(sqlMembers, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    members.map((member, index) => {
      return memberList.push({
        member_id: member.id,
        registration_number: member.registration_number,
        first_name: member.first_name,
        last_name: member.last_name,
        middle_name: member.middle_name,
        opening_balance: 0,
        savingsRaw: [],
        payments: [
          { 0: [] },
          { 1: [] },
          { 2: [] },
          { 3: [] },
          { 4: [] },
          { 5: [] },
          { 6: [] },
          { 7: [] },
          { 8: [] },
          { 9: [] },
          { 10: [] },
          { 11: [] },
        ],
        currentPeriodPaymentsTT: 0,
        getCurrentPeriodTT: () => {
          return this.opening_balance + this.currentPeriodPaymentsTT;
        },
      });
    });

    for (let i = 0; i < memberList.length; i++) {
      let currentMemberId = memberList[i].member_id;
      let savingsTT = 0;
      //first get memberSavingsId
      const savingsIdSql = `SELECT id FROM member_savings WHERE memberId=${currentMemberId} AND categoryId=${this.type}`;
      const getSavingsId = await new Promise((resolve, reject) => {
        conn.query(savingsIdSql, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });

      if (getSavingsId.length < 1) {
        // console.log(`${currentMemberId} ${memberList[i].first_name}`);
        continue;
      }

      let savingsId;

      savingsId = getSavingsId[0].id;

      //get member savings for the previous year
      const sumSavingsSql = `SELECT SUM(amount) as amount FROM savings_payments WHERE YEAR(date) < ${this.year} AND memberSavingsId=${savingsId} AND memberId=${currentMemberId}`;
      var getOpeningBalance = await new Promise((resolve, reject) => {
        conn.query(sumSavingsSql, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });

      //set opening balance value
      memberList[i].opening_balance = getOpeningBalance[0].amount;

      //get member savings for the reporting year
      const paymentsListSql = `SELECT amount,date FROM savings_payments WHERE YEAR(date)=${this.year} AND memberSavingsId=${savingsId} AND memberId=${currentMemberId} ORDER BY date`;
      var paymentsList = await new Promise((resolve, reject) => {
        conn.query(paymentsListSql, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });

      //set opening balance value
      memberList[i].opening_balance = getOpeningBalance[0].amount;

      //set savings
      memberList[i].savingsRaw = paymentsList;

      //get set savings list per month

      for (let k = 0; k < paymentsList.length; k++) {
        let paymentMonth = new Date(paymentsList[k].date).getMonth();
        let pAmount = paymentsList[k].amount;
        savingsTT = savingsTT + pAmount;
        memberList[i].payments[paymentMonth][paymentMonth].push(
          paymentsList[k]
        );
      }

      memberList[i].currentPeriodPaymentsTT = savingsTT;
    }

    return memberList;
  }
  async retrieve_loans_list() {
    let memberList = [];

    const sqlMembers = "SELECT * FROM members order by registration_number";
    const members = await new Promise((resolve, reject) => {
      conn.query(sqlMembers, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    members.map((member, index) => {
      return memberList.push({
        member_id: member.id,
        registration_number: member.registration_number,
        first_name: member.first_name,
        last_name: member.last_name,
        middle_name: member.middle_name,
        opening_balance: 0,
        currentPeriodPaymentsTT: 0,
        payments: [
          { 0: [] },
          { 1: [] },
          { 2: [] },
          { 3: [] },
          { 4: [] },
          { 5: [] },
          { 6: [] },
          { 7: [] },
          { 8: [] },
          { 9: [] },
          { 10: [] },
          { 11: [] },
        ],
      });
    });

    for (let i = 0; i < memberList.length; i++) {
      let currentMemberId = memberList[i].member_id;
      let memberLoans = [];
      let tt_payments = 0;
      let currentPaymentsTT = 0;
      //first get memberLoans under the given category
      const memberLoansSql = `SELECT id FROM loans WHERE memberId=${currentMemberId} AND loanTypeId=${this.type}`;
      const getMemberLoans = await new Promise((resolve, reject) => {
        conn.query(memberLoansSql, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });

      if (getMemberLoans.length < 1) {
        // console.log(`${currentMemberId} ${memberList[i].first_name}`);
        continue;
      }

      memberLoans = [...getMemberLoans];

      //get member loans payments for the previous years
      // console.log(memberLoans);

      for (let j = 0; j < memberLoans.length; j++) {
        //get payments made against current loan for previous years
        const currentLoanId = memberLoans[j].id;
        const currentLoanPaymentsSql = `SELECT * FROM loan_payments WHERE loanId=${currentLoanId} AND YEAR(date) < ${this.year}`;

        var currentLoanPayments = await new Promise((resolve, reject) => {
          conn.query(currentLoanPaymentsSql, (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });

        if (currentLoanPayments.length > 0) {
          for (let l = 0; l < currentLoanPayments.length; l++) {
            let currentPaymentAmount = currentLoanPayments[l].amount;
            tt_payments = tt_payments + currentPaymentAmount;
          }
        }

        //get payments made against current loan for selected year
        const loanPaymentsSql = `SELECT * FROM loan_payments WHERE loanId=${currentLoanId} AND YEAR(date) = ${this.year}`;

        var loanPayments = await new Promise((resolve, reject) => {
          conn.query(loanPaymentsSql, (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });

        if (loanPayments.length > 0) {
          let currentPay = 0;
          for (let l = 0; l < loanPayments.length; l++) {
            const paymentMonth = new Date(loanPayments[l].date).getMonth();

            memberList[i].payments[paymentMonth][paymentMonth].push(
              loanPayments[l]
            );
            currentPay = currentPay + loanPayments[l].amount;
          }
          memberList[i].currentPeriodPaymentsTT = currentPay;
        }
      }

      memberList[i].opening_balance = tt_payments;

      //   const sumSavingsSql = `SELECT SUM(amount) as amount FROM savings_payments WHERE YEAR(date)=${previousYear} AND memberSavingsId=${savingsId} AND memberId=${currentMemberId}`;
      //   var getOpeningBalance = await new Promise((resolve, reject) => {
      //     conn.query(sumSavingsSql, (error, result) => {
      //       if (error) {
      //         reject(error);
      //       } else {
      //         resolve(result);
      //       }
      //     });
      //   });

      //set opening balance value
      //   memberList[i].opening_balance = getOpeningBalance[0].amount;

      //   //get member savings for the reporting year
      //   const paymentsListSql = `SELECT amount,date FROM savings_payments WHERE YEAR(date)=${this.year} AND memberSavingsId=${savingsId} AND memberId=${currentMemberId} ORDER BY date`;
      //   var paymentsList = await new Promise((resolve, reject) => {
      //     conn.query(paymentsListSql, (error, result) => {
      //       if (error) {
      //         reject(error);
      //       } else {
      //         resolve(result);
      //       }
      //     });
      //   });

      //   //set opening balance value
      //   memberList[i].opening_balance = getOpeningBalance[0].amount;

      //   //set savings
      //   memberList[i].savings = paymentsList;
    }

    return memberList;
  }
}

module.exports = Audit;
