const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Generate a random 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Handle updating admin profile information
 */
const updateAdminProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { fullName, email, phoneNumber } = req.body;

        // Check if the email is already in use by a different user
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'This email is already in use by another account.'
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { fullName, email, phoneNumber },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Profile details updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server error updating profile' });
    }
};

/**
 * Generate OTP for password change and return it (development only console logging)
 */
const requestOtp = async (req, res) => {
    try {
        const userId = req.user._id;
        const { currentPassword } = req.body;

        const user = await User.findById(userId);

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid current password' });
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins from now

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        console.log(`[SECURITY] OTP requested for user ${user.email}: ${otp}`);

        res.status(200).json({
            success: true,
            message: 'OTP processed. Please enter it to continue.',
            dev_otp: otp
        });

    } catch (error) {
        console.error('Request OTP Error:', error);
        res.status(500).json({ success: false, message: 'Server generating OTP error' });
    }
};

/**
 * Verify OTP and Change Password
 */
const changePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { otp, newPassword } = req.body;

        const user = await User.findById(userId);

        if (!user.otp || !user.otpExpiry) {
            return res.status(400).json({ success: false, message: 'No active OTP request found.' });
        }

        if (new Date() > user.otpExpiry) {
            // Clear expired OTP
            user.otp = undefined;
            user.otpExpiry = undefined;
            await user.save();
            return res.status(400).json({ success: false, message: 'OTP has expired. Request a new one.' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP code.' });
        }

        // Hash the new password and increment session invalidation tracker
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpiry = undefined;
        user.sessionVersion = (user.sessionVersion || 0) + 1; // Logs out all existing sessions globally

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully! You will be logged out dynamically.',
        });

    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ success: false, message: 'Server error processing password change' });
    }
};

module.exports = {
    updateAdminProfile,
    requestOtp,
    changePassword
};
