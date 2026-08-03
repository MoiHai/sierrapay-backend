const OTP = require("../../models/OTP");


function generateOTP(){

return Math.floor(
100000 + Math.random()*900000
)
.toString();

}



const otpService={



async sendOTP(phone){


const otp=generateOTP();



await OTP.create(phone,otp);



console.log(
"SierraPay OTP:",
otp
);



return otp;


}



};



module.exports=otpService;