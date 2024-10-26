const mongoose = require("mongoose");

const donatemedicine = new mongoose.Schema({
    medicineName : {
        type:String,
        required:true
    },
    medicineSerial :  {
        type:String,
        required:true
    },
    manufactureDate : {
        type:String,
        required:true
    },
    expiryDate : {
        type:String,
        required:true
    },
    quantity : {
        type:String,
        requored:true
    },
    donorName: {
        type:String,
        requored:true
    },
    contact: {
        type:String,
        requored:true
    },
    email: {
        type:String,
        requored:true
    }
})

//no need to create a collection


const Donate = new mongoose.model("Donate", donatemedicine);

module.exports = Donate;