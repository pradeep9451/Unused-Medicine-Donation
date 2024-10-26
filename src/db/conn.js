const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/yadav")
    .then(() => {
        console.log("Connection is successful");
    })
    .catch((e) => {
        console.log("No connection", e); // Including error message for more clarity
    });
