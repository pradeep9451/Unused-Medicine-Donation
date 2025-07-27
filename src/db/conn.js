const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("Connection to MongoDB Atlas successful");
})
.catch((e) => {
    console.error("Connection failed:", e);
});
