const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');


const donerregistration = new mongoose.Schema({
    name : {
        type:String,
        required:true
        
    },
    email : {
        type:String,
         unique:true,
        requored:true
    },
    phone : {
        type:String,
         unique:true,
        required:true
    },
    username : {
        type:String,
        required:true
        
    },
    password : {
        type:String,
        required:true
        
    },
    tokens : [{
        token:{
            type:String,
            required:true
        }
    }]
})

//generating tokens
donerregistration.methods.generateAuthToken = async function () {
    try {
      // Generate a token using the admin's ID
      const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY, { expiresIn: '1h' });
  
      // Add the token to the tokens array
      this.tokens = this.tokens.concat({ token });
  
      // Save the updated admin document with the new token
      await this.save();
  
      return token;
    } catch (error) {
      throw new Error('Token generation failed');
    }
  };
  
  

donerregistration.pre("save", async function(next){
    if(this.isModified("password")) {
        // const passwordHass = await bcrypt.hash(password, 10);
        console.log(`the current password is ${this.password}`)
        this.password = await bcrypt.hash(this.password, 10);
        console.log(`the current password is ${this.password}`)


    }
    next();
})

//no need to create a collection


const Donerregister = new mongoose.model("Doner", donerregistration);

module.exports = Donerregister;