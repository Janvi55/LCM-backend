

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
    //req.body email and password: password
  
    //password -->plain -->db -->encrypted
    //bcrypt  --> plain,enc --> match : true
    const email = req.body.email;
    const password = req.body.password;
    //select * from users where email =? and password = ?
    //userModel.find({email:email,password:password})
    //email --> object -->abc --{passwird:hashedPasseord}
    //normal passwoed compare -->
  
    //const foundUserFromEmail = userModel.findOne({email:req.body.email})
    const foundUserFromEmail = await userModel
      .findOne({ email: email })
      .populate("roleId");
    console.log(foundUserFromEmail);
    //check if email is exist or not//
    if (foundUserFromEmail != null) {
      //password
      //normal -plain req.bodyy --- databse -->match  --> true | false
      //const isMatch = bcrypt.compareSync(req.body.password,foundUserFromEmail.password)
      const isMatch = bcrypt.compareSync(password, foundUserFromEmail.password);
      //true | false
      if (isMatch == true) {
        res.status(200).json({
          message: "login success",
          data: foundUserFromEmail,
        });
      } else {
        res.status(404).json({
          message: "invalid cred..",
        });
      }
    } else {
      res.status(404).json({
        message: "Email not found..",
      });
    }
  };
  
  
//   const loginUserWithToken = async(req,res)=>{
  
//     const {email,password} = req.body;
  
//     const foundUserFromEmail =  await userModel.findOne({email:email})
//     if(foundUserFromEmail){
//       const isMatch = bcrypt.compareSync(password,foundUserFromEmail.password)
//       if(isMatch){
  
//         //token...
//         const token = jwt.sign(foundUserFromEmail.toObject(),secret)
//         //const token = jwt.sign({id:foundUserFromEmail._id},secret)
//         res.status(200).json({
//           message:"user loggedin..",
//           token:token
//         })
        
  
//       }
//       else{
//         res.status(420).json({
//           message:"invalid cred..."
//         })
//       }
  
//     }
//     else{
//       res.status(404).json({
//         message:"user not found.."
//       })
//     }
//   }

const loginUserWithToken = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Normalize email case
      const normalizedEmail = email.toLowerCase().trim();
      const user = await userModel.findOne({ email: normalizedEmail }).populate("roleId");
  
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "User not found" 
        });
      }
  
      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false,
          message: "Invalid credentials" 
        });
      }
      const token = jwt.sign(
        { 
          id: user._id,
          userId: user._id, // Add this if LawyerModel references "userId"
          role: user.roleId.name 
        }, 
        secret,
        { expiresIn: '1h' }
      );
  
      res.status(200).json({
        success: true,
        token,
        data: {
          _id: user._id,
          email: user.email,
          roleId: {
            name: user.roleId.name
          }
        }
      });
  
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ 
        success: false,
        message: "Server error during login" 
      });
    }
  };
  
  
// ✅ User Signup
const signup = async (req, res) => {
    try {
        const { firstName, email, phone, password } = req.body;

        // Validate required fields
        if (!firstName || !email || !password) {
            return res.status(400).json({
                message: "Missing required fields (firstName, email, password)",
                error: { code: "MISSING_FIELDS" }
            });
        }

        // Check for existing user
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                message: "User with this email already exists",
                error: { code: "DUPLICATE_EMAIL" }
            });
        }

        // Hash password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Create new user
        const newUser = await userModel.create({
            firstName,
            email,
            password: hashedPassword,
            roleId: req.body.roleId || "67bfe7326ceb8a73c701ba1e"
        });

        // Generate JWT token
        const token = jwt.sign({ id: newUser._id }, secret);

        // Send welcome email (optional)
        try {
            await mailUtil.sendingMail(
                newUser.email,
                "Welcome to Legal Consultancy",
                "Thank you for registering with us."
            );
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
        }

        res.status(201).json({
            message: "User created successfully",
            token,
            data: {
                id: newUser._id,
                firstName: newUser.firstName,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            message: "Error creating user",
            error: {
                code: "SERVER_ERROR",
                details: error.message
            }
        });
    }
};



const addUser = async (req, res) => {
    //req.body...
    const savedUser = await userModel.create(req.body);
    res.json({
      message: "User Saved Successfully",
      data: savedUser,
    });
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
        console.log(token)
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
    const token = req.body.token; //decode --> email | id
    const newPassword = req.body.password;
  
    const userFromToken = jwt.verify(token, secret);
    //object -->email,id..
    //password encrypt...
    const salt = bcrypt.genSaltSync(10);
    const hashedPasseord = bcrypt.hashSync(newPassword,salt);
  
    const updatedUser = await userModel.findByIdAndUpdate(userFromToken._id, {
      password: hashedPasseord,
    });
    res.json({
      message: "password updated successfully..",
    });
  };
  const getUserStats = async (req, res) => {
    try {
      const stats = await userModel.aggregate([
        {
          $facet: {
            totalCount: [{ $count: "count" }],
            byRole: [
              { $group: { _id: "$roleId", count: { $sum: 1 } } },
              { $lookup: { from: "roles", localField: "_id", foreignField: "_id", as: "role" } },
              { $unwind: "$role" },
              { $project: { role: "$role.name", count: 1 } }
            ],
            activeUsers: [{ $match: { active: true } }, { $count: "count" }],
            newThisWeek: [
              { 
                $match: { 
                  createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
                } 
              },
              { $count: "count" }
            ]
          }
        }
      ]);
  
      res.json({
        totalUsers: stats[0].totalCount[0]?.count || 0,
        byRole: stats[0].byRole,
        activeUsers: stats[0].activeUsers[0]?.count || 0,
        newUsersThisWeek: stats[0].newThisWeek[0]?.count || 0
      });
  
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({ message: "Error fetching stats", error: error.message });
    }
  
    
};

module.exports = {
    loginUser,
    loginUserWithToken,
    signup,
    addUser,
    getAllUsers,
    getUserById,
    deleteUserById,
    forgotPassword,
    resetPassword,
    getUserStats
};