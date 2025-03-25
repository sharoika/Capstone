import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '15s', target: 250 }, 
        { duration: '30s', target: 250 }, 
        { duration: '15s', target: 0 },   
    ],
};

const LOGIN_URL = 'https://server.ridefleet.ca/api/auth/rider/login';
const LOCATION_UPDATE_URL = 'https://server.ridefleet.ca/api/location/location/update';

const email = "J@J.ca";
const password = "D";

function getAuthToken() {
    const payload = JSON.stringify({ email, password });
    const params = { headers: { 'Content-Type': 'application/json' } };

    const loginRes = http.post(LOGIN_URL, payload, params);

    check(loginRes, {
        'Login successful': (r) => r.status === 200,
    });

    const token = loginRes.json("token");

    return {
        token
    };
}

export function setup() {
    return getAuthToken();
}

export default function (data) {
    const payload = JSON.stringify({
        userId: `6780506b8e6c8d8c8b048356`,
        userType: "rider",
        lat: 37.7749 + Math.random() * 0.01,
        long: -122.4194 + Math.random() * 0.01,
        timestamp: Date.now(),
    });

    console.log(data.token);

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`,
        },
    };

    const res = http.post(LOCATION_UPDATE_URL, payload, params);

    console.log(res.body);

    check(res, {
        'Location updated': (r) => r.status === 200,
    });

    sleep(5); // Wait 5 seconds before sending the next update
}
