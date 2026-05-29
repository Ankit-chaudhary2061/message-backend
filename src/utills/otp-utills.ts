// import crypto from "crypto";
// import * as bcrypt from "bcrypt";



// export const createOtp = (length = 6): string => {
//   let otp = "";

//   for (let i = 0; i < length; i++) {
//     otp += crypto.randomInt(0, 10);
//   }

//   return otp;
// };



const otpGenerator = (): string => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};

export default otpGenerator;