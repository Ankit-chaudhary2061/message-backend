import express,{Router} from "express";
import AuthController from "../controller/auth/auth-controller";    
import multer from "multer";
import storage from "../middlerware/cloudinary-midlleware";
import { authMiddleware } from "../middlerware/auth-middleware";
import { Request, Response } from "express";

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, 
  },
});


const router: Router = express.Router();

router.post("/send-otp", AuthController.sendOTP);
router.post("/verify-otp", AuthController.verifyOTP);
router.patch(
  "/update-profile",
  authMiddleware(),
  upload.fields([{ name: "profileImage", maxCount: 1 }]),
  AuthController.updateProfile
);

router.get("/me", authMiddleware(), AuthController.me);
router.post("/logout", authMiddleware(), AuthController.logout);
router.get(
  "/check-auth",
  authMiddleware(),
  AuthController.checkAuthenticate
); 
router.get("/users", authMiddleware(), AuthController.getAllUsers);
export default router;