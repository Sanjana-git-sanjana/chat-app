// import User from "../models/User.js"
// import jwt from "jsonwebtoken";


// export const protectRoute=async(req, res, next)=>{
//     try {
//         const token = req.headers.token;
         
//         const decoded = jwt.verify(token,process.env.JWT_SECRET)

//         const user = await User.findById(decoded.userId).select("-password");

//         if(!user) return res.json({success:false,message:"User not found"});

//         req.user= user;
//         next();
//     } catch (error) {
//         console.log(error.message);
//         res.json({success:false,message:error.message});
//     }
// }







import { useEffect, useState } from "react";
import { createContext } from "react";
import toast from "react-hot-toast";
import axios from 'axios';
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  
  // ✅ Check if user is authenticated
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // Don't show error toast on initial load if not authenticated
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || error.message);
      }
    }
  };

  // ✅ Login
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        connectSocket(data.userData);
        
        // ✅ Set Authorization header with Bearer token
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ✅ Logout
  const logout = async () => {
    try {
      localStorage.removeItem("token");
      setToken(null);
      setAuthUser(null);
      setOnlineUsers([]);
      
      // ✅ Remove Authorization header
      delete axios.defaults.headers.common["Authorization"];
      
      toast.success("Logged out successfully");
      
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // ✅ Update profile
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/auth/updateProfile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ✅ Connect socket for online users
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;
    
    const newSocket = io(backendUrl, {
      query: {
        userId: userData._id,
      }
    });
    
    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };

  // ✅ Set token on initial load
  useEffect(() => {
    if (token) {
      // ✅ Set Authorization header with Bearer token
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      checkAuth();
    }
  }, []);
  
  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};