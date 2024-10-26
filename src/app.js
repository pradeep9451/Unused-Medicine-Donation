require('dotenv').config();
const express = require("express");
const path = require("path");
const app = express();
const cookieParser = require("cookie-parser");

//for api
const axios = require('axios');
const apihbs = require('express-handlebars');


//app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, 'public')));
const hbs = require("hbs");
const bcrypt = require("bcryptjs");

require("./db/conn");
const Register = require("./models/registers");
const Donate = require("./models/donate");
const Contact = require("./models/contact");
const Request = require("./models/reqmedicine");
const Donerregister = require('./models/donerregisters');
const Review = require('./models/userreviwe');



const { log, Console } = require("console");
const Adminregister = require("./models/adminregisters");
const { cookie } = require('express-validator');
const auth = require("./middleware/auth");
const adminauth = require('./middleware/adminauth');
const donerauth = require('./middleware/donerauth');
const port = process.env.PORT || 3000;

// Corrected directory names
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");
app.use(express.static('public'));



app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);
app.use('/uploads', express.static('uploads'));

// console.log(process.env.SECRET_KEY)

app.get("/", (req, res) => {
  res.render("index"); // Render the index view
});

app.get("/userhome", (req, res) => {
  res.render("userlogin"); // Render the index view
});

app.get("/about", (req, res) => {
  res.render("about"); // Render the about view
});

app.get("/contact", (req, res) => {
  res.render("contact"); // Render the about view
});
// create a new contact in ouer database 
app.post("/contact", async (req, res) => {
  //console.log('Received a POST request to /contact');
  //console.log('Request body:', req.body); // Check if req.body contains the correct data

  try {
    const contactus = new Contact({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      message: req.body.message
    });

    //console.log('Attempting to save contact:', contactus);
    const contacts = await contactus.save();
   // console.log('Data saved successfully:', contacts);

    res.status(201).render("index");
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).send({ error: 'Failed to save contact information.' });
  }
});

//uplode photo 
const fs = require('fs');
const multer = require('multer');
//const path = require('path');

// Ensure the 'uploads' directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
});


app.get("/reqMedicine", auth, (req, res) => {
  res.render("reqMedicine", { isAuthenticated: true }); // Render the about view
});
// create a new contact in ouer database 
// Route to handle for,m submission and save new request to the database
app.post("/request", upload.single('prescription'), async (req, res) => {
  try {
    // Create a new medicine request instance
    const reqmedicine = new Request({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      medicine: req.body.medicine, // Medicine field
      quantity: req.body.quantity, // Quantity field
      details: req.body.details,   // Details field
      prescription: req.file ? req.file.path : '' // Prescription photo file path
    });

    // Save the new request to the database
    const contacts = await reqmedicine.save();
    
    // Render the user login page after saving
    res.status(201).render("userlogin");
  } catch (error) {
    console.error('Error saving data:', error); // Log error for debugging
    res.status(500).send({ error: 'Failed to save request information.' });
  }
});

//user review 

app.get("/userReviews", auth,(req, res) => {
  res.render("userReviews"); // Render the index view
})  
//API to Submit Reviews
app.post('/submit-review', async (req, res) => {
  try {
      const { username, comment, rating } = req.body;
      const newReview = new Review({ username, comment, rating, timestamp: new Date() });
      await newReview.save();
      res.status(200).send('Review submitted successfully');
  } catch (err) {
      res.status(500).send('Error submitting review');
  }
});



//API to fetch Reviews
app.get('/reviews', async (req, res) => {
  try {
      const reviews = await Review.find().sort({ timestamp: -1 });
      res.json(reviews);
  } catch (err) {
      res.status(500).send('Error fetching reviews');
  }
});



// Route to get current user's info (protected route)
app.get('/current-user', auth, async (req, res) => {
    try {
        // Assuming the 'auth' middleware attaches the user to the request object
        const user = req.user;
        res.json({ name: user.name, email: user.email });
    } catch (error) {
        res.status(500).send('Error fetching user information');
    }
});






app.get("/Adminlogout", adminauth, async (req, res) => {
  try {
    //console.log(req.admin);

    // Filter out the token from admin tokens
    req.admin.tokens = req.admin.tokens.filter((currElement) => {
      return currElement.token !== req.token;
    });

    // Clear the JWT cookie
    res.clearCookie("jwt");

    console.log("Admin logout successful");
    await req.admin.save(); // Save the updated admin document

    // Render the admin login page after logout
    res.render("adminlogin",  { logoutSuccess: true });
  } catch (error) {
    console.error('Error during admin logout:', error.message);
    res.status(500).send('An error occurred during admin logout.');
  }
});


//done logout

