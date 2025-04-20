
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const app =express()
app.use(cors())
app.use(express.json())

// const uploadDir = path.join(__dirname, 'uploads/documents');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }


const roleRoutes = require("./src/routes/RoleRoutes")
app.use(roleRoutes)

const userRoutes = require("./src/routes/UserRoutes")
app.use(userRoutes)

const lawyerRoutes = require("./src/routes/LawyerRoutes")
app.use(lawyerRoutes)

const appointmentRoutes = require("./src/routes/AppointmentRoutes")
app.use(appointmentRoutes)


const queryRoutes = require("./src/routes/QueryRoutes")
app.use(queryRoutes)


 
const contactRoutes = require("./src/routes/ContactRoutes");
app.use( contactRoutes);

const reviewRoutes = require("./src/routes/ReviewRoutes")
app.use(reviewRoutes)


const adminRoutes = require("./src/routes/AdminRoutes")
app.use(adminRoutes) 

const paymentRoutes = require("./src/routes/RazorPayRoutes")
app.use(paymentRoutes)


mongoose.connect("mongodb://127.0.0.1:27017/25_node_internship").then(()=>{
    console.log("database connected")
})

const PORT = 3000
app.listen(PORT,()=>{
    console.log("server started on port", PORT)
})