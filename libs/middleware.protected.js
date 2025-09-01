import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticate =async (req, res, next) => {
    const token = req.cookies.jwt
    if (!token) {
        return res.status(401).json({ message: "Authentication failed" });
    }
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!decode) {
            return res.status(401).json({ message: "Unauthorized-invalid token" })
        }
        const user = await User.findById(decode.userId)
        if (!user) {
            return res.status(401).json({ message: "Unauthorized-User not Found" })

        }
        req.user = user
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token is not valid" });
    }
};