app.get("/Donerlogout", donerauth, async (req, res) => {
  try {
    //console.log(req.admin);

    // Filter out the token from admin tokens
    req.doner.tokens = req.doner.tokens.filter((currElement) => {
      return currElement.token !== req.token;
    });

    // Clear the JWT cookie
    res.clearCookie("jwt");

    console.log("Admin logout successful");
    await req.doner.save(); // Save the updated doner document

    // Render the doner login page after logout
    res.render("donerlogin",  { logoutSuccess: true });
  } catch (error) {
    console.error('Error during doner logout:', error.message);
    res.status(500).send('An error occurred during admin logout.');
  }
});


app.get("/logout", auth, async(req, res)=>{
  try{
   // console.log(req.user);

    req.user.tokens = req.user.tokens.filter((currElement) => {
         return currElement.token != req.token
    })


    res.clearCookie("jwt");

    console.log("logout succesfully");
    await req.user.save();
    res.render("login", { logoutSuccess: true });
  }catch(error){
    res.status(500).send(error);
  }

});

// //acces index
// app.get("/logout", (req, res) => {
//   res.render("index");
// });

// //acces medicine donation
app.get("/donateMedicine", donerauth,(req, res) => {
  res.render("donateMedicine", { isAuthenticated: true });
});

 
// // create a new donete in ouer database 
app.post("/donate", async (req, res) => {
  try {
    const donatemedicine = new Donate({
      medicineName: req.body.medicineName,
      medicineSerial: req.body.medicineSerial,   // New field
      manufactureDate: req.body.manufactureDate,
      expiryDate: req.body.expiryDate,
      quantity: req.body.quantity,
      donorName: req.body.donorName,             // New field
      contact: req.body.contact,                 // New field
      email: req.body.email                      // New field
    });

    const donated = await donatemedicine.save();
    res.status(201).render("donerhome");
  } catch (error) {
    res.status(400).send(error);
  }
});








//render admin register
app.get("/adminregister",(req,res)=>{
  res.render("adminregister");
})

// create a new user in ouer database 
app.post("/adminregister", async (req, res) => {
  try {
    const registerAdmin = new Adminregister({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      username: req.body.username,
      password: req.body.password,
    });

    // Save the admin registration to the database
    await registerAdmin.save();

    // Generate token and save it to the tokens array
    const token = await registerAdmin.generateAuthToken();

    // Set the token in a cookie
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 600000), // Expires in 10 minutes
      httpOnly: true,
    });

    res.status(201).render("index", { message: "Registration Successful!" });
  } catch (error) {
    res.status(400).send(error);
  }
});




//render doner register
app.get("/donerregister",(req,res)=>{
  res.render("donerregister");
})

// create a new doner in ouer database 
app.post("/donerregister", async (req, res) => {
  try {
    const registerDoner = new Donerregister({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      username: req.body.username,
      password: req.body.password,
    });

    // Save the admin registration to the database
    await registerDoner.save();

    // Generate token and save it to the tokens array
    const token = await registerDoner.generateAuthToken();

    // Set the token in a cookie
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 600000), // Expires in 10 minutes
      httpOnly: true,
    });

    res.status(201).render("index", { message: "Registration Successful!" });
  } catch (error) {
    res.status(400).send(error);
  }
});



// Render user registration form
app.get("/register", (req, res) => {
  res.render("register");
});

// Create a new user in the database
app.post("/register", async (req, res) => {
  try {
    const registerUser = new Register({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      username: req.body.username,
      password: req.body.password,
    });

    console.log("the success part" + registerUser);

    const token = await registerUser.generateAuthToken();
    console.log("the token part" + token);

    res.cookie("jwt", token, {
      expires:new Date(Date.now() + 30000),
      httpOnly:true
    });
    console.log(cookie);


    // Save the registered user
    const registered = await registerUser.save();

    // Render index with success message
    res.status(201).render("index", { message: "Registration Successful!" });
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by the username
    const user = await Register.findOne({ username: username });

    // Check if the user was found
    if (!user) {
      return res.status(400).send("User not found");
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    const token = await user.generateAuthToken();
    //console.log("the token part" + token);

    
    res.cookie("jwt", token, {
      expires:new Date(Date.now() + 600000), // Expires in 10 minutes
      httpOnly:true
    });

    //console.log(this is cookie awesome  ${req.cookies.jwt})

    console.log("login successful");
    // If the password matches
    if (isMatch) {
      return res.status(200).render("userlogin", { login: "Login Successful!" }); // Render the user login page on successful match
      
    } else {
      // Send an error if passwords do not match
      return res.status(400).send("Passwords do not match");
    }

  } catch (error) {
    // Handle any unexpected errors
    return res.status(500).send("An error occurred while processing your request.");
  }
});

//render user login
app.get("/login",(req,res)=>{
  res.render("login");
})

//render uadmin login
app.get("/adminlogin",(req,res)=>{
  res.render("adminlogin");
})


app.post('/adminlogin', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by the username
    const user = await Adminregister.findOne({ username });

    // Check if the user exists and if the password is correct
    if (user && await bcrypt.compare(password, user.password)) {

      // Generate a token and save it to the tokens array
      const token = await user.generateAuthToken();

      // Set the token in a cookie
      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 600000), // Expires in 10 minutes
        httpOnly: true,
      });
      console.log("Admin login successful");
      res.status(200).render('adminhome', { login: "Login Successful!" });
      
    } else {
      res.status(400).send("Invalid credentials");
    }
  } catch (error) {
    res.status(500).send("An error occurred during login");
  }
});


