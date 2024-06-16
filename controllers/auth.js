const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const mongodb=require("mongodb");
const UserPic = require("../models/userPic");
const secret="jabjcnjajcobadcb";

//SIGNUP
exports.postSignup = async (req, res, next) => {
  try {
    const { name, emailId, password } = req.body;
    console.log(name,emailId,password)
    if (name.trim().length === 0)
      return res.status(422).json({ message: "Name does'nt exist" });
    if (
      !emailId.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
    )
      return res.status(422).json({ message: "Some problem with emailId" });
    if (!password || password.trim().length < 5)
      return res
        .status(422)
        .json({ message: "Password does'nt exist or less than 5 characters" });
    const user = await User.findUser(emailId);
    if (user)
      return res
        .status(403)
        .json({ status: 403, message: "User Already Exists" });
    else {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      console.log(hash);
      const newuser = await new User(name, emailId, hash);
      const newuserpic=await new UserPic("https://cdn-icons-png.flaticon.com/512/3682/3682281.png",emailId)
      await newuser.save();
      await newuserpic.save();
      return res.status(200).json({  status:200,message: "User Created" });
    }
  } catch (error) {
    next(error);
  }
};

//LOGIN
exports.postLogin = async (req, res, next) => {
  
  try {
    const { emailId, password } = req.body;
    if (
      !emailId.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
    )
      return res.status(422).json({ status:422,message: "Some problem with emailId" });
    if (!password || password.trim().length < 5)
      return res
        .status(422)
        .json({ status:422,message: "Password does'nt exist or less than 5 characters" });
    const user = await User.findUser(emailId);
    if (user) {
      const result = await bcrypt.compare(password, user.password);
      if (result) {
        
        const token=jwt.sign({emailId:user.emailId},secret);
        console.log((token));
        const userPic=await UserPic.findUser(emailId);
        console.log(userPic)
        const imageUrl=userPic.userPic

        return res.status(200).json({ status:200,token:token,message: "Login Successful","imageUrl":imageUrl });
      } else {
        return res.status(401).json({ status:401,message: "Password Incorrect" });
      }
    } else {
      return res.status(404).json({ status:404,message: "User does'nt exist" });
    }
  } catch (error) {
    next(error);
  }
};
