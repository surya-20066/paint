const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Artist = require('../models/Artist');
const User = require('../models/User');
const CmsContent = require('../models/CmsContent');

// Middleware to protect admin API routes
const requireAdmin = (req, res, next) => {
    if (req.session.adminAuthenticated) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
    }
};

// Login
router.post('/login', async (req, res) => {
    try {
        const password = req.body.password ? req.body.password.trim() : '';
        
        const expectedPassword = process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD.trim() : '';
        if (!expectedPassword) {
            console.error('LOGIN FAILED: ADMIN_PASSWORD not set in server environment.');
            return res.status(500).json({ success: false, message: 'ADMIN_PASSWORD not set in server environment.' });
        }
        
        console.log(`LOGIN ATTEMPT - Received: '${password}', Expected: '${expectedPassword}'`);
        
        if (password === expectedPassword) {
            req.session.adminAuthenticated = true;
            return res.status(200).json({ success: true });
        } else {
            console.log('LOGIN FAILED: Passwords do not match.');
            return res.status(401).json({ success: false, message: 'Invalid administrator password.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.adminAuthenticated = false;
    res.json({ success: true });
});

// Check status
router.get('/status', (req, res) => {
    if (req.session.adminAuthenticated) {
        res.json({ authenticated: true });
    } else {
        res.json({ authenticated: false });
    }
});

// Change Password
router.post('/change-password', requireAdmin, async (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
        }
        const admin = await Admin.findOne();
        admin.password = newPassword;
        await admin.save();
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Dashboard Stats
router.get('/stats', requireAdmin, async (req, res) => {
    try {
        const totalArtists = await Artist.countDocuments();
        const totalUsers = await User.countDocuments();
        const pendingApprovals = await Artist.countDocuments({ isApproved: false });
        // Verified artists could be an extra field or just derived:
        const verifiedArtists = await Artist.countDocuments({ isApproved: true });
        
        res.json({
            success: true,
            totalArtists,
            totalUsers,
            pendingApprovals,
            verifiedArtists,
            activeCommissions: 85, // Stubbed for now
            monthlyRevenue: '₹4,25,000', // Stubbed for now
            newSignups: 12 // Stubbed for now
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET Artists
router.get('/artists', requireAdmin, async (req, res) => {
    try {
        const statusFilter = req.query.status; // ALL, PENDING, APPROVED, REJECTED
        let filter = {};
        if (statusFilter === 'PENDING') {
            filter.isApproved = false;
        } else if (statusFilter === 'APPROVED') {
            filter.isApproved = true;
        }
        // Assuming REJECTED is a separate flag, but if not we just use isApproved. 
        // For now, we support PENDING and APPROVED based on current model.
        
        const artists = await Artist.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, artists });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update Artist Status
router.put('/artists/:id/status', requireAdmin, async (req, res) => {
    try {
        const { status } = req.body; // PENDING, APPROVED, REJECTED
        const isApproved = status === 'APPROVED';
        await Artist.findByIdAndUpdate(req.params.id, { isApproved });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Add New Artist
router.post('/artists', requireAdmin, async (req, res) => {
    try {
        const newArtist = new Artist(req.body);
        // Map status to isApproved if provided
        if (req.body.status) {
            newArtist.isApproved = req.body.status === 'APPROVED';
        }
        await newArtist.save();
        res.status(201).json({ success: true, artist: newArtist });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete Artist
router.delete('/artists/:email', requireAdmin, async (req, res) => {
    try {
        await Artist.findOneAndDelete({ email: req.params.email });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// --- Users API ---
router.get('/users', requireAdmin, async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
});

router.post('/users', requireAdmin, async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already registered.' });
        }
        
        const user = new User({ fullName, email, password });
        await user.save();
        res.status(201).json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.delete('/users/:email', requireAdmin, async (req, res) => {
    try {
        await User.findOneAndDelete({ email: req.params.email });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
});

// --- Payments API ---
const Payment = require('../models/Payment');

router.get('/payments', requireAdmin, async (req, res) => {
    try {
        const payments = await Payment.find().sort({ createdAt: -1 });
        res.json({ success: true, payments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch payments' });
    }
});


// CMS Content endpoints
router.get('/cms', async (req, res) => {
    try {
        const content = await CmsContent.find();
        const config = {};
        content.forEach(item => {
            config[item.key] = item.value;
        });
        res.json({ success: true, config });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/cms', requireAdmin, async (req, res) => {
    try {
        const { key, value } = req.body;
        await CmsContent.findOneAndUpdate(
            { key },
            { value },
            { upsert: true, new: true }
        );
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.delete('/cms', requireAdmin, async (req, res) => {
    try {
        await CmsContent.deleteMany({});
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
