//token --> controller -->
const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");
const LawyerModel = require("../models/LawyerModel");
const secret = "secret"

const authMiddleware = (req,res,next)=>{

    var token = req.headers.authorization;

    if(token){
        
        if(token.startsWith("Bearer ")){

            //remove Bearer // string split
            //Bearer mkldjoisjalsjijsijsasiao // [Bearer,tokenn]
            token = token.split(" ")[1]
            //token verify..
            try{

                const userFromToken = jwt.verify(token,secret)
                console.log(userFromToken)

                req.user = userFromToken; 

                // NEW: Check if token is expired (redundant safety check)
                if (userFromToken.exp && userFromToken.exp < Date.now() / 1000) {
                  return res.status(401).json({
                    message: "Token expired.", // NEW: Specific error
                  });
                }

                
        
                
                next()

            }catch(err){

                res.status(500).json({
                    message:"token is not valid...."
                })

            }

        }
        else{
            res.status(400).json({
                message:"token is not Bearer token"
            })
        }
        

        
    }
    else{
        res.status(400).json({
            message:"token is required.."
        })
    }
}

// Protected route middleware
const protect = async (req, res, next) => {
    try {
      // First verify the token using base auth middleware
      authMiddleware(req, res, async () => {
        // Then verify the user exists in database
        const user = await UserModel.findById(req.user.id).select('-password');
        
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found"
          });
        }
  
        req.user = user; // Attach full user object
        next();
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Authentication failed",
        error: error.message
      });
    }
  };
  
  // Lawyer authorization middleware
  const isLawyer = async (req, res, next) => {
    try {
      // First verify the token and user exists
      await protect(req, res, async () => {
        // Then check if user is a lawyer
        const lawyer = await LawyerModel.findOne({ userId: req.user._id });
        
        if (!lawyer) {
          return res.status(403).json({
            success: false,
            message: "Access denied. Lawyer authorization required"
          });
        }
  
        req.lawyer = lawyer; // Attach lawyer profile
        next();
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Authorization check failed",
        error: error.message
      });
    }
  };
  
  // Admin authorization middleware (bonus)
  const isAdmin = async (req, res, next) => {
    try {
      await protect(req, res, async () => {
        if (req.user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: "Access denied. Admin authorization required"
          });
        }
        next();
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Authorization check failed",
        error: error.message
      });
    }
  };

module.exports =  authMiddleware, isLawyer, protect, isAdmin;

