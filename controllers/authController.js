const User = require("../models/User");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");



// REGISTER USER

exports.register = async(req,res)=>{


try{


const {
fullName,
phone,
email,
password,
pin

}=req.body;



const existingUser = await User.findOne({phone});


if(existingUser){

return res.status(400).json({

message:"Phone number already registered"

});

}



const hashedPassword = await bcrypt.hash(password,10);


const hashedPin = await bcrypt.hash(pin,10);



const user = await User.create({

fullName,

phone,

email,

password:hashedPassword,

pin:hashedPin


});



res.status(201).json({

message:"SierraPay account created successfully",

userId:user._id


});



}catch(error){


res.status(500).json({

message:error.message

});


}


};




// LOGIN USER

exports.login = async(req,res)=>{


try{


const {

phone,

password


}=req.body;



const user = await User.findOne({phone});


if(!user){

return res.status(404).json({

message:"User not found"

});

}



const checkPassword = await bcrypt.compare(

password,

user.password

);



if(!checkPassword){

return res.status(401).json({

message:"Invalid password"

});

}



const token = jwt.sign(

{
id:user._id,
phone:user.phone
},

process.env.JWT_SECRET,

{
expiresIn:"7d"
}


);



res.json({

message:"Login successful",

token,

user:{


id:user._id,

fullName:user.fullName,

phone:user.phone


}


});



}catch(error){


res.status(500).json({

message:error.message

});


}


};
