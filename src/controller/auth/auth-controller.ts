import {Response,Request} from 'express';
import otpGenerator from '../../utills/otp-utills';
import User from '../../model/user-model';
import { sendMail, otpVerificationHtml } from '../../utills/mail-utills';
import { sendOtp, verifyOtp } from '../../utills/sms-utills';



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
                
                const otp = otpGenerator();   
                const expiryTime = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
                
                user.emailOtp = otp;
                user.emailOtpExpires = expiryTime;
                await user.save();
                
                // Send email with OTP
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

    static async verifyOTP(req:Request,res:Response){
        try {
            const {phoneNumber, otp, email, emailOtp} = req.body;

            // Verify Email OTP
            if(email && emailOtp){
                const user = await User.findOne({email});
                if(!user){
                    return res.status(404).json({message: 'User not found'});
                }

                if(user.emailOtp !== emailOtp){
                    return res.status(400).json({message: 'Invalid OTP'});
                }

                if(user.emailOtpExpires && new Date() > user.emailOtpExpires){
                    return res.status(400).json({message: 'OTP expired'});
                }

                user.isVerified = true;
                user.emailOtp = undefined;
                user.emailOtpExpires = undefined;
                await user.save();

                return res.status(200).json({
                    status: 'success',
                    message: 'Email verified successfully'
                });
            }

            // Verify Phone OTP
            if(phoneNumber && otp){
                if(!phoneNumber || !otp){
                    return res.status(400).json({message: 'Phone number and OTP are required'});
                }

                const verification = await verifyOtp(phoneNumber, otp);
                
                if(verification.status !== 'approved'){
                    return res.status(400).json({message: 'Invalid OTP'});
                }

                const user = await User.findOne({phoneNumber});
                if(!user){
                    return res.status(404).json({message: 'User not found'});
                }

                user.isVerified = true;
                await user.save();

                return res.status(200).json({
                    status: 'success',
                    message: 'Phone verified successfully'
                });
            }

            return res.status(400).json({message: 'Invalid verification request'});
        } catch (error) {
            console.error('Error verifying OTP:', error);
            res.status(500).json({message: 'Error verifying OTP', error});
        }
    }
}

export default AuthController;