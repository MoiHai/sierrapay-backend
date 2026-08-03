const otpRepository =
require("../../repositories/otpRepository");


const generateOTP = require("./generateOTP");



exports.createOTP = async(phone)=>{


const code =
generateOTP.generateOTP();



const otpData={


phone,

code,


used:false,


createdAt:new Date(),


expireAt:
new Date(
Date.now()+5*60*1000
)

};



await otpRepository.saveOTP(
otpData
);



console.log(
"SierraPay OTP:",
code
);



return code;


};



exports.verifyOTP =
async(phone,code)=>{


const otp =
await otpRepository.findOTP(phone);



if(!otp){

throw new Error(
"OTP not found"
);

}



if(otp.code !== code){

throw new Error(
"Invalid OTP"
);

}



if(
new Date() >
otp.expireAt
){

throw new Error(
"OTP expired"
);

}



await otpRepository.updateOTP(
otp.id,
{
used:true
}
);



return true;


};
