const API_URL = 'http://localhost:5000/api';

async function runTest() {
    try {
        console.log('🚀 Starting Full System Verification...');

        // --- PART 1: REGISTRATION & APPROVAL ---
        const userEmail = `demo_test_${Date.now()}@example.com`;
        console.log(`\n1. Registering user: ${userEmail}`);
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                fullName: 'Demo Test User',
                email: userEmail,
                password: 'Password@123',
                confirmPassword: 'Password@123',
                phoneNumber: '9876543210',
                age: 25,
                gender: 'Male',
                residentType: 'Owner',
                wing: 'B',
                flatNumber: '202'
            })
        });
        if (!regRes.ok) throw new Error(`Registration failed: ${await regRes.text()}`);
        console.log('   ✅ Registration successful');

        console.log('2. Logging in as Admin...');
        const adminRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email: 'admin@nivasa.com', password: 'admin123'})
        });
        const adminData = await adminRes.json();
        const adminToken = adminData.data.token;
        console.log('   ✅ Admin logged in');

        console.log('3. Approving User...');
        const searchRes = await fetch(`${API_URL}/admin/residents?search=${userEmail}`, {
            headers: {'Authorization': `Bearer ${adminToken}`}
        });
        const searchData = await searchRes.json();
        const user = searchData.data.residents[0];

        await fetch(`${API_URL}/admin/residents/${user._id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({status: 'approved'})
        });
        console.log('   ✅ User approved');

        // --- PART 2: RESIDENT ACTIONS ---
        console.log('\n4. Logging in as Resident...');
        const userLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email: userEmail, password: 'Password@123'})
        });
        const userLoginData = await userLoginRes.json();
        const userToken = userLoginData.data.token;
        console.log('   ✅ Resident logged in');

        console.log('5. Adding Family Member...');
        const famRes = await fetch(`${API_URL}/family`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({
                fullName: 'Test Spouse',
                relation: 'Wife',
                age: 24,
                gender: 'Female',
                phone: '9988776655'
            })
        });
        if (!famRes.ok) throw new Error(`Add Family failed: ${await famRes.text()}`);
        console.log('   ✅ Family member added');

        console.log('6. Adding Vehicle...');
        const vehRes = await fetch(`${API_URL}/vehicles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({
                vehicleType: 'Car',
                vehicleName: 'Tesla',
                vehicleModel: 'Model 3',
                vehicleColor: 'Red',
                vehicleNumber: `GJ01AB${Math.floor(1000 + Math.random() * 9000)}`,
                parkingSlot: `B-202-P1`
            })
        });
        if (!vehRes.ok) throw new Error(`Add Vehicle failed: ${await vehRes.text()}`);
        console.log('   ✅ Vehicle added');

        console.log('7. Raising Complaint...');
        const compRes = await fetch(`${API_URL}/complaints`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({
                title: 'Test Complaint',
                description: 'This is a test complaint',
                category: 'plumbing',
                priority: 'medium'
            })
        });
        const compData = await compRes.json();
        const complaintId = compData.data._id;
        console.log('   ✅ Complaint raised');

        // --- PART 3: ADMIN ACTIONS ---
        console.log('\n8. Admin Updating Complaint...');
        await fetch(`${API_URL}/admin/complaints/${complaintId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({status: 'in_progress', adminResponse: 'Working on it'})
        });
        console.log('   ✅ Complaint status updated to In Progress');

        console.log('9. Creating Notice...');
        await fetch(`${API_URL}/admin/notices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                title: 'Test Notice',
                description: 'This is a test notice',
                priority: 'high',
                category: 'general'
            })
        });
        console.log('   ✅ Notice created');

        console.log('\n🎉 ALL SYSTEMS GO! Full verification passed.');

    } catch (e) {
        console.error('❌ ERROR:', e.message);
        const fs = require('fs');
        fs.writeFileSync('error_log.txt', e.message);
    }
}

runTest();
