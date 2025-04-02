const express = require("express") 
const mongoose = require("mongoose")
const cors = require("cors")
const app = express()
app.use(cors())
app.use(express.json())


const roleRoutes = require("./src/routes/RoleRoutes")
app.use(roleRoutes)

const userRoutes = require("./src/routes/UserRoutes")
app.use(userRoutes)

const contactRoutes = require("./src/routes/ContactRoutes");
app.use( contactRoutes);

const stateRoutes = require("./src/routes/StateRoutes")
app.use("/state",stateRoutes)

const cityRoutes = require("./src/routes/CityRoutes")
app.use("/city", cityRoutes)

const lawyerRoutes= require("./src/routes/LawyerRoutes")
app.use("/lawyer",lawyerRoutes)

const appointmentRoutes = require("./src/routes/AppointmentRoutes")
app.use("/appointment",appointmentRoutes)

const ServiceRoutes= require("./src/routes/ServiceRoutes")
app.use("/service",ServiceRoutes)


const TestimonialRoutes= require("./src/routes/TestimonialRoutes")
app.use("/testimonials",TestimonialRoutes)

const FaqRoutes=require("./src/routes/FaqRoutes")
app.use ("/FAQ", FaqRoutes)

mongoose.connect("mongodb://127.0.0.1:27017/25_node_internship").then(()=>{
    console.log("database connected")
})

const PORT = 3000
app.listen(PORT,()=>{
    console.log("server started on port", PORT)
})