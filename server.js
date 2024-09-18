const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON data
app.use(bodyParser.json());

// Serve static files (e.g., index.html, styles, scripts)
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to handle saving tasks
app.post('/save-task', (req, res) => {
    const taskData = req.body;
    const folderPath = path.join(__dirname, 'tasks');
    const filePath = path.join(folderPath, 'tasks.json');

    // Create folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    // Read existing tasks or initialize an empty array
    let tasks = {};
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        tasks = JSON.parse(fileContent);
    }

    // Add or update task data
    const taskDate = taskData.date;
    if (!tasks[taskDate]) {
        tasks[taskDate] = [];
    }
    tasks[taskDate].push({
        name: taskData.name,
        details: taskData.details,
    });

    // Save tasks to file
    fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2));

    res.json({ message: 'Task saved successfully!' });
});

// Endpoint to retrieve tasks
app.get('/get-tasks', (req, res) => {
    const folderPath = path.join(__dirname, 'tasks');
    const filePath = path.join(folderPath, 'tasks.json');

    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const tasks = JSON.parse(fileContent);
        res.json(tasks);
    } else {
        res.json({});
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
