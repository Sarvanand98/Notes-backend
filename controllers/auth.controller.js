import express from "express"
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import nodemailer from "nodemailer";
import dotenv from 'dotenv'
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
export default {
    signup: async (req, res) => {
        try {
            const { name, dob, email, otp } = req.body;

            if (!otp) {
                if (!name || !dob || !email) {
                    return res.status(400).json({ message: "All fields are required" });
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return res.status(400).json({ message: "Invalid email format" });
                }
                const existUser = await User.findOne({ email });
                if (existUser) {
                    return res.status(400).json({ message: "Email already exists!" });
                }
                const generatedOtp = Math.floor(100000 + Math.random() * 900000);
                await Otp.findOneAndUpdate(
                    { email },
                    { otp: generatedOtp, expires: Date.now() + 5 * 60 * 1000 },
                    { upsert: true, new: true }
                );

                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: "Your OTP for Notes-app Signup",
                    text: `Your OTP is: ${generatedOtp}`,
                });

                return res.status(200).json({ message: "OTP sent to email" });
            }

            const record = await Otp.findOne({ email });
            if (!record || record.otp != otp || Date.now() > record.expires) {
                return res.status(400).json({ message: "Invalid or expired OTP" });
            }
            const newUser = await User.create({ name, dob, email });

            await Otp.deleteOne({ email });

            const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });
            res.cookie("jwt", token, {
                httpOnly: true,
                secure: true, 
                sameSite: "lax", 
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            res.status(201).json({ success: true, token, user: newUser, message: "User created" });

        } catch (error) {
            console.log("error in signup controller!", error);
            res.status(500).json({ message: "Internal Server Error!" });
        }
    },
    signin: async (req, res) => {
        try {
            const { email, otp, keepLoggedIn } = req.body
             if (!email) {
                    return res.status(400).json({ message: "All fields are required" });
                }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: "Invalid email format" });
            }
            const existUser = await User.findOne({ email })
            if (!existUser) {
                return res.status(400).json({ message: "User Not Found" });
            }

            if (!otp) {
                const generatedOtp = Math.floor(100000 + Math.random() * 900000)
                await Otp.findOneAndUpdate({ email },
                    { otp: generatedOtp, expires: Date.now() + 5 * 60 * 1000 },
                    { upsert: true, new: true })

                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: "Your OTP for Notes-app Signin",
                    text: `Your OTP is: ${generatedOtp}`,
                });
                return res.status(200).json({ message: "OTP sent to email" });
            }

            const record = await Otp.findOne({ email });
            if (!record || record.otp != otp || Date.now() > record.expires) {
                return res.status(400).json({ message: "Invalid or expired OTP" });
            }
            await Otp.deleteOne({ email });

            const token = jwt.sign({ userId: existUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });
            res.cookie("jwt", token, {
                httpOnly: true,
                secure: false, 
                sameSite: "lax", 
                maxAge: keepLoggedIn? 7 * 24 * 60 * 60 * 1000 : undefined
            });
            res.status(200).json({ success: true, token, user: existUser, message: "Signin successful" });

        } catch (error) {
            console.log("error in signin controller!", error);
            res.status(500).json({ message: "Internal Server Error!" });
        }
    },
    signout: async (req, res) => {
        res.clearCookie("jwt");
        res.status(200).json({ message: "Logged out successfully" });
    },
   
    resendOtp: async (req, res) => {
        try {
            const { email, type } = req.body;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: "Invalid email format" });
            }

            if (type === "signup") {
                const existUser = await User.findOne({ email });
                if (existUser) {
                    return res.status(400).json({ message: "Email already exists!" });
                }
            } else if (type === "signin") {
                const existUser = await User.findOne({ email });
                if (!existUser) {
                    return res.status(400).json({ message: "User Not Found" });
                }
            }

            const generatedOtp = Math.floor(100000 + Math.random() * 900000);
            await Otp.findOneAndUpdate(
                { email },
                { otp: generatedOtp, expires: Date.now() + 5 * 60 * 1000 },
                { upsert: true, new: true }
            );

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: `Your OTP for Notes-app ${type === "signup" ? "Signup" : "Signin"}`,
                text: `Your Resend OTP is: ${generatedOtp}`,
            });

            res.status(200).json({ message: "OTP resent to email" });
        } catch (error) {
            console.log("error in resendOtp controller!", error);
            res.status(500).json({ message: "Internal Server Error!" });
        }
    },
   
}