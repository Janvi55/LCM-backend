const ClientModel = require('../models/ClientModel');

// Register new client
exports.registerClient = async (req, res) => {
  try {
    const client = new ClientModel({
      userId: req.body.userId,
      billingInfo: req.body.billingInfo
    });
    await client.save();
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get client profile
exports.getClientProfile = async (req, res) => {
  try {
    const client = await ClientModel.findById(req.params.id)
      .populate('userId', 'firstName lastName email')
      .populate('lawyers', 'firstName specialization');
    
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add lawyer to client's representation list
exports.addClientLawyer = async (req, res) => {
  try {
    const client = await ClientModel.findByIdAndUpdate(
      req.params.clientId,
      { $addToSet: { lawyers: req.params.lawyerId } },
      { new: true }
    );
    res.status(200).json(client);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Client case management
exports.createCase = async (req, res) => {
  try {
    const client = await ClientModel.findByIdAndUpdate(
      req.params.clientId,
      { $push: { cases: req.body } },
      { new: true }
    );
    res.status(201).json(client.cases[client.cases.length - 1]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Document upload (reference only - actual upload handled separately)
exports.logDocument = async (req, res) => {
  try {
    const client = await ClientModel.findByIdAndUpdate(
      req.params.clientId,
      { $push: { documents: req.body } },
      { new: true }
    );
    res.status(201).json(client.documents);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getClientStats = async (req, res) => {
    try {
      const stats = await ClientModel.aggregate([
        { $match: { lawyers: req.user._id } },
        {
          $group: {
            _id: null,
            totalClients: { $sum: 1 },
            activeClients: {
              $sum: {
                $cond: [
                  { $gt: ['$updatedAt', new Date(Date.now() - 30*24*60*60*1000)] },
                  1, 0
                ]
              }
            }
          }
        }
      ]);
      
      res.status(200).json(stats[0] || { totalClients: 0, activeClients: 0 });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get stats: ' + error.message });
    }
  };

  exports.addContactRecord = async (req, res) => {
    try {
      const client = await ClientModel.findByIdAndUpdate(
        req.params.clientId,
        {
          $push: {
            contactHistory: {
              ...req.body,
              createdBy: req.user._id
            }
          },
          $set: { 'importantDates.nextFollowUp': req.body.nextFollowUp }
        },
        { new: true }
      );
      res.status(201).json(client.contactHistory.slice(-1)[0]);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  exports.searchClientDocuments = async (req, res) => {
    try {
      const docs = await DocumentModel.find({
        clientId: req.params.clientId,
        $text: { $search: req.query.q }
      });
      res.status(200).json(docs);
    } catch (error) {
      res.status(500).json({ error: 'Search failed: ' + error.message });
    }
  };

  exports.getBillingHistory = async (req, res) => {
    try {
      const client = await ClientModel.findById(req.params.clientId)
        .select('billingHistory'); // Only fetch billing history
      
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
  
      res.status(200).json(client.billingHistory || []);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };