const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const bcrypt = require("bcrypt");
const path = require("path");

const registerLoad = async (req,res) => {
   try {
      
      return res.render("register");

   } catch (error) {
      console.log(error.message);
      return res.status(500).send("Internal Server Error");
   }
};

const register = async (req,res) => {
   try {

      const passwordHash = await bcrypt.hash(req.body.password,10);

      const user = new User({
         name:req.body.name,
         email:req.body.email,
         image:"UserImages/" + req.file.filename,
         password: passwordHash
      });

      await user.save();

      return res.render("register",{ message:"Registration Successful"});
      
   } catch (error) {
      console.log(error.message);
      return res.status(500).send("Internal Server Error");
   }
};

const loadLogin = async (req,res) => {
   try {
      
      return res.render("login");

   } catch (error) {
      console.log(error.message);
      return res.status(500).send("Internal Server Error");
   }
};

const login = async (req,res) => {
   try {
      
      const email = req.body.email;
      const password = req.body.password;

      const userData = await User.findOne({ email:email });
      if(userData){
         const passMatch = await bcrypt.compare(password,userData.password);
         if(passMatch) {
            req.session.user = userData;
            return res.redirect("dashboard");
         } else {
            return res.render("login",{message:"Email and Password is Incorrect !"});
         }
      } else {
         return res.render("login",{message:"Not a Registered Email !"});
      };
   } catch (error) {
      console.log(error.message);
      return res.status(500).send("Internal Server Error");
   }
};

const logout = async (req,res) => {
   try {
      
      req.session.destroy();
      return res.redirect("/");

   } catch (error) {
      console.log(error.message);
      return res.status(500).send("Internal Server Error");
   }
};

const loadDashboard = async (req,res) => {
   try {

      var users = await User.find({_id: {$nin: [req.session.user._id] } });
      
      return res.render("dashboard",{user:req.session.user,users:users});

   } catch (error) {
      console.log(error.message);
      return res.status(500).send("Internal Server Error");
   }
};

const saveChat = async (req,res) => {
   try {
      
      var chat = new Chat({
         senderId:req.body.senderId,
         receiverId:req.body.receiverId,
         message:req.body.message
      });

      var newChat = await chat.save();
      return res.status(200).send({success:true, msg:"chat saved",data:newChat});   

   } catch (error) {
      return res.status(400).send({success:false, msg:error.message});  
   }
};

const deleteChat = async (req,res) => {
   try {

      await Chat.deleteOne({ _id:req.body.id });
      return res.status(200).send({success:true});

   } catch (error) {
      return res.status(400).send({success:false, msg:error.message});  
   }
};

module.exports = {
   registerLoad,register,loadLogin,login,logout,loadDashboard,saveChat,deleteChat
};