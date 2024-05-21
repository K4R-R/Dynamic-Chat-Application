require("dotenv").config();

const mongoose = require("mongoose");
const PORT = process.env.PORT || 3000;
const password = encodeURIComponent('Karan@123');

mongoose.connect(`mongodb+srv://DynamicChatApp:${password}@cluster0.km6islo.mongodb.net/UsersAndChats?retryWrites=true&w=majority&appName=Cluster0`);

const express = require("express");
const app = express();
const http = require("http").Server(app);

const userRoute = require("./routes/userRoute");
const User = require("./models/userModel");
const Chat = require("./models/chatModel");

app.use("/",userRoute);

const io = require("socket.io")(http);

const usp = io.of("/user-namespace");

usp.on("connection",async (socket) => {
   console.log("user connected");

   const userId = socket.handshake.auth.token;

   await User.findByIdAndUpdate( { _id:userId },{ $set:{ isOnline:"1" } } );

   socket.broadcast.emit("UserIsOnline",{userId: userId});

   socket.on("disconnect",async() => {

      console.log("user disconnected");

      await User.findByIdAndUpdate( { _id:userId },{ $set:{ isOnline:"0" } } );

      socket.broadcast.emit("UserIsOffline",{userId: userId});
   });

   socket.on("newChat",(data) => {
      socket.broadcast.emit("loadNewChat",data);
   });

   socket.on("existingChat",async (data) => {
      var chats = await Chat.find({ $or:[
         {senderId:data.senderId,receiverId:data.receiverId},
         {senderId:data.receiverId,receiverId:data.senderId}
      ]});

      socket.emit("loadOldChats",{ chats:chats})
   });

   socket.on("chatDeleted",(deleteId) => {
      socket.broadcast.emit("deletedMessage",deleteId);
   });

});

http.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});