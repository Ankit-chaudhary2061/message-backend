import crypto from "crypto";

export const createOtp = (length = 6): string => {

  let emailOtp = "";

  for (let i = 0; i < length; i++) {
    emailOtp += crypto.randomInt(0, 10);
  }

  return emailOtp;
};