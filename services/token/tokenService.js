const jwt=require("jsonwebtoken");



const tokenService={


generateToken(user){


return jwt.sign(

{

id:user.id,

phone:user.phone

},

process.env.JWT_SECRET,

{

expiresIn:"30d"

}

);


}



};



module.exports=tokenService;