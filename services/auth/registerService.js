const userRepository = require("../../repositories/userRepository");
const otpService = require("../otp/otpService");
const walletService = require("../wallet/walletService");


exports.registerUser = async(data)=>{

    const {
        phone,
        firstName,
        lastName
    } = data;


    // Check existing user
    const existingUser =
        await userRepository.findByPhone(phone);


    if(existingUser){

        throw new Error(
            "Phone number already registered"
        );

    }



    // Generate OTP

    const otp =
        await otpService.createOTP(phone);



    return {

        message:
        "OTP sent successfully",

        phone,

        otp

    };


};
