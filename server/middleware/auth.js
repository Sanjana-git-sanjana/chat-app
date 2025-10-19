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
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to protect routes
export const protectRoute = async (req, res, next) => {
    try {
        // 1. Get the token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        // 2. Extract the token from the "Bearer <token>" format
        const token = authHeader.split(" ")[1];

        // 3. Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Find user in the database (excluding password)
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 5. Attach user to request and continue
        req.user = user;
        next();
    } catch (error) {
        console.error("Auth error:", error.message);

        // Handle JWT-specific errors
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Token expired" });
        }

        // Generic error
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
