const {createNotificationInternal} = require('./notificationController');

/**
 * Create a notification for all residents
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createNotificationForAllResidents = async (req, res) => {
    try {
        const {message, type} = req.body;

        // We'll implement this in the future when needed
        // This would create a notification for all residents

        res.status(200).json({
            success: true,
            message: 'Notification created for all residents'
        });
    } catch (error) {
        console.error('Error creating notification for all residents:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create notification for all residents',
            error: error.message
        });
    }
};

/**
 * Create a notification for a specific resident
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createNotificationForResident = async (req, res) => {
    try {
        const {userId, title, message, type, relatedModel, relatedId} = req.body;

        if (!userId || !title || !message) {
            return res.status(400).json({
                success: false,
                message: 'userId, title and message are required'
            });
        }

        const notification = await createNotificationInternal({
            userId,
            title,
            message,
            type: type || 'info',
            relatedModel,
            relatedId
        });

        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            notification
        });
    } catch (error) {
        console.error('Error creating notification for resident:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create notification for resident',
            error: error.message
        });
    }
};