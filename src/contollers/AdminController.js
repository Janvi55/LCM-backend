const AdminModel = require('../models/AdminModel');
const UserModel = require('../models/UserModel');
const CaseModel = require('../models/CaseModel');
const BillingModel = require('../models/BillingModel');

// Grant admin privileges to a user
exports.createAdmin = async (req, res) => {
  try {
    const { userId, permissions } = req.body;
    
    const admin = new AdminModel({
      userId,
      permissions: permissions || ['view_analytics'] // Default permissions
    });

    await admin.save();
    res.status(201).json(admin);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get system-wide analytics
exports.getSystemAnalytics = async (req, res) => {
  try {
    const stats = await Promise.all([
      UserModel.countDocuments(),
      CaseModel.countDocuments(),
      BillingModel.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$amount' } } }])
    ]);

    res.json({
      totalUsers: stats[0],
      totalCases: stats[1],
      totalRevenue: stats[2][0]?.totalRevenue || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// Get all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await AdminModel.find().populate('userId', 'firstName lastName email');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update admin permissions
exports.updateAdminPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    const admin = await AdminModel.findByIdAndUpdate(
      req.params.id,
      { permissions },
      { new: true }
    );
    res.json(admin);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};