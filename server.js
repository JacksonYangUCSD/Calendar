// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection URI from environment variables
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let tasksCollection;

// Middleware to parse incoming JSON data
app.use(bodyParser.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB and set up the tasks collection
async function connectToDatabase() {
    try {
        await client.connect();
        const db = client.db('calendarDB'); // Replace 'calendarDB' with your database name
        tasksCollection = db.collection('tasks'); // Use 'tasks' as the collection to store tasks
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit the process if unable to connect
    }
}

connectToDatabase();

// Endpoint to save a task
app.post('/save-task', async (req, res) => {
    const { date, name, details } = req.body;

    try {
        // Save or update tasks for the specific date
        await tasksCollection.updateOne(
            { date: date }, // Find the task by date
            { $push: { tasks: { name, details } } }, // Push new task into the tasks array
            { upsert: true } // Insert if not found
        );
        res.json({ message: 'Task saved successfully!' });
    } catch (error) {
        console.error('Error saving task:', error);
        res.status(500).json({ error: 'Failed to save task' });
    }
});

// Endpoint to retrieve all tasks
app.get('/get-tasks', async (req, res) => {
    try {
        const tasks = await tasksCollection.find().toArray();
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
