import {Response,Request} from 'express';

import User from '../../model/user-model';
import { sendMail, otpVerificationHtml } from '../../utills/mail-utills';
import { sendOtp, verifyOtp } from '../../utills/sms-utills';
import { sign } from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { signAccessToken } from '../../utills/token-utills';
import { createOtp } from '../../utills/otp-utills';
import { IJwtPayload } from '../../types/express';
import Conversation from '../../model/conversation-model';
interface IExpressFiles {
  profileImage?: Express.Multer.File[];
}


class AuthController {
    static async sendOTP(req:Request,res:Response){
        try {
            const {phoneNumber, phoneSuffix, email} = req.body;    
          
            let user;
            
            // Handle Email OTP
            if(email){
                user = await User.findOne({email});
                if(!user){
                    user = new User({email});
                }
                if (!user) {
  user = new User({
    email: email || null,
    phoneNumber: phoneNumber || null,
    phoneSuffix: phoneSuffix || null,

    username: null,
    password: null,

    emailOtp: null,
    emailOtpExpires: null,

    profileImage: {
      url: null,
      public_id: null,
    },

    about: null,
    lastSeen: null,

    isOnline: false,
    isVerified: false,
    agreed: false,
  });
}
                const otp = createOtp();

const hashedOtp = await bcrypt.hash(otp, 10);

const expiryTime = new Date(
  Date.now() + 5 * 60 * 1000
);

user.emailOtp = hashedOtp;
user.emailOtpExpires = expiryTime;

await user.save();
                
               
                const htmlContent = otpVerificationHtml(email, otp);
                await sendMail({
                    to: email,
                    subject: 'Your OTP for Account Verification',
                    html: htmlContent
                });
                
                return res.status(200).json({
                    status: 'success',
                    message: 'OTP sent to email'
                });
            }
            
            // Handle Phone OTP
            if(!phoneNumber || !phoneSuffix){
                return res.status(400).json({message: 'Phone number and suffix are required'});
            }
            
            const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;
            user = await User.findOne({phoneNumber});
            if(!user){
                user = new User({phoneNumber, phoneSuffix});
            }
            
            // Send OTP via Twilio
            await sendOtp(fullPhoneNumber);
            await user.save();
            
            return res.status(200).json({
                status: 'success',
                message: 'OTP sent to phone'
            });
        } catch (error) {
            console.error('Error sending OTP:', error);
            res.status(500).json({message: 'Error sending OTP', error});
        }
    }

static async verifyOTP(req: Request, res: Response) {
    try {

        const {
            phoneNumber,
            phoneSuffix,
            otp,
            email,
            emailOtp
        } = req.body;

        let user;

        // EMAIL OTP VERIFY
        if (email && emailOtp) {

            user = await User.findOne({ email });

            if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    if (
        user.emailOtpExpires &&
        new Date() > user.emailOtpExpires
    ) {
        return res.status(400).json({
            message: "OTP expired"
        });
    }
  console.log("=================================");
      console.log("Entered OTP:", emailOtp.toString().trim());
      console.log("Database Hash:", user.emailOtp);

       // Compare OTP
     const otpMatched = await bcrypt.compare(
   emailOtp.toString().trim(),
   user.emailOtp as string
);

      console.log("Matched:", otpMatched);
      console.log("=================================");

      // Invalid OTP
      if (!otpMatched) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }

            user.isVerified = true;
            user.emailOtp = null;
            user.emailOtpExpires = null;

            await user.save();
        }

        // PHONE OTP VERIFY
        else if (phoneNumber && otp) {

            if (!phoneSuffix) {
                return res.status(400).json({
                    message: "Phone suffix is required"
                });
            }

            const fullPhoneNumber =
                `${phoneSuffix}${phoneNumber}`;

            user = await User.findOne({
                phoneNumber
            });

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            const verification = await verifyOtp(
                fullPhoneNumber,
                otp
            );

            if (verification.status !== "approved") {
                return res.status(400).json({
                    message: "Invalid OTP"
                });
            }

            user.isVerified = true;

            await user.save();
        }

        else {
            return res.status(400).json({
                message: "Invalid verification request"
            });
        }

        // ONE TOKEN FOR BOTH
        const token = signAccessToken({
            _id: user._id
        });

        res.cookie("token", token, {
  httpOnly: true,
  secure: true, // HTTPS only
  sameSite: "none", // required for cross-site frontend/backend
  maxAge: 365 * 24 * 60 * 60 * 1000
}).status(200).json({
            status: "success",
            message: "Verification successful",
            token,
            user
        });

    } catch (error) {

        console.error("Error verifying OTP:", error);

        return res.status(500).json({
            message: "Error verifying OTP",
            error
        });
    }
}
static async updateProfile(req: Request, res: Response) {
  try {
    const userId = req.user?._id
    const { about, username, agreed } = req.body;

    const files = req.files as IExpressFiles;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // update fields
    if (about !== undefined) user.about = about;

    if (username !== undefined && username !== null) {
      user.username = username.trim();
    }

    if (agreed !== undefined && agreed !== null) {
      user.agreed = agreed === true || agreed === "true";
    }

    // avatar generator
    const getRandomAvatar = (seed: string) =>
      `https://api.dicebear.com/7.x/initials/svg?seed=${seed}`;

    const profileImage = files?.profileImage?.[0];

    // CASE 1: user uploads image
    if (profileImage) {
      user.profileImage = {
        url: profileImage.path,
        public_id: profileImage.filename,
      };
    }

    // CASE 2: only generate avatar if user has NO image at all
    if ((!user.profileImage || !user.profileImage.url) && !profileImage) {
      user.profileImage = {
        url: getRandomAvatar(
          user.username || user.email || user._id.toString()
        ),
        public_id: null,
      };
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
       user: {
    _id: user._id,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber,
    phoneSuffix: user.phoneSuffix,
    profileImage: user.profileImage,
    about: user.about,
    isOnline: user.isOnline,
    isVerified: user.isVerified,
    agreed: user.agreed,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  },
    });

  } catch (error) {
    console.error("Error updating profile:", error);

    return res.status(500).json({
      message: "Error updating profile",
      error,
    });
  }
}
static async me(req: Request, res: Response) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        user: null,
      });
    }

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as IJwtPayload;

