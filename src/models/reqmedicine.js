const mongoose = require("mongoose");

const reqMedicine = new mongoose.Schema({
    name : {
        type:String,
        required:true
    },
    email : {
        type:String,
        
        required:true
    },
    phone : {
        type:String,
         
        required:true
    },
    medicine : {
        type:String,
        required:true
    },
    quantity : {
        type:String,
        required:true
    },
    details : {
        type:String,
        
    },
    prescription: { 
        type:String } // Store the file path of the prescription image
})

//no need to create a collection


const Request = new mongoose.model("ReqMedicine", reqMedicine);

module.exports = Request;