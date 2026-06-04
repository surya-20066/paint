const http = require('http');

async function runTest() {
    console.log("Starting Artist Registration Flow Test...");

    const email = `testartist_${Date.now()}@test.com`;

    try {
        // 1. Register Artist
        console.log("1. Registering new artist...");
        const signupRes = await fetch('http://localhost:3000/auth/artist-signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: 'Integration Test Artist',
                email: email,
                password: 'password123',
                specialization: 'Tanjore Painting',
                location: 'Test City'
            })
        });
        const signupData = await signupRes.json();
        console.log("Signup response:", signupData);
        if (!signupData.success) throw new Error("Signup failed");

        // 2. Admin Login
        console.log("2. Logging in as Admin...");
        const loginRes = await fetch('http://localhost:3000/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: 'paint' })
        });
        const cookie = loginRes.headers.get('set-cookie');
        const loginData = await loginRes.json();
        console.log("Admin login response:", loginData);
        if (!loginData.success) throw new Error("Admin login failed");

        // 3. Fetch Pending Artists
        console.log("3. Fetching pending artists...");
        const getRes = await fetch('http://localhost:3000/api/admin/artists?status=PENDING', {
            headers: { 'Cookie': cookie }
        });
        const getData = await getRes.json();
        console.log("Pending artists count:", getData.artists.length);
        
        const artist = getData.artists.find(a => a.email === email);
        if (!artist) throw new Error("Newly registered artist not found in pending list");
        console.log("Found newly registered artist with ID:", artist._id);

        // 4. Approve Artist
        console.log("4. Approving artist...");
        const approveRes = await fetch(`http://localhost:3000/api/admin/artists/${artist._id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
            body: JSON.stringify({ status: 'APPROVED' })
        });
        const approveData = await approveRes.json();
        console.log("Approve response:", approveData);
        if (!approveData.success) throw new Error("Approve failed");

        // 5. Verify Approval
        console.log("5. Verifying artist status...");
        const verifyRes = await fetch('http://localhost:3000/api/admin/artists?status=APPROVED', {
            headers: { 'Cookie': cookie }
        });
        const verifyData = await verifyRes.json();
        const verifiedArtist = verifyData.artists.find(a => a.email === email);
        if (!verifiedArtist) throw new Error("Artist was not moved to approved list");
        
        console.log("✅ TEST PASSED: Artist was successfully registered, found in pending list, approved, and verified in the approved list!");

    } catch (e) {
        console.error("❌ TEST FAILED:", e.message);
    }
}

runTest();
