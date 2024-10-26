const mongoose = require("mongoose");

const contactUs = new mongoose.Schema({
    name : {
        type:String,
        required:true
    },
    email : {
        type:String,
        requored:true
    },
    phone : {
        type:String,
        required:true
    },
    message : {
        type:String,
        requored:true
    }
})

//no need to create a collection


const Contact = new mongoose.model("Contact", contactUs);

module.exports = Contact;