const userId = decoded._id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        user: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });

  } catch (error) {
    return res.status(401).json({
      success: false,
      user: null,
    });
  }
}
static async logout(req: Request, res: Response) {
    try {
        res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });

    } catch (error) {
        console.error("Error logging out:", error);
        return res.status(500).json({
            message: "Error logging out",
            error,
        });
    }
}

static async deleteAccount(req: Request, res: Response) {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }



    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    return res.status(500).json({
      message: "Error deleting account",
      error,
    });
  }
}

static async checkAuthenticate(req: Request, res: Response) {
  try {

    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        authenticated: false,
        user: null,
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        authenticated: false,
        user: null,
      });
    }

    return res.status(200).json({
      authenticated: true,
      user,
    });

  } catch (error) {

    console.error("Error checking authentication:", error);

    return res.status(500).json({
      authenticated: false,
      user: null,
      message: "Error checking authentication",
    });
  }
}
static async getAllUsers(req: Request, res: Response) {
  try {
    const loggedInUser = req.user?._id;

    const users = await User.find({
      _id: { $ne: loggedInUser },
    })
      .select(
        "username email profileImage isOnline about phoneNumber lastSeen"
      )
      .lean();

    const userConversations = await Promise.all(
      users.map(async (user) => {
        const conversation = await Conversation.findOne({
          participants: { $all: [loggedInUser, user._id] },
        })
          .populate({
            path: "latestMessage",
            select: "content createdAt sender receiver",
          })
          .lean();

        return {
          ...user,
          conversation,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: userConversations,
    });
  } catch (error) {
    console.error("Error fetching users:", error);

    return res.status(500).json({
      success: false,
      data: null,
      message: "Error fetching users",
    });
  }
}



}




export default AuthController;