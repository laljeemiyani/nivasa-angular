const FamilyMember = require('../models/FamilyMember');

// Add family member
const addFamilyMember = async (req, res) => {
  try {
    const {
      fullName,
      relation,
      phone,
      email,
      age,
      gender
    } = req.body;

    const familyMember = new FamilyMember({
      userId: req.user._id,
      fullName,
      relation,
      phone,
      email,
      age,
      gender
    });

    await familyMember.save();

    res.status(201).json({
      success: true,
      message: 'Family member added successfully',
      data: { familyMember }
    });
  } catch (error) {
    console.error('Add family member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add family member',
      error: error.message
    });
  }
};

// Get user's family members
const getFamilyMembers = async (req, res) => {
  try {
    const familyMembers = await FamilyMember.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { familyMembers }
    });
  } catch (error) {
    console.error('Get family members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch family members',
      error: error.message
    });
  }
};

// Get single family member
const getFamilyMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    const familyMember = await FamilyMember.findOne({
      _id: memberId,
      userId: req.user._id
    });

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: 'Family member not found'
      });
    }

    res.json({
      success: true,
      data: { familyMember }
    });
  } catch (error) {
    console.error('Get family member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch family member',
      error: error.message
    });
  }
};

// Update family member
const updateFamilyMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const {
      fullName,
      relation,
      phone,
      email,
      age,
      gender
    } = req.body;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (relation) updateData.relation = relation;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;
    if (age) updateData.age = age;
    if (gender) updateData.gender = gender;

    const familyMember = await FamilyMember.findOneAndUpdate(
      { _id: memberId, userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: 'Family member not found'
      });
    }

    res.json({
      success: true,
      message: 'Family member updated successfully',
      data: { familyMember }
    });
  } catch (error) {
    console.error('Update family member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update family member',
      error: error.message
    });
  }
};

// Delete family member
const deleteFamilyMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    const familyMember = await FamilyMember.findOneAndDelete({
      _id: memberId,
      userId: req.user._id
    });

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: 'Family member not found'
      });
    }

    res.json({
      success: true,
      message: 'Family member deleted successfully'
    });
  } catch (error) {
    console.error('Delete family member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete family member',
      error: error.message
    });
  }
};

module.exports = {
  addFamilyMember,
  getFamilyMembers,
  getFamilyMember,
  updateFamilyMember,
  deleteFamilyMember
};
