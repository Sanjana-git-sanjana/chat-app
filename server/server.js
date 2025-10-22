// import express from "express";
// import "dotenv/config";
// import cors from "cors";
// import http from "http";
// import { connect } from "http2";
// import { connectDB } from "./lib/db.js";
// import userRouter from "./routes/userRoutes.js";
// import messageRouter from "./routes/messageRoutes.js";
// import { Server } from "socket.io";
// import jwt from "jsonwebtoken";

// // create express app and http server
// const app = express();
// const server = http.createServer(app);

// // initialise socket.io server
// export const io = new Server(server,{
//     cors :{origin:"*"}
// })
// // online users
// export const userSocketMap ={};


// // socket.io connection
// io.on("connection",(socket)=>{
//    const userId = socket.handshake.query.userId;
//    console.log("User connected",userId);  
//    if(userId) userSocketMap[userId]=socket.id;

//    io.emit("getOnlineUsers", Object.keys(userSocketMap));

//    socket.on("disconnect",()=>{
//     console.log("User Disconnected",userId);
//     delete userSocketMap[userId];
//     io.emit("getOnlineUsers",Object.keys(userSocketMap))
//    })
// }
// )

// // middleware setup
// app.use(express.json({ limit: "4mb" }));
// app.use(cors());
// app.use("/api/messages",messageRouter)



// // test route
// app.use("/api/status", (req, res) => res.send("Server is Live"));
// app.use("/api/auth",userRouter);

// await connectDB()

// // if (process.env.NODE_ENV === "production")
     

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log("Server is Running on PORT: " + PORT));

// export default server;



import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

// Fix for ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// create express app and http server
const app = express();
const server = http.createServer(app);

// initialise socket.io
export const io = new Server(server, {
  cors: { origin: "*" }
});

// online users map
export const userSocketMap = {};

// socket.io connection
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected:", userId);

  if (userId) userSocketMap[userId] = socket.id;
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// middleware
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// routes
app.use("/api/messages", messageRouter);
app.use("/api/auth", userRouter);
app.get("/api/status", (req, res) => res.send("Server is Live"));

// connect to database
await connectDB();

// serve frontend
const clientPath = path.join(__dirname, "./client/dist");
app.use(express.static(clientPath));

// React Router fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

// run the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

export default server;
