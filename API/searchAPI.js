const createSearch = require('../Crawler/search.js');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors({"Access-Control-Allow-Headers": "*"}));
app.use(express.static('API'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile('index.html', {root: __dirname });
});

app.post('/request', (req, res) => {
    const { keyword, number } = req.body
    createSearch(keyword, number);
    res.end();
});

app.listen(port, function(err){
    if (err) console.log("Error in server setup");
    console.log("Server listening on Port", port);
});

