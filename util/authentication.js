const {sign,verify, JsonWebTokenError} = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const createToken = (user) => {
    const accessToken = sign({ username:user.username,id:user.id }, "mySecret");
    return accessToken;
}

const validateToken = (req,res,next) => {
    const accessToken = req.cookies["access-token"];

    if (!accessToken) {
       return res.status(400).json({message:"error",desciption:"Unauthorised Access"})
    }

    try {
        const validToken = verify(accessToken, "mySecret");
        if (validToken) {
            req.authenticated = true;
            return next();
        }
    } catch (err) {
       return res
          .status(400)
          .json({ message: "error", desciption: "Unauthorised Access" });
    }
    
    
        

}

const hashPassword = (password) => {
    bcrypt.hash(password, 5, (err,hash) => {
        if (err)
        {
            return false;
        }
        else {
            return hash;
        }
    })
}

const verifyPassword = (password, encryptedPassword) => {
    bcrypt.compare(password, encryptedPassword, (error,success) => {
        if (error) {
            return false;
        } else {
           return true;
      }
  });
};

module.exports = { createToken, validateToken, hashPassword, verifyPassword };