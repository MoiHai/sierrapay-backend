const express = require("express");

const cors = require("cors");

const helmet = require("helmet");

const morgan = require("morgan");


const authRoutes = require("./routes/authRoutes");



const app = express();



app.use(cors());

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());



// Routes

app.use("/api/auth",authRoutes);



app.get("/",(req,res)=>{


res.json({

app:"SierraPay",

message:"API Running"

});


});



module.exports = app;
