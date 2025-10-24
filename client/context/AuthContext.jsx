// import { children, useEffect, useState } from "react";
// import { createContext } from "react";
// import toast from "react-hot-toast";
// import axios from 'axios'
// import{io} from "socket.io-client"

// const backendUrl=import.meta.env.VITE_BACKEND_URL;
// axios.defaults.baseURL=backendUrl;

// export const AuthContext = createContext();


// export const AuthProvider =({children})=>{
  
//   const[token,setToken]=useState(localStorage.getItem("token"))
//   const [authUser, setAuthUser] = useState(null);
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [socket, setSocket] = useState(null);
  
//   // check is user is authenticated
//   const checkAuth =async () => {
//     try {
//       const {data} = await axios.get("/api/auth/check");
//       if (data.success){
//         setAuthUser(data.user)
//         connectSocket(data.user)
//       }
//     } catch (error) {
//       toast .error(error.message)
//     }
//   }
// // login
//    const login=async (state,credentials) => {
//     try {
//       const {data}=await axios.post(`/api/auth/${state}`,credentials);
//       if (data.success){
//         setAuthUser(data.userData);
//         connectSocket(data.userData);
//         axios.defaults.headers.common["token"]=data.token;
//         setToken(data.token);
//         localStorage.setItem("token",data.token)
//         toast.success(data.message)
//       }else{
//         toast.error(data.message)
//       }
//     } catch (error) {
//       toast.error(error.message)

//     }
//    }
// // logout
//    const logout=async () =>{
//     localStorage.removeItem("token")
//     setToken(null);
//     setAuthUser(null);
//     setOnlineUsers([]);
//     axios.defaults.headers.common["token"]=null;
//     toast.success("logged out successfully")
//     socket.disconnect();
//    }

// // update profile func
//    const updateProfile=async (body) => {
//     try {
//       const{data}=await axios.put("/api/auth/updateProfile",body);
//       if(data.success){
//         setAuthUser(data.user);
//         toast.success("Profile updated successfully" )
//       }
//     } catch (error) {
//       toast.error(error.message)
//     }
//    }

//   // online users update connect socket
//   const connectSocket=(userData)=>{
//      if (!userData || socket?.connected) return;
//      const newSocket=io(backendUrl,{
//       query:{
//         userId : userData._id,
//       }
//      });
//      newSocket.connect();
//      setSocket(newSocket);

//      newSocket.on("getOnlineUsers",(userIds)=>{
//       setOnlineUsers(userIds);
//      })
//   }
  



//     useEffect(()=>{
//       if(token){
//         axios.defaults.headers.common["token"]=token;
//       }
//       checkAuth()
//     },[])
  
//   const value ={
//     axios,
//     authUser,
//     onlineUsers,
//     socket,login,
//     logout,
//     updateProfile
//   }
//   return(
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   )
// }








// import { useEffect, useState } from "react";
// import { createContext } from "react";
// import toast from "react-hot-toast";
// import axios from 'axios';
// import { io } from "socket.io-client";

// const backendUrl = import.meta.env.VITE_BACKEND_URL;
// axios.defaults.baseURL = backendUrl;

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
  
//   const [token, setToken] = useState(localStorage.getItem("token"));
//   const [authUser, setAuthUser] = useState(null);
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [socket, setSocket] = useState(null);
//   const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
//   // ✅ Check if user is authenticated
//   const checkAuth = async () => {
//     const savedToken = localStorage.getItem("token");
    
//     if (!savedToken) {
//       setIsCheckingAuth(false);
//       return;
//     }

//     try {
//       // Set token before making request
//       axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
      
//       const { data } = await axios.get("/auth/check");
      
//       if (data.success) {
//         setAuthUser(data.user);
//         connectSocket(data.user);
//       }
//     } catch (error) {
//       console.error("Auth check failed:", error.response?.data || error.message);
      
//       // If token is invalid, clear it
//       if (error.response?.status === 401) {
//         localStorage.removeItem("token");
//         setToken(null);
//         delete axios.defaults.headers.common["Authorization"];
//       }
//     } finally {
//       setIsCheckingAuth(false);
//     }
//   };

//   // ✅ Login
//   const login = async (state, credentials) => {
//     try {
//       const { data } = await axios.post(`/auth/${state}`, credentials);
      
