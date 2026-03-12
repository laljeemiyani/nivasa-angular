const Notification = require('../models/Notification');
const User = require('../models/User');

// Create a new notification
const createNotification = async (req, res) => {
  try {
    const { userId, title, message, type, relatedModel, relatedId } = req.body;

    const notification = new Notification({
      userId,
      title,
      message,
      type: type || 'info',
      relatedModel: relatedModel || 'Other',
      relatedId: relatedId || null
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: { notification }
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
};

// Create notification (internal function for other controllers to use)
const createNotificationInternal = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Internal notification creation error:', error);
    throw error;
  }
};

// Notify all admins (internal helper)
const notifyAdmins = async ({ title, message, type, relatedModel, relatedId }) => {
  try {
    // Include admins where isDeleted is false or not set (legacy records)
    const admins = await User.find({ role: 'admin', $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }] });
    if (!admins.length) {
      console.warn('notifyAdmins: no admin users found; skipping notification.');
      return;
    }
    const payload = {
      title,
      message,
      type: type || 'info',
      relatedModel: relatedModel || 'User',
      relatedId: relatedId || null,
      routingType: 'SYSTEM'
    };
    for (const admin of admins) {
      try {
        await createNotificationInternal({ ...payload, userId: admin._id });
      } catch (err) {
        console.error('Failed to create notification for admin', admin._id, err.message);
      }
    }
  } catch (error) {
    console.error('Failed to notify admins:', error);
  }
};

// Get user notifications with pagination and filters
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const isRead = req.query.isRead !== undefined ? req.query.isRead === 'true' : undefined;
    const type = req.query.type;
    const relatedModel = req.query.relatedModel;

    const filter = { userId, isDeleted: false };

    if (isRead !== undefined) {
      filter.isRead = isRead;
    }
    if (type) {
      filter.type = type;
    }
    if (relatedModel) {
      filter.relatedModel = relatedModel;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Notification.countDocuments(filter);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({ _id: notificationId, userId, isDeleted: false });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { userId, isRead: false, isDeleted: false },
      { $set: { isRead: true } }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    const notification = await Notification.findOne({
      _id: notificationId,
      ...(isAdmin ? {} : { userId }),
      isDeleted: false
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.isDeleted = true;
    notification.deletedAt = new Date();
    notification.deletedBy = userId;

    await notification.save();

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Notification.countDocuments({ userId, isRead: false, isDeleted: false });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread notification count',
      error: error.message
    });
  }
};

module.exports = {
  createNotification,
  createNotificationInternal,
  notifyAdmins,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount
};