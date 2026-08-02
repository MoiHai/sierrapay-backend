require("dotenv").config();

const app = require("./app");

// Initialize Firebase Firestore
require("./config/database");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log("================================");
    console.log(" SierraPay Backend Running ");
    console.log("================================");
    console.log("PORT:", PORT);

});