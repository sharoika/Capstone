const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;


app.get('/', async (req, res) => {
    try {
        res.send('hi');
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
