const User = require('../models/User');
const FamilyMember = require('../models/FamilyMember');
const Vehicle = require('../models/Vehicle');
const Complaint = require('../models/Complaint');
const Notice = require('../models/Notice');
const Notification = require('../models/Notification');
const config = require('../config/config');

const seedDatabase = async () => {
    try {
        console.log('🌱 Seeding database...');

        // 1. Cleanup Old Test Data
        const demoEmails = ['owner@nivasa.com', 'tenant@nivasa.com', 'resident@nivasa.com', 'admin@nivasa.com'];
        const existingDemoUsers = await User.find({
            $or: [
                {email: {$regex: /^(demo_test_|test_)/}},
                {email: {$in: demoEmails}}
            ]
        }).select('_id');
        const demoUserIds = existingDemoUsers.map(u => u._id);

        if (demoUserIds.length > 0) {
            await FamilyMember.deleteMany({userId: {$in: demoUserIds}});
            await Vehicle.deleteMany({userId: {$in: demoUserIds}});
            await Complaint.deleteMany({userId: {$in: demoUserIds}});
            await Notice.deleteMany({userId: {$in: demoUserIds}});
            await Notification.deleteMany({userId: {$in: demoUserIds}});
            await User.deleteMany({_id: {$in: demoUserIds}});
        }

        console.log('🧹 Cleaned up old demo/test data');

        // 2. Create Admin
        let admin = await User.findOne({email: config.ADMIN_EMAIL});
        if (!admin) {
            admin = await User.create({
                fullName: 'System Admin',
                email: config.ADMIN_EMAIL,
                password: config.ADMIN_PASSWORD,
                phoneNumber: '9999999999',
                role: 'admin',
                status: 'approved',
                residentType: 'Owner',
                wing: 'A',
                flatNumber: '101',
                age: 30
            });
            console.log(`✅ Admin user created: ${config.ADMIN_EMAIL}`);
        }

        // 3. Create Residents
        const residentsData = [
            {
                fullName: 'Rahul Sharma',
                email: 'owner@nivasa.com',
                password: 'Password@123',
                phoneNumber: '9876543210',
                residentType: 'Owner',
                wing: 'A',
                flatNumber: '102',
                status: 'approved',
                age: 35,
                gender: 'Male'
            },
            {
                fullName: 'Priya Patel',
                email: 'tenant@nivasa.com',
                password: 'Password@123',
                phoneNumber: '9876543211',
                residentType: 'Tenant',
                wing: 'B',
                flatNumber: '201',
                status: 'approved',
                age: 28,
                gender: 'Female'
            },
            {
                fullName: 'Amit Singh',
                email: 'resident@nivasa.com',
                password: 'Password@123',
                phoneNumber: '9876543212',
                residentType: 'Owner',
                wing: 'C',
                flatNumber: '303',
                status: 'pending',
                age: 40,
                gender: 'Male'
            }
        ];

        const residents = [];
        for (const resData of residentsData) {
            const user = await User.create(resData);
            residents.push(user);
        }
        console.log(`✅ ${residents.length} Residents created`);

        const ownerUser = residents[0]; // Rahul
        const tenantUser = residents[1]; // Priya

        // 4. Add Family Members
        const familyMembers = [
            {
                userId: ownerUser._id,
                fullName: 'Anjali Sharma',
                relation: 'Spouse',
                age: 32,
                gender: 'Female',
                phone: '9876543220'
            },
            {
                userId: ownerUser._id,
                fullName: 'Rohan Sharma',
                relation: 'Child',
                age: 10,
                gender: 'Male'
            },
            {
                userId: tenantUser._id,
                fullName: 'Vikram Patel',
                relation: 'Sibling',
                age: 25,
                gender: 'Male',
                phone: '9876543230'
            }
        ];

        for (const fam of familyMembers) {
            const f = await FamilyMember.create(fam);
            await User.findByIdAndUpdate(fam.userId, {$push: {familyMembers: f._id}});
        }
        console.log('✅ Family members added');

        // 5. Add Vehicles
        const vehicles = [
            {
                userId: ownerUser._id,
                vehicleType: 'Car',
                vehicleName: 'Honda City',
                vehicleModel: '2023',
                vehicleColor: 'White',
                vehicleNumber: 'MH12AB1234',
                parkingSlot: 'A-102-P1',
                status: 'approved'
            },
            {
                userId: ownerUser._id,
                vehicleType: 'Bike',
                vehicleName: 'Honda Activa',
                vehicleModel: '6G',
                vehicleColor: 'Blue',
                vehicleNumber: 'MH12CD5678',
                parkingSlot: 'A-102-P2',
                status: 'pending'
            },
            {
                userId: tenantUser._id,
                vehicleType: 'Bike',
                vehicleName: 'Royal Enfield',
                vehicleModel: 'Classic 350',
                vehicleColor: 'Black',
                vehicleNumber: 'MH12XY9876',
                parkingSlot: 'B-201-P1',
                status: 'approved'
            },
            {
                userId: tenantUser._id,
                vehicleType: 'Car',
                vehicleName: 'Maruti Swift',
                vehicleModel: '2022',
                vehicleColor: 'Red',
                vehicleNumber: 'MH04EF3456',
                parkingSlot: 'B-201-P2',
                status: 'rejected'
            }
        ];

        for (const veh of vehicles) {
            const v = await Vehicle.create(veh);
            await User.findByIdAndUpdate(veh.userId, {$push: {vehicles: v._id}});
        }
        console.log('✅ Vehicles added');

        // 6. Create Complaints
        const complaints = [
            {
                userId: ownerUser._id,
                title: 'Leaking Tap in Kitchen',
                description: 'The kitchen tap has been leaking for 2 days. Water is dripping continuously and wasting water.',
                category: 'plumbing',
                priority: 'medium',
                status: 'pending'
            },
            {
                userId: tenantUser._id,
                title: 'Street Light Not Working',
                description: 'The street light near B wing entrance is flickering and sometimes goes off completely at night.',
                category: 'electrical',
                priority: 'low',
                status: 'resolved',
                adminResponse: 'Bulb replaced by maintenance team.'
            },
            {
                userId: ownerUser._id,
                title: 'Gym AC Not Cooling',
                description: 'The AC in the gym is not cooling properly. Temperature stays high even at full blast.',
                category: 'other',
                priority: 'high',
                status: 'in_progress',
                adminResponse: 'Technician scheduled for tomorrow.'
            },
            {
                userId: tenantUser._id,
                title: 'Noise from Construction',
                description: 'Loud construction noise after 9 PM from adjacent building. This is disturbing sleep.',
                category: 'noise',
                priority: 'high',
                status: 'pending'
            },
            {
                userId: ownerUser._id,
                title: 'Parking Area Cleaning',
                description: 'Parking area in Wing A has not been cleaned for a week. Oil stains and garbage visible.',
                category: 'cleaning',
                priority: 'medium',
                status: 'closed',
                adminResponse: 'Housekeeping team has cleaned the parking area.'
            }
        ];

        for (const comp of complaints) {
            const c = await Complaint.create(comp);
            await User.findByIdAndUpdate(comp.userId, {$push: {complaints: c._id}});
        }
        console.log('✅ Complaints created');

        // 7. Create Notices
        const notices = [
            {
                title: 'Annual General Meeting',
                description: 'The AGM will be held on Sunday, 10th Dec at 10 AM in the Clubhouse. All residents are requested to attend.',
                category: 'event',
                priority: 'high',
                userId: admin._id
            },
            {
                title: 'Swimming Pool Maintenance',
                description: 'The pool will be closed for cleaning from Monday to Wednesday. Please plan accordingly.',
                category: 'maintenance',
                priority: 'medium',
                userId: admin._id
            },
            {
                title: 'Society Maintenance Fee Due',
                description: 'Quarterly maintenance fees of ₹5000 are due by 15th of this month. Late payment will attract 2% penalty.',
                category: 'payment',
                priority: 'high',
                userId: admin._id
            },
            {
                title: 'New Security Protocol',
                description: 'Starting next week, all visitors must register at the gate with valid ID proof. Residents need to pre-approve visitors via the app.',
                category: 'security',
                priority: 'medium',
                userId: admin._id
            },
            {
                title: 'Diwali Celebration',
                description: 'Society Diwali celebration on Saturday evening at 7 PM in the garden area. Cultural performances, snacks, and fireworks included.',
                category: 'event',
                priority: 'low',
                userId: admin._id
            }
        ];

        await Notice.insertMany(notices);
        console.log('✅ Notices created');

        // 8. Create Notifications
        const notifications = [
            {
                userId: ownerUser._id,
                title: 'Complaint Status Updated',
                message: 'Your complaint "Gym AC Not Cooling" has been marked as in-progress.',
                type: 'status_update',
                relatedModel: 'Other',
                isRead: false
            },
            {
                userId: ownerUser._id,
                title: 'Vehicle Approved',
                message: 'Your vehicle Honda City (MH12AB1234) has been approved for parking.',
                type: 'success',
                relatedModel: 'Vehicle',
                isRead: true
            },
            {
                userId: ownerUser._id,
                title: 'New Notice: Society Maintenance Fee Due',
                message: 'A new notice regarding maintenance fees has been posted. Please check the notices section.',
                type: 'info',
                relatedModel: 'Notice',
                isRead: false
            },
            {
                userId: tenantUser._id,
                title: 'Complaint Resolved',
                message: 'Your complaint "Street Light Not Working" has been resolved. Bulb replaced by maintenance team.',
                type: 'success',
                relatedModel: 'Other',
                isRead: false
            },
            {
                userId: tenantUser._id,
                title: 'Vehicle Registration Rejected',
                message: 'Your vehicle Maruti Swift (MH04EF3456) registration has been rejected. Please contact admin.',
                type: 'error',
                relatedModel: 'Vehicle',
                isRead: false
            },
            {
                userId: tenantUser._id,
                title: 'Welcome to Nivasa',
                message: 'Your account has been approved. You can now access all resident features.',
                type: 'info',
                relatedModel: 'User',
                isRead: true
            },
            {
                userId: ownerUser._id,
                title: 'Security Alert',
                message: 'New security protocol starting next week. Please check the notice board for details.',
                type: 'warning',
                relatedModel: 'Notice',
                isRead: false
            }
        ];

        await Notification.insertMany(notifications);
        console.log('✅ Notifications created');

        console.log('');
        console.log('==========================================');
        console.log('✨ Database seeding completed successfully!');
        console.log('==========================================');
        console.log('');
        console.log('📋 Demo Accounts:');
        console.log('  Admin:    admin@nivasa.com / admin123');
        console.log('  Owner:    owner@nivasa.com / Password@123');
        console.log('  Tenant:   tenant@nivasa.com / Password@123');
        console.log('  Pending:  resident@nivasa.com / Password@123');
        console.log('');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
};

module.exports = seedDatabase;
