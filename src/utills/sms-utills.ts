import twillo from 'twilio';

const accountSid = process.env.TWILLIO_ACCOUNT_SID as string;
const authToken = process.env.TWILLIO_AUTH_TOKEN as string;
const serviceSid = process.env.TWILLIO_SERVICE_SID as string;

const client = twillo(accountSid, authToken);

export const sendOtp = async (phoneNumber: string) => {
  try {
    console.log('Sending OTP to', phoneNumber);
    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }
    const response = await client.verify.v2.services(serviceSid)
      .verifications
      .create({ to: phoneNumber, channel: 'sms' });
    console.log('OTP sent successfully', response);
    return response;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error(`Error sending OTP: ${error}`);
  }
};

export const verifyOtp = async (phoneNumber: string, otp: string) => {
  try {
    console.log('Verifying OTP for', phoneNumber);
    if (!phoneNumber || !otp) {
      throw new Error('Phone number and OTP code are required');
    }
    const response = await client.verify.v2.services(serviceSid)
      .verificationChecks
      .create({ to: phoneNumber, code: otp });
    console.log('OTP verification response', response);
    return response;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw new Error(`Error verifying OTP: ${error}`);
  }
};
