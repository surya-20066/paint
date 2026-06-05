const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/paintedmuse';

// Database connection
mongoose.connect(MONGO_URI).then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_fallback_secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// Make session available to all EJS templates
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.userType = req.session.userType || null;
    next();
});

// Routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const adminApiRoutes = require('./routes/adminApi');

app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/api/admin', adminApiRoutes);

// Seed Default Admin Account
const Admin = require('./models/Admin');
mongoose.connection.once('open', async () => {
    try {
        const count = await Admin.countDocuments();
        if (count === 0) {
            const adminPassword = process.env.ADMIN_PASSWORD;
            const defaultAdmin = new Admin({ email: 'admin@paintedmuse.com', password: adminPassword });
            await defaultAdmin.save();
            console.log('Default Admin Account created.');
        }
    } catch (err) {
        console.error('Error seeding admin account:', err);
    }
});

// Error handling middleware
app.use((req, res, next) => {
    res.status(404).render('checkout-failure', {
        message: 'Page Not Found'
    }); // Repurposed for simple 404 for now
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
