const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Endpoint to receive data and save it as a JSON file
app.post('/save-tasks', (req, res) => {
    const tasks = req.body;

    // Define the path to save the JSON file
    const filePath = path.join(__dirname, 'tasks.json');

    // Convert tasks to JSON string and save to a file
    fs.writeFile(filePath, JSON.stringify(tasks, null, 2), (err) => {
        if (err) {
            console.error('Error saving tasks:', err);
            res.status(500).send('Failed to save tasks');
        } else {
            console.log('Tasks saved successfully!');
            res.send('Tasks saved successfully');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
