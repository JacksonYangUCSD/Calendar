const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// In-memory store for users (this should ideally be in MongoDB)
const usersCollection = db.collection('users');

// Endpoint to register a new user
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Missing username or password' });
    }

    try {
        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            username,
            password: hashedPassword,
        };

        // Save the user in the users collection
        await usersCollection.insertOne(newUser);

        res.json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Endpoint to log in a user
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Missing username or password' });
    }

    try {
        const user = await usersCollection.findOne({ username });

        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({ token, message: 'Logged in successfully!' });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Failed to log in' });
    }
});

// Middleware to authenticate users based on JWT
function authenticate(req, res, next) {
    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// Example of how to protect the task routes with the authenticate middleware
app.post('/save-task', authenticate, async (req, res) => {
    const { date, name, details } = req.body;
    const userId = req.userId; // This will be available thanks to the authenticate middleware

    if (!date || !name || !details) {
        return res.status(400).json({ error: 'Missing required task data' });
    }

    try {
        await tasksCollection.updateOne(
            { date: date, userId: userId }, // Now we're saving the task based on userId
            { $push: { tasks: { name, details } } },
            { upsert: true }
        );
        res.json({ message: 'Task saved successfully!' });
    } catch (error) {
        console.error('Error saving task:', error);
        res.status(500).json({ error: 'Failed to save task' });
    }
});
