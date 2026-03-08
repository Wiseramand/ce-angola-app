import fetch from 'node-fetch';

async function checkApi() {
    try {
        console.log("Fetching /system from Local Node API...");
        let res = await fetch('http://localhost:3001/api/system');
        if (!res.ok) {
            console.log("Local API failed:", res.status);
        } else {
            console.log("Local Node API Response:", await res.json());
        }
    } catch (e) {
        console.error("Local Node error:", e.message);
    }

    try {
        console.log("\nFetching /system from PHP XAMPP API...");
        let res = await fetch('http://localhost/cea-backend/public/api/system');
        if (!res.ok) {
            console.log("PHP XAMPP API failed:", res.status);
        } else {
            console.log("PHP XAMPP API Response:", await res.json());
        }
    } catch (e) {
        console.error("PHP XAMPP error:", e.message);
    }
}

checkApi();
