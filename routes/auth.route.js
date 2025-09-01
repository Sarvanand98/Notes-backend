import expres from "express"
import authController from "../controllers/auth.controller.js"
const router =expres.Router()

router.post("/signup",authController.signup)
router.post("/signin",authController.signin)
router.post("/signout",authController.signout)
router.post("/resend-otp", authController.resendOtp); 

 
export default router