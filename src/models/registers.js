const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");

const registration = new mongoose.Schema({
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
registration.methods.generateAuthToken = async function(){
    try {
        const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        // console.log(token);
        return token;
    } catch (error){
        res.send("the error part" + error);
        console.log("the error part" + error);

    }
}

//convert pass into hash
registration.pre("save", async function(next){
    if(this.isModified("password")) {
        // const passwordHass = await bcrypt.hash(password, 10);
       // console.log(`the current password is ${this.password}`)
        this.password = await bcrypt.hash(this.password, 10);
       // console.log(`the current password is ${this.password}`)


    }
    next();
})

//no need to create a collection


const Register = new mongoose.model("User", registration);

module.exports = Register;