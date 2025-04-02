

// const loginUser= async(req, res)=> {
    
//     const email =req.body.email
//     const password = req.body.password

//     const foundUserFromEmail = await userModel.findOne({email:email}).populate("roleId")
//         console.log(foundUserFromEmail)

//         if (foundUserFromEmail !=null){

//             const isMatch=bcrypt.compareSync(password, foundUserFromEmail.password)

//             if(isMatch == true){
//                 res.status(200).json({
//                     message: "login successfull",
//                     data: foundUserFromEmail,
//                 })
//             }else{
//                 res.status(404).json({
//                     message: "invalid credentials",
//                 })
//             }
//         } else {
//             res.status(404).json({
//                 message: " Email not found",
//             })
//         }   
// }
// const signup= async(req,res)=>{

//     try{
//          const salt= bcrypt.genSaltSync(10)
//          const hashedPassword= bcrypt.hashSync(req.body.password, salt)
//          req.body.password= hashedPassword
//         const createdUser=await userModel.create(req.body)
//         await mailUtil.sendingMail(
//             createdUser.email,
//             "welcome to eadvertisement",
//             "this is welcome mail"
//           );
      
//         res.status(201).json({
//             message:"user created..",
//             data:createdUser
//         })
//     }catch(err){
//         console.log(err)
//         res.status(500).json({
//             message:"error",
//             data:err
//         })
//     }
// }

// const getAllUsers= async (req,res)=> {

//     const users= await userModel.find().populate("roleId")

//     res.json({
//         message: "user fetched succesfully",
//         data :users
//     })
// }
// const addUser= async(req, res)=>{
    
//     const savedUser = await  userModel.create(req.body)

//     res.json({
//       message:"user created...",
//       data:savedUser
//     });
//   };
  
//   const deleteUserById = async(req,res)=>{
  
//       const deletedUser = await userModel.findByIdAndDelete(req.params.id)
  
//       res.json({
//         message:"user deleted successfully..",
//         data:deletedUser
//       })
  
//   }
  
//   const getUserById = async (req,res)=>{  
//     const foundUser = await userModel.findById(req.params.id)
//     res.json({
//       message:"user fatched..",
//       data:foundUser
//     })
  
//   };
//   const forgotPassword = async (req, res) => {
//     const email = req.body.email;
//     const foundUser = await userModel.findOne({ email: email });
  
//     if (foundUser) {
//       const token = jwt.sign(foundUser.toObject(), secret);
//       console.log(token);
//       const url = `http://localhost:5173/resetpassword/${token}`;
//       const mailContent = `<html>
//                             <a href ="${url}">rest password</a>
//                             </html>`;
//       //email...
//       await mailUtil.sendingMail(foundUser.email, "reset password", mailContent);
//       res.json({
//         message: "reset password link sent to mail.",
//       });
//     } else {
//       res.json({
//         message: "user not found register first..",
//       });
//     }
//   };
  
//   const resetPassword = async (req, res) => {
//     const token = req.body.token; //decode --> email | id
//     const newPassword = req.body.password;
  
//     const userFromToken = jwt.verify(token, secret);
//     //object -->email,id..
//     //password encrypt...
//     const salt = bcrypt.genSaltSync(10);
//     const hashedPasseord = bcrypt.hashSync(newPassword,salt);
  
//     const updatedUser = await userModel.findByIdAndUpdate(userFromToken._id, {
//       password: hashedPasseord,
//     });
//     res.json({
//       message: "password updated successfully..",
//     });
//   };
  
  
//   module.exports = {
//     getAllUsers,addUser,deleteUserById,getUserById,signup,loginUser,forgotPassword,resetPassword
//   };


const userModel = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailUtil = require("../utils/MailUtil");
const secret= 'secret'


// ✅ User Login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const foundUser = await userModel.findOne({ email }).populate("roleId");

        if (!foundUser) {
            return res.status(404).json({ message: "Email not found" });
        }

        const isMatch = bcrypt.compareSync(password, foundUser.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        
        res.status(200).json({
            message: "Login successful",
            token,
            data: foundUser,
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// ✅ User Signup
const signup = async (req, res) => {
    try {
      
        // Hash Password
        const salt = bcrypt.genSaltSync(10);
        req.body.password = bcrypt.hashSync(password, salt);

        const createdUser = await userModel.create(req.body);

        // Send Welcome Email
        await mailUtil.sendingMail(
            createdUser.email,
            "Welcome to Legal Consultancy",
            "This is a welcome email."
        );

       

        res.status(201).json({
            message: "User created successfully",
            token,
            data: createdUser,
        });
    } catch (error) {
        res.status(500).json({ message: "Error", error });
    }
};

// ✅ Get All Users
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find().populate("roleId");
        res.json({ message: "Users fetched successfully", data: users });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// ✅ Get User by ID
const getUserById = async (req, res) => {
    try {
        const foundUser = await userModel.findById(req.params.id);
        if (!foundUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User fetched successfully", data: foundUser });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// ✅ Delete User by ID
const deleteUserById = async (req, res) => {
    try {
        const deletedUser = await userModel.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User deleted successfully", data: deletedUser });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// ✅ Forgot Password (Generate Reset Token)
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const foundUser = await userModel.findOne({ email });

        if (!foundUser) {
            return res.status(404).json({ message: "User not found. Register first." });
        }

        const token = jwt.sign({ id: foundUser._id,  }, secret, { expiresIn: "15m" });
        const resetUrl = `http://localhost:5173/resetpassword/${token}`;
        const mailContent = `<html><a href ="${resetUrl}">Reset Password</a></html>`;

        await mailUtil.sendingMail(foundUser.email, "Reset Password", mailContent);

        res.json({ message: "Reset password link sent to email." });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// ✅ Reset Password
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        // Verify Token
        const decoded = jwt.verify(token, secret);
       
        // Hash New Password
        
        const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

        // Update Password
        await userModel.findByIdAndUpdate(decoded.id, { password: hashedPassword });

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "invalid or expired token", error });
    }
};

module.exports = {
    loginUser,
    signup,
    getAllUsers,
    getUserById,
    deleteUserById,
    forgotPassword,
    resetPassword
};
