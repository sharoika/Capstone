
//4270 E Buckingham Dr, Regina, SK S4V 3A9
//3130 Woodhams Dr, Regina, SK S4V 2P9
//376 University Park Dr, Regina, SK S4X 1J4
const API_URL = 'https://server.ridefleet.ca/api/location/location/update';
const AUTH_TOKEN ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODA1MDZiOGU2YzhkOGM4YjA0ODM1NiIsImVtYWlsIjoiSkBKLmNhIiwiaWF0IjoxNzQzNzQ3NjcxLCJleHAiOjE3NDM3NTEyNzF9.lQzqDJnfyxm8MGA06Nk5kfOHY9VmVg5eRSWqP3glbjU';
const USER_ID = '6780506b8e6c8d8c8b048356';
const USER_TYPE = 'rider';


//const AUTH_TOKEN ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODA1MDZiOGU2YzhkOGM4YjA0ODM1NiIsImVtYWlsIjoiSkBKLmNhIiwiaWF0IjoxNzQzNzQ3NjcxLCJleHAiOjE3NDM3NTEyNzF9.lQzqDJnfyxm8MGA06Nk5kfOHY9VmVg5eRSWqP3glbjU';
//const USER_ID = '6792ad7859950cf7e5002d89';
//const USER_TYPE = 'driver';

const route = [
    { lat: 50.4297, long: -104.52251 }, 
    { lat: 50.42941, long: -104.52251 },
    { lat: 50.42941, long: -104.52372 },
    { lat: 50.42936, long: -104.52471 },
    { lat: 50.4293, long: -104.52565 }, 
    { lat: 50.4293, long: -104.52862 }, 
    { lat: 50.42929, long: -104.52953 },
    { lat: 50.42924, long: -104.53013 },
    { lat: 50.4292, long: -104.53035 },
    { lat: 50.42902, long: -104.5312 },
    { lat: 50.42887, long: -104.53167 },
    { lat: 50.42862, long: -104.53225 },
    { lat: 50.42844, long: -104.53259 },
    { lat: 50.42828, long: -104.53281 },
    { lat: 50.42806, long: -104.53318 },
    { lat: 50.42749, long: -104.53419 },
    { lat: 50.42852, long: -104.53557 },
    { lat: 50.42883, long: -104.53594 },
    { lat: 50.42899, long: -104.53622 },
    { lat: 50.42909, long: -104.53644 },
    { lat: 50.42926, long: -104.53632 },
    { lat: 50.42943, long: -104.53626 },
    { lat: 50.42958, long: -104.53627 },
];



const route2 = [
    { lat: 50.42958, long: -104.53627 },
    { lat: 50.42943, long: -104.53626 },
    { lat: 50.42934, long: -104.53629 },
    { lat: 50.42918, long: -104.53637 },
    { lat: 50.42909, long: -104.53644 },
    { lat: 50.42913, long: -104.53658 },
    { lat: 50.4292, long: -104.53685 },
    { lat: 50.42934, long: -104.53749 },
    { lat: 50.42958, long: -104.53739 },
    { lat: 50.43001, long: -104.53727 },
    { lat: 50.43014, long: -104.53725 },
    { lat: 50.4306, long: -104.5372 },
    { lat: 50.4311, long: -104.53719 },
    { lat: 50.43216, long: -104.53717 },
    { lat: 50.43275, long: -104.53717 },
    { lat: 50.43275, long: -104.53738 },
    { lat: 50.43275, long: -104.53852 },
    { lat: 50.43277, long: -104.53929 },
    { lat: 50.43283, long: -104.53977 },
    { lat: 50.43293, long: -104.54014 },
    { lat: 50.43447, long: -104.54467 },
    { lat: 50.4347, long: -104.54552 },
    { lat: 50.4348, long: -104.54594 },
    { lat: 50.43497, long: -104.54697 },
    { lat: 50.43504, long: -104.5475 },
    { lat: 50.43508, long: -104.54811 },
    { lat: 50.43509, long: -104.54952 },
    { lat: 50.4351, long: -104.55129 },
    { lat: 50.43514, long: -104.55161 },
    { lat: 50.43541, long: -104.55283 },
    { lat: 50.43572, long: -104.5543 },
    { lat: 50.43477, long: -104.55476 },
    { lat: 50.43502, long: -104.55589 },
];

const updateLocation = async (lat, long, index) => {
    const timestamp = new Date().toISOString();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`, 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: USER_ID,
                userType: USER_TYPE,
                lat,
                long,
                timestamp
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Request failed');

        console.log(`Update ${index + 1}:`, data);
    } catch (error) {
        console.error(`Error on update ${index + 1}:`, error.message);
    }
};

const simulateRoute = async () => {
    for (let i = 0; i < route2.length; i++) {
        await updateLocation(route2[i].lat, route2[i].long, i);
        await new Promise(res => setTimeout(res, 3000));
    }
};

simulateRoute();
