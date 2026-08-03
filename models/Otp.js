const db = require("../config/database");


const otpCollection =
db.collection("otp_verifications");



const OTP = {



async create(phone,otp){


const data={


phone,

otp,

verified:false,

createdAt:new Date(),

expiresAt:
new Date(Date.now()+5*60*1000)


};



await otpCollection.add(data);


return data;


},




async verify(phone,otp){


const snapshot =
await otpCollection

.where("phone","==",phone)

.where("otp","==",otp)

.where("verified","==",false)

.limit(1)

.get();



if(snapshot.empty){

return false;

}



const doc=snapshot.docs[0];


await doc.ref.update({

verified:true

});


return true;


}



};



module.exports=OTP;