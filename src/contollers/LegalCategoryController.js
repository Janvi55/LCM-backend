const LegalCategory = require('../models/LegalCategory');
const Lawyer = require('../models/LawyerModel');
const { uploadToCloudinary } = require('../utils/CloudinaryUtil');
const { paginate } = require('../utils/pagination');

// @desc    Get all categories with lawyer counts (for directory page)
// @route   GET /api/categories
// @access  Public
const getAllCategories = async (req, res) => {
  try {
    const categories = await LegalCategory.aggregate([
      {
        $lookup: {
          from: 'lawyers',
          localField: 'slug',
          foreignField: 'practiceAreas',
          as: 'lawyers'
        }
      },
      {
        $project: {
          slug: 1,
          displayName: 1,
          description: 1,
          icon: 1,
          lawyerCount: { $size: '$lawyers' },
          featuredLawyers: {
            $slice: [
              {
                $map: {
                  input: '$lawyers',
                  as: 'lawyer',
                  in: {
                    _id: '$$lawyer._id',
                    name: '$$lawyer.name',
                    rating: '$$lawyer.rating',
                    profilePicture: '$$lawyer.profilePicture'
                  }
                }
              },
              3
            ]
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get lawyers by category (LawRato-style directory)
// @route   GET /api/categories/:slug/lawyers
// @access  Public
const getLawyersByCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const { 
      page = 1, 
      limit = 10,
      city, 
      minRating = 4,
      minExperience,
      maxFee,
      sortBy = 'rating' 
    } = req.query;

    // Validate category exists
    const category = await LegalCategory.findOne({ slug });
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Build filters
    const filters = {
      practiceAreas: slug,
      isVerified: true,
      ...(city && { 'address.city': new RegExp(city, 'i') }),
      ...(minRating && { 'rating.average': { $gte: Number(minRating) } }),
      ...(minExperience && { experience: { $gte: Number(minExperience) } }),
      ...(maxFee && { consultationFee: { $lte: Number(maxFee) } })
    };

    // Sorting options
    const sortOptions = {
      rating: { 'rating.average': -1 },
      experience: { experience: -1 },
      price_asc: { consultationFee: 1 },
      price_desc: { consultationFee: -1 },
      newest: { createdAt: -1 }
    };

    // Get paginated lawyers
    const result = await paginate(
      Lawyer,
      filters,
      sortOptions[sortBy] || sortOptions.rating,
      page,
      limit,
      [
        'name',
        'specializations',
        'rating',
        'experience',
        'consultationFee',
        'profilePicture',
        'languages',
        'address'
      ]
    );

    res.status(200).json({
      success: true,
      category: {
        _id: category._id,
        name: category.displayName,
        description: category.description
      },
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create new legal category (Admin only)
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { slug, displayName, description } = req.body;

    // Handle icon upload
    let icon;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, 'category-icons');
      icon = result.secure_url;
    }

    const category = new LegalCategory({
      slug,
      displayName,
      description,
      icon
    });

    await category.save();

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Category with this slug already exists'
      });
    }
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update legal category (Admin only)
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // Handle icon update
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, 'category-icons');
      updates.icon = result.secure_url;
    }

    const category = await LegalCategory.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete legal category (Admin only)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await LegalCategory.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Optional: Remove this category from all lawyers
    await Lawyer.updateMany(
      { practiceAreas: category.slug },
      { $pull: { practiceAreas: category.slug } }
    );

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get category metadata for SEO
// @route   GET /api/categories/:slug/meta
// @access  Public
const getCategoryMetadata = async (req, res) => {
  try {
    const category = await LegalCategory.findOne(
      { slug: req.params.slug },
      'displayName description icon'
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        title: category.displayName,
        description: category.description,
        image: category.icon,
        url: `/categories/${req.params.slug}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get services by category slug
// @route   GET /api/categories/:slug/services
// @access  Public
const getServicesByCategory = async (req, res) => {
    try {
      const { slug } = req.params;
      const { 
        page = 1, 
        limit = 10,
        minPrice,
        maxPrice,
        city,
        sort = 'rating' 
      } = req.query;
  
      // Find the category first
      const category = await LegalCategory.findOne({ slug });
      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }
  
      // Build filters
      const filters = { 
        practiceArea: category._id,
        status: 'active' // Only show active services
      };
  
      // Price filtering
      if (minPrice || maxPrice) {
        filters['pricing.baseAmount'] = {};
        if (minPrice) filters['pricing.baseAmount'].$gte = Number(minPrice);
        if (maxPrice) filters['pricing.baseAmount'].$lte = Number(maxPrice);
      }
  
      // City filtering
      if (city) {
        filters['lawyer.address.city'] = new RegExp(city, 'i');
      }
  
      // Sorting options
      const sortOptions = {
        rating: { 'lawyer.rating.average': -1 },
        price_asc: { 'pricing.baseAmount': 1 },
        price_desc: { 'pricing.baseAmount': -1 },
        newest: { createdAt: -1 }
      };
  
      // Get paginated services with lawyer details
      const result = await paginate(
        LegalService,
        filters,
        sortOptions[sort] || sortOptions.rating,
        page,
        limit,
        [
          'title',
          'slug',
          'description',
          'subCategory',
          'pricing',
          'lawyer',
          'processFlow'
        ],
        [
          {
            path: 'lawyer',
            select: 'name rating experience consultationFee profilePicture address'
          },
          {
            path: 'practiceArea',
            select: 'displayName slug'
          }
        ]
      );
  
      res.status(200).json({
        success: true,
        category: {
          _id: category._id,
          name: category.displayName,
          description: category.description
        },
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  // @desc    Get category details by slug
// @route   GET /api/categories/:slug
// @access  Public
const getCategoryDetails = async (req, res) => {
    try {
      const category = await LegalCategory.findOne({ slug: req.params.slug })
        .populate({
          path: 'subcategories',
          select: 'slug displayName icon'
        });
  
      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }
  
      // Get some basic stats
      const [lawyerCount, serviceCount] = await Promise.all([
        Lawyer.countDocuments({ 
          practiceAreas: category.slug,
          isVerified: true 
        }),
        LegalService.countDocuments({ 
          practiceArea: category._id,
          status: 'active' 
        })
      ]);
  
      // Get featured services (optional)
      const featuredServices = await LegalService.find({
        practiceArea: category._id,
        status: 'active',
        isFeatured: true
      })
      .limit(4)
      .select('title slug pricing lawyer')
      .populate('lawyer', 'name rating profilePicture');
  
      res.status(200).json({
        success: true,
        data: {
          ...category.toObject(),
          stats: {
            lawyerCount,
            serviceCount
          },
          featuredServices
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  
// @desc    Get category details by slug
// @route   GET /api/categories/:slug
// @access  Public
const getCategory = async (req, res) => {
    try {
      const { slug } = req.params;
  
      // Find category by slug and populate basic information
      const category = await LegalCategory.findOne({ slug })
        .select('displayName description icon slug subcategories')
        .populate({
          path: 'subcategories',
          select: 'slug displayName icon -_id'
        });
  
      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }
  
      // Get additional statistics (counts of lawyers and services)
      const [lawyerCount, serviceCount] = await Promise.all([
        Lawyer.countDocuments({ 
          practiceAreas: slug,
          isVerified: true 
        }),
        LegalService.countDocuments({ 
          practiceArea: category._id,
          status: 'active' 
        })
      ]);
  
      // Get featured services (optional)
      const featuredServices = await LegalService.find({
        practiceArea: category._id,
        status: 'active',
        isFeatured: true
      })
      .limit(4)
      .select('title slug pricing lawyer')
      .populate('lawyer', 'name rating profilePicture');
  
      res.status(200).json({
        success: true,
        data: {
          ...category.toObject(),
          stats: {
            lawyerCount,
            serviceCount
          },
          featuredServices
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };
  // @desc    Search categories by name or description
// @route   GET /api/search/categories
// @access  Public
const searchCategories = async (req, res) => {
    try {
      const { q: searchQuery, limit = 5 } = req.query;
  
      if (!searchQuery || searchQuery.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }
  
      const categories = await LegalCategory.find({
        $or: [
          { displayName: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } }
        ]
      })
      .select('displayName slug icon description')
      .limit(parseInt(limit))
      .sort({ displayName: 1 });
  
      res.status(200).json({
        success: true,
        count: categories.length,
        data: categories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };
// @desc    Get category analytics for admin dashboard
// @route   GET /api/categories/analytics
// @access  Private/Admin
const getCategoryAnalytics = async (req, res) => {
    try {
      const categories = await LegalCategory.aggregate([
        {
          $lookup: {
            from: 'legalservices',
            localField: '_id',
            foreignField: 'practiceArea',
            as: 'services'
          }
        },
        {
          $lookup: {
            from: 'lawyers',
            localField: 'slug',
            foreignField: 'practiceAreas',
            as: 'lawyers'
          }
        },
        {
          $project: {
            name: '$displayName',
            slug: 1,
            totalServices: { $size: '$services' },
            activeServices: {
              $size: {
                $filter: {
                  input: '$services',
                  as: 'service',
                  cond: { $eq: ['$$service.status', 'active'] }
                }
              }
            },
            totalLawyers: { $size: '$lawyers' },
            verifiedLawyers: {
              $size: {
                $filter: {
                  input: '$lawyers',
                  as: 'lawyer',
                  cond: { $eq: ['$$lawyer.verification.isVerified', true] }
                }
              }
            },
            monthlyGrowth: {
              $size: {
                $filter: {
                  input: '$services',
                  as: 'service',
                  cond: { 
                    $gte: [
                      '$$service.createdAt', 
                      new Date(new Date().setMonth(new Date().getMonth() - 1))
                    ]
                  }
                }
              }
            }
          }
        },
        { $sort: { totalServices: -1 } }
      ]);
  
      // Calculate totals
      const totals = categories.reduce((acc, category) => ({
        totalServices: acc.totalServices + category.totalServices,
        activeServices: acc.activeServices + category.activeServices,
        totalLawyers: acc.totalLawyers + category.totalLawyers,
        verifiedLawyers: acc.verifiedLawyers + category.verifiedLawyers
      }), { totalServices: 0, activeServices: 0, totalLawyers: 0, verifiedLawyers: 0 });
  
      res.status(200).json({
        success: true,
        data: {
          categories,
          totals,
          lastUpdated: new Date()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  // @desc    Update category status (active/inactive)
// @route   PATCH /api/categories/:id/status
// @access  Private/Admin
const updateCategoryStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
  
      if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Status must be either "active" or "inactive"'
        });
      }
  
      const updateData = { status };
      if (status === 'inactive' && reason) {
        updateData.inactiveReason = reason;
      } else {
        updateData.inactiveReason = undefined;
      }
  
      const category = await LegalCategory.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
  
      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }
  
      // Cascade status to related services if needed
      if (status === 'inactive') {
        await LegalService.updateMany(
          { practiceArea: category._id },
          { status: 'inactive' }
        );
      }
  
      res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

module.exports = {
    getAllCategories,
    getCategory,
    getLawyersByCategory,
    searchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryMetadata,
  getCategoryDetails,
  getServicesByCategory,
  getCategoryAnalytics,
  updateCategoryStatus
}