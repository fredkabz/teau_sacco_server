const bcrypt = require("bcrypt");
const {
  hashPassword,
  verifyPassword,
  createToken,
  validateToken,
} = require("../util/authentication");
const dbModels = require("../models/");
const sequelize = require("../util/database");
const Sequelize = require("sequelize");
const jwt = require('jsonwebtoken');


// const login_post = (req, res) => {
//   res.cookie('cookie-test', 'niaje iko fiti', { maxAge: 1000 * 60 * 60 });
//   res.status(200).json({message:"success",desciption:"cookie sent"})
// }
const login_post = async (req, res) => {
  var { username, password } = req.body;
  
  var user = null;
  var dbPassword = null;
 
  user = await dbModels.User.findOne({ where: { username: username } });
  if (!user) {
    return res.status(200).json({
      message: "error",
      description: "User does not exist",
      data: null,
    });

  }
  dbPassword = user.password;
  bcrypt.compare(password, dbPassword)
    .then(match => {
      if (!match) {
        return res.status(200).json({
          message: "error",
          description: "Wrong Username and Password Combination",
        });
      } else {
        const accessToken = createToken(user.id);
        res.cookie("access-token", accessToken, {
          maxAge: 60 * 60 * 30 * 1000,
          httpOnly: true,
        });
        console.log(accessToken);
        return res.status(200).json({ message: "success", user: user });
      }
      
    })
    .catch(err => {
      return res.status(400).json({
        message: "error",
        description: "Login Error",
        data: err
      });
    })
}
  
const login_get = (req, res) => {
 
  // if (req.authenticated) {
    
  //   return res.status(200).json({
  //     message: "success",
  //     description: "user authenticated",
  //   });
  // } else {
    
  //   return res.status(400).json({
  //     message: "error",
  //     description:"user not authenticated"
  //   })
  // }
  const accessToken = req.cookies["access-token"];

  console.log(`access token: ${accessToken}`);
  if (!accessToken) {
    return res
      .status(400)
      .json({ message: "error", desciption: "Unauthorised Access" });
  }

  try {
    const validToken = jwt.verify(accessToken, "mySecret");
    if (validToken) {
      // req.authenticated = true;
      // return next();
      return res.status(200).json({
      message: "success",
      description: "user authenticated",
    });
    }
  } catch (err) {
    return res
      .status(400)
      .json({ message: "error", description: "Unauthorised Access" });
  }
};

const logout_get = (req, res) => {
  res.cookie("access-token", "", { maxAge: 1, httpOnly: true });
  return res
    .status(200)
    .json({ message: "success", description: "Logout Successful" });
};

const register_post = async (req, res) => {
  const user = req.body;
  console.log(user.password);

  const password = user.password;
  bcrypt.hash(password, 5, (err, hash) => {
    if (err) {
      res.status(400).json({
        message: "error",
        description: "Error Ading User authentication details",
      });
    } else {
      dbModels.User.create({
        username: user.username,
        password: hash,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        middle_name: user.middle_name,
        date_of_birth: user.date_of_birth,
        gender: user.gender,
        usergroup: user.usergroup,
      })
        .then((res) => {
          res
            .status(200)
            .json({ message: "success", description: "New User Added" });
        })
        .catch((err) => {
          res.status(400).json({
            message: "error",
            description: "Error Adding New User details",
          });
        });
    }
  });
};

module.exports = { login_post,login_get, logout_get, register_post };