//render doner login
app.get("/donerlogin",(req,res)=>{
  res.render("donerlogin");
})


app.post('/donerlogin', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by the username
    const user = await Donerregister.findOne({ username });

    // Check if the user exists and if the password is correct
    if (user && await bcrypt.compare(password, user.password)) {

      // Generate a token and save it to the tokens array
      const token = await user.generateAuthToken();

      // Set the token in a cookie
      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 600000), // Expires in 10 minutes
        httpOnly: true,
      });
      console.log("Doner login successful");
      res.status(200).render("donerhome", { login: "Login Successful!" });
      
    } else {
      res.status(400).send("Invalid credentials");
    }
  } catch (error) {
    res.status(500).send("An error occurred during login");
  }
});



  

app.get("/avlMedicine", auth, (req, res) => {
  Donate.find({})
    .then((medicines) => {
     // console.log("Data passed to Handlebars:", medicines); // Check the data format here
      res.render("avlmedicine", { x: medicines }); // Pass 'medicines'
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Server Error");
    });
});

//for admin
app.get("/donerAvlmedicine", donerauth,(req, res) => {
  Donate.find({})
    .then((medicines) => {
     // console.log("Data passed to Handlebars:", medicines); // Check the data format here
      res.render("donerAvlMedicine", { x: medicines }); // Pass 'medicines'
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Server Error");
    });
});

//for update
app.get("/updatemedicine", adminauth, (req, res) => {
  Donate.find({})
    .then((medicines) => {
     // console.log("Data passed to Handlebars:", medicines); // Check the data format here
      res.render("updatemedicine", { x: medicines,  isAuthenticated: true  }); // Pass 'medicines'
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Server Error");
    });
});

//Display Update Form

app.get('/updateMedicine/:id', (req, res) => {
  const { id } = req.params;
  // Find the medicine by id
  Donate.findById(id)
    .then(medicine => {
      if (!medicine) {
        return res.status(404).send('Medicine not found');
      }
      // Render update form with medicine data
      res.render('medicineUpdate', { medicine });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Server error');
    });
});

//Handle Update Form Submission


app.post('/updateMedicine/:id', (req, res) => {
  const { id } = req.params;
  const { medicineName, manufactureDate, expiryDate, quantity } = req.body;

  // Update medicine details
  Donate.findByIdAndUpdate(id, { medicineName, manufactureDate, expiryDate, quantity }, { new: true })
    .then(updatedMedicine => {
      if (!updatedMedicine) {
        return res.status(404).send('Medicine not found');
      }
      res.redirect('/updateMedicine'); // Redirect to the medicines list
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Server error');
    });
});

// Set Up the Delete Route
app.delete('/deleteMedicine/:id', (req, res) => {
  const { id } = req.params;
  
  Donate.findByIdAndDelete(id)
    .then(deletedMedicine => {
      if (!deletedMedicine) {
        return res.status(404).json({ success: false, message: 'Medicine not found' });
      }
      res.json({ success: true });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    });
});

// Route to display admin list
app.get("/adminlist", adminauth, async (req, res) => {
  try {
    // Fetch all admins from the database
    const admins = await Adminregister.find({}, 'name email phone username'); // Select only required fields

    // Render the admin list page and pass the admin data
    res.render("adminlist", { admins });
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).send("Error fetching admins");
  }
});

// Route to delete an admin by ID
app.post("/delete-admin/:id", adminauth, async (req, res) => {
  try {
    // Find the admin by ID and delete
    const admin = await Adminregister.findByIdAndDelete(req.params.id);

    if (!admin) {
      return res.status(404).send("Admin not found");
    }
    
    // Redirect back to the admin list after deletion
    res.redirect("/adminlist");
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).send("Error deleting admin");
  }
});


