const registerService =
require("../services/auth/registerService");



exports.register = async(req,res)=>{


try{


const result =
await registerService.registerUser(
req.body
);



res.status(200).json(result);



}catch(error){


res.status(400).json({

message:error.message

});


}


};