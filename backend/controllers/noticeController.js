const Notice = require('../models/Notice');
const User = require('../models/User');

// Create new notice (Admin only)
const createNotice = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            category,
            expiryDate
        } = req.body;

        const notice = new Notice({
            userId: req.user._id,
            title,
            description,
            priority: priority || 'medium',
            category: category || 'general',
            expiryDate: expiryDate ? new Date(expiryDate) : null
        });

        await notice.save();

        const populatedNotice = await Notice.findById(notice._id)
            .populate('userId', 'fullName');

        // After creating a notice, broadcast a notification to all residents
        try {
            // Fetch all active residents
            const residents = await User.find(
                { role: 'resident', isDeleted: false },
                '_id'
            ).lean();

            if (residents.length) {
                const Notification = require('../models/Notification');

                // Map priority to existing notification types
                const p = (priority || 'medium').toLowerCase();
                let notifType = 'info';
                if (p === 'high') {
                    notifType = 'warning';
                } else if (p === 'medium') {
                    notifType = 'info';
                } else if (p === 'low') {
                    notifType = 'info';
                }

                const cat = (category || 'general');
                const titleText = `New ${cat.charAt(0).toUpperCase() + cat.slice(1)} Notice`;
                const messageText = `${title} - ${description}`.slice(0, 300);

                const notificationsToInsert = residents.map((r) => ({
                    userId: r._id,
                    title: titleText,
                    message: messageText,
                    type: notifType, // must be one of: info, success, warning, error, status_update, new_registration, parking_request
                    routingType: 'BROADCAST', // valid routing type for global messages
                    referenceId: notice._id,
                    relatedModel: 'Notice',
                    relatedId: notice._id
                }));

                await Notification.insertMany(notificationsToInsert, { ordered: false });
            }
        } catch (notifError) {
            console.error('Failed to broadcast notice notification:', notifError);
        }

        res.status(201).json({
            success: true,
            message: 'Notice created successfully',
            data: {notice: populatedNotice}
        });
    } catch (error) {
        console.error('Create notice error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create notice',
            error: error.message
        });
    }
};

// Get all notices with pagination and filters
const getNotices = async (req, res) => {
    try {


        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const category = req.query.category;
        const priority = req.query.priority;
        const search = req.query.search;

        const isAdmin = req.user && req.user.role === 'admin';

        // For residents/public: always show only active notices
        // For admins: respect explicit isActive flag, otherwise show all
        let isActive = true;
        if (isAdmin) {
            if (req.query.hasOwnProperty('isActive')) {
                isActive = req.query.isActive !== 'false';
            } else {
                isActive = undefined; // no isActive filter for admins by default
            }
        }

        // Start with basic filter
        const filter = {};

        if (typeof isActive === 'boolean') {
            filter.isActive = isActive;
        }

        // Add category filter (case-insensitive)
        if (category && category.trim() !== '') {
            filter.category = new RegExp(`^${category.trim()}$`, 'i');
        }

        // Add priority filter (case-insensitive)
        if (priority && priority.trim() !== '') {
            filter.priority = new RegExp(`^${priority.trim()}$`, 'i');
        }

        // Add search functionality
        if (search && search.trim() !== '') {
            filter.$or = [
                {title: new RegExp(search.trim(), 'i')},
                {description: new RegExp(search.trim(), 'i')}
            ];
        }

        // Only filter out expired notices if we're showing active notices
        if (isActive === true) {
            // include notices that expire today (inclusive)
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // server local midnight

            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    {expiryDate: null},
                    {expiryDate: {$gte: startOfToday}} // >= start of today
                ]
            });
        }

        // Count total documents first
        const total = await Notice.countDocuments(filter);

        // If no documents match, return empty result
        if (total === 0) {
            return res.json({
                success: true,
                data: {
                    notices: [],
                    pagination: {
                        currentPage: page,
                        totalPages: 0,
                        totalItems: 0,
                        itemsPerPage: limit
                    }
                }
            });
        }

        // Fetch the actual notices
        const notices = await Notice.find(filter)
            .populate('userId', 'fullName')
            .sort({priority: -1, createdAt: -1})
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            success: true,
            data: {
                notices,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: limit
                }
            }
        });
    } catch (error) {
        console.error('Get notices error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notices',
            error: error.message
        });
    }
};

// Get single notice
const getNotice = async (req, res) => {
    try {
        const {noticeId} = req.params;

        const notice = await Notice.findById(noticeId)
            .populate('userId', 'fullName');

        if (!notice) {
            return res.status(404).json({
                success: false,
                message: 'Notice not found'
            });
        }

        res.json({
            success: true,
            data: {notice}
        });
    } catch (error) {
        console.error('Get notice error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notice',
            error: error.message
        });
    }
};

// Update notice (Admin only)
const updateNotice = async (req, res) => {
    try {
        const {noticeId} = req.params;
        const {
            title,
            description,
            priority,
            category,
            isActive,
            expiryDate
        } = req.body;

        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (priority) updateData.priority = priority;
        if (category) updateData.category = category;
        if (typeof isActive === 'boolean') updateData.isActive = isActive;
        if (expiryDate) updateData.expiryDate = new Date(expiryDate);

        const notice = await Notice.findByIdAndUpdate(
            noticeId,
            updateData,
            {new: true, runValidators: true}
        ).populate('userId', 'fullName');

        if (!notice) {
            return res.status(404).json({
                success: false,
                message: 'Notice not found'
            });
        }

        res.json({
            success: true,
            message: 'Notice updated successfully',
            data: {notice}
        });
    } catch (error) {
        console.error('Update notice error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update notice',
            error: error.message
        });
    }
};

// Delete notice (Admin only)
const deleteNotice = async (req, res) => {
    try {
        const {noticeId} = req.params;

        const notice = await Notice.findByIdAndDelete(noticeId);

        if (!notice) {
            return res.status(404).json({
                success: false,
                message: 'Notice not found'
            });
        }

        res.json({
            success: true,
            message: 'Notice deleted successfully'
        });
    } catch (error) {
        console.error('Delete notice error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notice',
            error: error.message
        });
    }
};

// Get notice statistics (Admin only)
const getNoticeStats = async (req, res) => {
    try {
        const [
            totalNotices,
            activeNotices,
            expiredNotices,
            noticesByCategory,
            noticesByPriority
        ] = await Promise.all([
            Notice.countDocuments(),
            Notice.countDocuments({isActive: true}),
            Notice.countDocuments({
                isActive: true,
                expiryDate: {$lt: new Date()}
            }),
            Notice.aggregate([
                {$group: {_id: '$category', count: {$sum: 1}}}
            ]),
            Notice.aggregate([
                {$group: {_id: '$priority', count: {$sum: 1}}}
            ])
        ]);

        res.json({
            success: true,
            data: {
                totalNotices,
                activeNotices,
                expiredNotices,
                noticesByCategory,
                noticesByPriority
            }
        });
    } catch (error) {
        console.error('Get notice stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notice statistics',
            error: error.message
        });
    }
};

module.exports = {
    createNotice,
    getNotices,
    getNotice,
    updateNotice,
    deleteNotice,
    getNoticeStats
};