//user list
// Route to display user list
app.get("/userslist", adminauth, async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await Register.find({}, 'name email phone username'); // Select only required fields

    // Render the user list page and pass the user data
    res.render("userslist", { users });
  } catch (error) {
    res.status(500).send("Error fetching users");
  }
});

//delete user
// Route to delete a user by ID
app.post("/delete-user/:id", async (req, res) => {
  try {
    // Find the user by ID and delete
    await Register.findByIdAndDelete(req.params.id);
    
    // Redirect back to the user list after deletion
    res.redirect("/userslist");
  } catch (error) {
    res.status(500).send("Error deleting user");
  }
});

//request list
// Route to display medicine request list
app.get("/medicineReq", adminauth, async (req, res) => {
  try {
    // Fetch all medicine requests from the database, including the prescriptionPhoto field
    const reqs = await Request.find({}, 'name email phone medicine quantity details prescription'); // Add prescriptionPhoto field

    // Render the request list page and pass the request data
    res.render("medicineReq", { reqs });
  } catch (error) {
    res.status(500).send("Error fetching medicine requests");
  }
});


// Delete a medicine request
app.post("/delete-request/:id", async (req, res) => {
  try {
    // Find the request by ID and delete it
    await Request.findByIdAndDelete(req.params.id);
    
    // Redirect back to the medicine request list after deletion
    res.redirect("/medicineReq");
  } catch (error) {
    res.status(500).send("Error deleting medicine request");
  }
});

//api

//render doner login
app.get("/Addmedicineinfo", adminauth,(req,res)=>{
  res.render("addInfoMedicine");
})
// POST route to handle form submission and forward data to external API
app.post('/service', async (req, res) => {
  const newMedicine = req.body;

  // Log the incoming request data
  //console.log('Received data:', newMedicine);

  // Map the received data to match the external API schema
  const mappedData = {
    'SERIAL NUMABER': newMedicine['SERIAL NUMABER'] || '',
    'MEDICINE NAME': newMedicine['MEDICINE NAME'] || '',
    'USE': newMedicine['USE'] || '',
    'COMPANY NAME': newMedicine['COMPANY NAME'] || '',
    'MANUFACTURE DATE': newMedicine['MANUFACTURE DATE'] || '',
    'EXPIRY DATE': newMedicine['EXPIRY DATE'] || '',
    'CONTACT': newMedicine['CONTACT'] || ''
  };

  // Log mapped data
  //console.log('Mapped data:', mappedData);

  // Define the external API URL
  const externalApiUrl = 'http://localhost:3001/service'; // Replace with the actual URL

  try {
    // Send data to the external API
    const response = await axios.post(externalApiUrl, mappedData);

    // Log the external API response
    //console.log('External API response:', response.data);

    // Render the donerhome view with success message
    res.render('adminhome', { message: "Medicine Added Successfully" });

  } catch (error) {
    // Log the error response
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.msg || error.message;

    console.error('Error sending data to external API:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    // Render the donerhome view with error message
    res.render('adminhome', {
      msg: 'Error processing request',
      alertType: 'error',
      error: errorMessage
    });
  }
});




// Fetch data from an external API
async function fetchMedicines() {
  try {
      const response = await axios.get('http://localhost:3001/service');
      // Convert data to use simple property names
      const medicines = response.data.map(medicine => ({
         serialNumber: medicine['SERIAL NUMABER'],
          medicineName: medicine['MEDICINE NAME'],
          use: medicine['USE'],
          companyName: medicine['COMPANY NAME'],
          manufactureDate: medicine['MANUFACTURE DATE'],
          expiryDate: medicine['EXPIRY DATE'],
          contact: medicine['CONTACT']
      }));
     // console.log('Fetched data:', medicines); // Log the transformed data
      return medicines;
  } catch (error) {
      console.error('Error fetching data from external API:', error.message);
      return [];
  }
}

// Route to render the table with data
app.get('/infoMedicine', auth, async (req, res) => {
  try {
      const medicines = await fetchMedicines();
      //console.log('Medicines data:', medicines); // Log the data before rendering
      res.render('api', { medicines, isAuthenticated: true  });
  } catch (error) {
      console.error('Error rendering data:', error.message);
      res.status(500).send('Internal Server Error');
  }
});

//for admin
app.get('/AdminInfoMedicine', adminauth, async (req, res) => {
  try {
      const Medicines = await fetchMedicines();
      //console.log('Medicines data:', medicines); // Log the data before rendering
      res.render('InfoMedicine', { Medicines  });
  } catch (error) {
      console.error('Error rendering data:', error.message);
      res.status(500).send('Internal Server Error');
  }
});


app.listen(port, () => {
  console.log(`Server is running at port no ${port}`);
});