//       if (data.success) {
//         const userToken = data.token;
        
//         // Save token
//         setToken(userToken);
//         localStorage.setItem("token", userToken);
        
//         // Set Authorization header
//         axios.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;
        
//         // Set user data
//         setAuthUser(data.userData);
//         connectSocket(data.userData);
        
//         toast.success(data.message || "Login successful");
//       } else {
//         toast.error(data.message || "Login failed");
//       }
//     } catch (error) {
//       console.error("Login error:", error.response?.data || error.message);
//       toast.error(error.response?.data?.message || "Login failed");
//     }
//   };

//   // ✅ Logout
//   const logout = async () => {
//     try {
//       // Clear everything
//       localStorage.removeItem("token");
//       setToken(null);
//       setAuthUser(null);
//       setOnlineUsers([]);
      
//       // Remove Authorization header
//       delete axios.defaults.headers.common["Authorization"];
      
//       // Disconnect socket
//       if (socket) {
//         socket.disconnect();
//         setSocket(null);
//       }
      
//       toast.success("Logged out successfully");
//     } catch (error) {
//       console.error("Logout error:", error);
//     }
//   };

//   // ✅ Update profile
//   const updateProfile = async (body) => {
//     try {
//       const { data } = await axios.put("/auth/updateProfile", body);
      
//       if (data.success) {
//         setAuthUser(data.user);
//         toast.success("Profile updated successfully");
//       }
//     } catch (error) {
//       console.error("Update profile error:", error);
//       toast.error(error.response?.data?.message || "Update failed");
//     }
//   };

//   // ✅ Connect socket for online users
//   const connectSocket = (userData) => {
//     if (!userData || socket?.connected) return;
    
//     // Remove /api from backendUrl for socket connection
//     const socketUrl = backendUrl.replace('/api', '');
    
//     const newSocket = io(socketUrl, {
//       query: {
//         userId: userData._id,
//       }
//     });
    
//     newSocket.connect();
//     setSocket(newSocket);

//     newSocket.on("getOnlineUsers", (userIds) => {
//       setOnlineUsers(userIds);
//     });
    
//     newSocket.on("connect_error", (error) => {
//       console.error("Socket connection error:", error);
//     });
//   };

//   // ✅ Check auth on mount
//   useEffect(() => {
//     checkAuth();
//   }, []);
  
//   const value = {
//     authUser,
//     onlineUsers,
//     socket,
//     login,
//     logout,
//     updateProfile,
//     isCheckingAuth
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };








import { useEffect, useState } from "react";
import { createContext } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const axiosInstance = axios.create({
  baseURL: `${backendUrl}`,
  withCredentials: true,
});

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // ✅ Check if user is authenticated
  const checkAuth = async () => {
    const savedToken = localStorage.getItem("token");

    if (!savedToken) {
      setIsCheckingAuth(false);
      return;
    }

    try {
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;

      const { data } = await axiosInstance.get("/auth/check");

      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      console.error("Auth check failed:", error.response?.data || error.message);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setToken(null);
        delete axiosInstance.defaults.headers.common["Authorization"];
      }
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // ✅ Login
  const login = async (state, credentials) => {
    try {
      const { data } = await axiosInstance.post(`/auth/${state}`, credentials);

      if (data.success) {
        const userToken = data.token;

        setToken(userToken);
        localStorage.setItem("token", userToken);
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;

        setAuthUser(data.userData);
        connectSocket(data.userData);

        toast.success(data.message || "Login successful");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  // ✅ Logout
  const logout = async () => {
    try {
      localStorage.removeItem("token");
      setToken(null);
      setAuthUser(null);
      setOnlineUsers([]);

      delete axiosInstance.defaults.headers.common["Authorization"];

      if (socket) {
        socket.disconnect();
        setSocket(null);
      }

      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // ✅ Update profile
  const updateProfile = async (body) => {
    try {
      const { data } = await axiosInstance.put("/auth/updateProfile", body);

      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  // ✅ Connect socket for online users
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;

    const socketUrl = backendUrl;

    const newSocket = io(socketUrl, {
      query: { userId: userData._id },
    });

    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  };

  // ✅ Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
    isCheckingAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
