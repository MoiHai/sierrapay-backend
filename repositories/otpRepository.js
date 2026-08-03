const db=require("../config/database");


const collection =
db.collection("otp");



exports.saveOTP=async(data)=>{


const ref =
await collection.add(data);


return ref.id;


};



exports.findOTP=async(phone)=>{


const snap =
await collection
.where(
"phone",
"==",
phone
)
.where(
"used",
"==",
false
)
.get();



if(snap.empty)
return null;



const doc =
snap.docs[0];


return {

id:doc.id,

...doc.data()

};


};



exports.updateOTP=
async(id,data)=>{


return collection
.doc(id)
.update(data);


};