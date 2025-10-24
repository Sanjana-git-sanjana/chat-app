// import { useState } from "react";
// import { useContext } from "react";
// import { children } from "react";
// import { createContext } from "react";
// import { AuthContext } from "./AuthContext.jsx";
// import toast from "react-hot-toast";
// import { useEffect } from "react";

// export const ChatContext = createContext();

// export const ChatProvider = ({children})=>{
//     const [messages,setMessages]=useState([]);
//     const[users,setUsers]=useState([]);
//     const [selectedUser,setSelectedUser]=useState(null)
//     const [unseenMessages,setUnseenMessages]=useState({})


//     const{socket,axios}=useContext(AuthContext);
    
// // funct to get all users for side bar
//     const getUsers=async () => {
//         try {
//             const {data}= await axios.get("/api/messages/users");
//             if(data.success){
//                 setUsers(data.users)
//                 setUnseenMessages(data.unseenMessages)
//             }
//         } catch (error) {
//             toast.error(error.messages)
//         }
//     }
// // funct to get messages from selected users
//     const getMessages = async (userId) => {
//         try {
//              const {data}= await axios.get(`/api/messages/${userId}`);
//              if (data.success){
//                 setMessages(data.messages)
//              }
//         } catch (error) {
//             toast.error(error.message)
//         }
//     }
// //  funct to send message to the selected users
//      const sendMessage = async (messageData) => {
//         try {
//             const {data}= await axios.post(`/api/messages/send/${selectedUser._id}`,messageData);
//             if(data.success){
//                 setMessages((prevMessages)=>[...prevMessages,data.newMessage])
//             }else{
//                   toast.error(data.message);
//             }

//         } catch (error) {
//               toast.error(error.message);
//         }
//      }

//     //  funct to subscribe to msgs
//     const subscribeToMessages = async () => {
//         if(!socket)return;

//         socket.on("newMessage",(newMessage)=>{
//             if(selectedUser && newMessage.senderId === selectedUser._id){
//                newMessage.seen = true;
//                setMessages((prevMessages)=>[...prevMessages,newMessage]);
//                axios.put(`/api/messages/mark/${newMessage._id}`);
//             }else{
//                 setUnseenMessages((prevUnseenMessages)=>({
//                     ...prevUnseenMessages,[newMessage.senderId] : prevUnseenMessages[newMessage.senderId]? prevUnseenMessages[newMessage.senderId]+ 1 : 1
//                 }))
//             }
//         })
//     }
// // func to unsubscribe frm messages
//     const unsubscribeFromMessages = ()=>{
//         if (socket) socket.off("newMessage");
//     }
//     useEffect(()=>{
//         subscribeToMessages();
//         return()=>unsubscribeFromMessages();
//     },[socket,selectedUser])


//     const value={
//         messages,users,selectedUser,getUsers,getMessages,sendMessage,setSelectedUser,unseenMessages,setUnseenMessages
//     }
//     return(
//         <ChatContext.Provider value={value}>
//            {children} 
//         </ChatContext.Provider>
//     )
// }






import { useState, useEffect, useContext, createContext } from "react";
import { AuthContext } from "./AuthContext.jsx";
import toast from "react-hot-toast";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// ✅ Create axios instance
const axiosInstance = axios.create({
  baseURL: `${backendUrl}/api`,
  withCredentials: true,
});

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  // ✅ Only get socket from AuthContext
  const { socket } = useContext(AuthContext);

  // ✅ Get all users for sidebar
  const getUsers = async () => {
    try {
      const { data } = await axiosInstance.get("/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    }
  };

  // ✅ Get messages from selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axiosInstance.get(`/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    }
  };

  // ✅ Send message to selected user
  const sendMessage = async (messageData) => {
    try {
      const { data } = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Message send failed");
    }
  };

  // ✅ Subscribe to incoming messages
  const subscribeToMessages = () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        axiosInstance.put(`/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prevUnseenMessages) => ({
          ...prevUnseenMessages,
          [newMessage.senderId]:
            prevUnseenMessages[newMessage.senderId]
              ? prevUnseenMessages[newMessage.senderId] + 1
              : 1,
        }));
      }
    });
  };

  // ✅ Unsubscribe when component unmounts or user changes
  const unsubscribeFromMessages = () => {
    if (socket) socket.off("newMessage");
  };

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser]);

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessages,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
