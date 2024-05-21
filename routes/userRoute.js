const express = require("express");
const userRoute = express();
const bodyParser = require("body-parser");

const session = require("express-session");
const {SESSION_SECRET} = process.env;
userRoute.use(session({secret:SESSION_SECRET}));

userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({extended:true}));

userRoute.set('view engine',"ejs");
userRoute.set("views","./views");

userRoute.use(express.static("public"));

const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
   destination: (req,file,cb) => {
      cb(null,path.join(__dirname,"../public/UserImages"));
   },filename: (req,file,cb) => {
      const name = Date.now() + "-" + file.originalname;
      cb(null,name);
   }
});

const upload = multer({storage:storage});

const userController = require("../controllers/userController");
const auth = require("../middlewares/auth");

userRoute.get("/register", auth.isLogout, userController.registerLoad);
userRoute.post("/register", upload.single("image") , userController.register );

userRoute.get("/", auth.isLogout, userController.loadLogin);
userRoute.post("/",userController.login);

userRoute.get("/logout", auth.isLogin, userController.logout);

userRoute.get("/dashboard", auth.isLogin, userController.loadDashboard);
userRoute.post("/savechat",userController.saveChat);

userRoute.post("/deletechat",userController.deleteChat);

userRoute.get("*",(req,res) => {
   res.redirect("/");
})

module.exports = userRoute;