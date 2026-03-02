const API_URL = 'http://localhost:5000/api';

async function runTest() {
    try {
        // 1. Register
        const userEmail = `delete_test_${Date.now()}@example.com`;
        console.log(`1. Registering user: ${userEmail}`);
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                fullName: 'Delete Test User',
                email: userEmail,
                password: 'Password@123',
                confirmPassword: 'Password@123',
                phoneNumber: '9999999999',
                age: 30,
                gender: 'Male',
                residentType: 'Owner',
                wing: 'A',
                flatNumber: '101'
            })
        });
        const regData = await regRes.json();
        if (!regRes.ok) throw new Error(`Registration failed: ${JSON.stringify(regData)}`);

        // 2. Login Admin
        console.log('2. Logging in as Admin...');
        const adminRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email: 'admin@nivasa.com', password: 'admin123'})
        });
        const adminData = await adminRes.json();
        if (!adminRes.ok) throw new Error(`Admin login failed: ${JSON.stringify(adminData)}`);
        const adminToken = adminData.data.token;

        // Approve User
        const searchRes = await fetch(`${API_URL}/admin/residents?search=${userEmail}`, {
            headers: {'Authorization': `Bearer ${adminToken}`}
        });
        const searchData = await searchRes.json();
        const user = searchData.data.residents[0];
        if (!user) throw new Error('User not found');

        console.log(`   Approving user ${user._id}...`);
        await fetch(`${API_URL}/admin/residents/${user._id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({status: 'approved'})
        });

        // 3. Login User
        console.log('3. Logging in as User...');
        const userLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email: userEmail, password: 'Password@123'})
        });
        const userLoginData = await userLoginRes.json();
        const userToken = userLoginData.data.token;

        // 4. Verify Token
        console.log('4. Verifying user token...');
        const verifyRes = await fetch(`${API_URL}/auth/profile`, {
            headers: {'Authorization': `Bearer ${userToken}`}
        });
        if (!verifyRes.ok) throw new Error('Token verification failed');
        console.log('   Token is valid.');

        // 5. Delete User
        console.log('5. Deleting user...');
        await fetch(`${API_URL}/admin/residents/${user._id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({reason: 'Test', source: 'manual'})
        });
        console.log('   User deleted.');

        // 6. Check Active Session
        console.log('6. Checking active session...');
        const checkRes = await fetch(`${API_URL}/auth/profile`, {
            headers: {'Authorization': `Bearer ${userToken}`}
        });

        const checkData = await checkRes.json();
        console.log(`   Status: ${checkRes.status}`);
        console.log(`   Code: ${checkData.code}`);

        if (checkRes.status === 410 && checkData.code === 'ACCOUNT_DELETED') {
            console.log('✅ SUCCESS: Active session rejected with 410 ACCOUNT_DELETED');
        } else {
            console.log('❌ FAILURE: Unexpected response');
        }

    } catch (e) {
        console.error('❌ ERROR:', e.message);
    }
}

const fs = require('fs');
const util = require('util');
const logFile = fs.createWriteStream('verification_output.txt', {flags: 'w'});
const logStdout = process.stdout;

console.log = function (d) {
    logFile.write(util.format(d) + '\n');
    logStdout.write(util.format(d) + '\n');
};

runTest();
