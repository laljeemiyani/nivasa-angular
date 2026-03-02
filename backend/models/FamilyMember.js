const mongoose = require('mongoose');
const {validateCommonEmail} = require('../utils/validators');

const familyMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  relation: {
    type: String,
    required: [true, 'Relation is required'],
    trim: true,
    maxlength: [50, 'Relation cannot exceed 50 characters']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Phone number must be exactly 10 digits']
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
      validate: {
          validator: function (v) {
              return v === undefined || v === '' || validateCommonEmail(v);
          },
          message: 'Please enter a valid email address'
      }
  },
  age: {
    type: Number,
      min: [0, 'Age must be 0 or greater'],
    max: [120, 'Age cannot exceed 120']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
familyMemberSchema.index({ userId: 1 });

module.exports = mongoose.model('FamilyMember', familyMemberSchema);
