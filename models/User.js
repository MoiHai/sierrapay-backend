const db = require("../config/database");


const usersCollection = db.collection("users");


const User = {


async create(userData){

const userRef = usersCollection.doc();


const user = {

id:userRef.id,

phone:userData.phone,

name:userData.name || "",

profileImage:"",

kycStatus:"pending",

biometricEnabled:false,

createdAt:new Date()

};


await userRef.set(user);


return user;

},



async findByPhone(phone){


const snapshot =
await usersCollection
.where("phone","==",phone)
.limit(1)
.get();



if(snapshot.empty){

return null;

}


return snapshot.docs[0].data();


},



async findById(id){


const doc =
await usersCollection.doc(id).get();



if(!doc.exists){

return null;

}


return doc.data();


}



};



module.exports = User;