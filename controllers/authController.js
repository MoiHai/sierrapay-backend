const authService =
require("../services/auth/authService");



exports.sendOTP = async(req,res)=>{


try{


const {phone}=req.body;


await authService.sendOTP(phone);



res.json({

message:"OTP sent successfully"

});



}catch(error){


res.status(500)
.json({

message:error.message

});


}


};






exports.verifyOTP = async(req,res)=>{


try{


const {
phone,
otp,
name
}=req.body;



const result =
await authService.verifyOTP(
phone,
otp,
name
);



res.json(result);



}catch(error){


res.status(400)
.json({

message:error.message

});


}



};