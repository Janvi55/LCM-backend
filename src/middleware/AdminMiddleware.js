const AdminModel = require('../models/AdminModel');

const adminMiddleware = async (req, res, next) => {
    
    // 1. Check if user exists (from authMiddleware)
    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized: User not authenticated."
        });
    }

    try {
        // 2. Check admin status in database
        const admin = await AdminModel.findOne({ userId: req.user._id });
        
        if (!admin) {
            return res.status(403).json({
                message: "Forbidden: Admin access required."
            });
        }

        // 3. Attach permissions to request
        req.adminPermissions = admin.permissions;
        next();

    } catch (err) {
        res.status(500).json({
            message: "Admin verification failed.",
            error: err.message
        });
    }
};

module.exports = adminMiddleware;