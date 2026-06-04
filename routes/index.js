const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Middleware to protect user routes
const requireUser = (req, res, next) => {
    if (req.session.user && req.session.userType === 'user') {
        next();
    } else {
        res.redirect('/user-signin');
    }
};

// Middleware to protect artist routes
const requireArtist = (req, res, next) => {
    if (req.session.user && req.session.userType === 'artist') {
        next();
    } else {
        res.redirect('/signin');
    }
};

const Payment = require('../models/Payment');

// Public Payment Endpoint
router.post('/api/payments', async (req, res) => {
    try {
        const { transactionId, customerName, amount, itemName, bookingReference } = req.body;
        if (!transactionId || !customerName || !amount || !itemName || !bookingReference) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }
        
        const payment = new Payment({
            transactionId,
            customerName,
            amount: parseFloat(amount),
            itemName,
            bookingReference
        });
        
        await payment.save();
        res.status(201).json({ success: true, payment });
    } catch (err) {
        console.error('Payment Error:', err);
        res.status(500).json({ success: false, message: 'Failed to record payment.', error: err.message });
    }
});

// Get User Payments (for dashboard commissions)
router.get('/api/user/payments', requireUser, async (req, res) => {
    try {
        const payments = await Payment.find({ customerName: req.session.user.fullName }).sort({ createdAt: -1 });
        res.json({ success: true, payments });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

const CmsContent = require('../models/CmsContent');

// Public CMS Endpoint
router.get('/api/cms', async (req, res) => {
    try {
        const contents = await CmsContent.find();
        const data = {};
        contents.forEach(c => data[c.key] = c.value);
        res.json({ success: true, data });
    } catch (err) {
        console.error('CMS Fetch Error:', err);
        res.status(500).json({ success: false });
    }
});

const Artist = require('../models/Artist');
const Artwork = require('../models/Artwork');

// Get all approved artists (for user dashboard)
router.get('/api/artists/approved', async (req, res) => {
    try {
        const artists = await Artist.find({ isApproved: true }).select('-password');
        res.json({ success: true, artists });
    } catch (err) {
        console.error('Error fetching approved artists:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// Upload artwork (for artist dashboard)
router.post('/api/artworks', requireArtist, async (req, res) => {
    try {
        const { title, price, category, status, description, imageUrl } = req.body;
        const artistId = req.session.user.id;

        const artwork = new Artwork({
            title,
            price: parseFloat(price) || 0,
            category,
            status: status || 'Available',
            description,
            imageUrl,
            artist: artistId
        });

        await artwork.save();
        res.json({ success: true, artwork });
    } catch (err) {
        console.error('Artwork upload error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get artist's own artworks
router.get('/api/artworks/me', requireArtist, async (req, res) => {
    try {
        const artworks = await Artwork.find({ artist: req.session.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, artworks });
    } catch (err) {
        console.error('Fetch artworks error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// Explicit mappings for main routes
router.get('/', (req, res) => res.render('index'));
router.get('/signin', (req, res) => {
    if (req.session.user) return res.redirect(req.session.userType === 'artist' ? '/artist-home' : '/dashboard');
    res.render('signin');
});
router.get('/user-signin', (req, res) => {
    if (req.session.user) return res.redirect(req.session.userType === 'artist' ? '/artist-home' : '/dashboard');
    res.render('user-signin');
});

// Protected User Routes
router.get('/dashboard', requireUser, (req, res) => res.render('dashboard'));
router.get('/dashboard-artists', requireUser, (req, res) => res.render('dashboard-artists'));
router.get('/dashboard-commissions', requireUser, (req, res) => res.render('dashboard-commissions'));
router.get('/dashboard-workshops', requireUser, (req, res) => res.render('dashboard-workshops'));

// Protected Artist Routes
router.get('/artist-home', requireArtist, (req, res) => res.render('artist-home'));
router.get('/artist-gallery', requireArtist, (req, res) => res.render('artist-gallery'));
router.get('/artist-portfolio', requireArtist, (req, res) => res.render('artist-portfolio'));
router.get('/artist-profile-preview', requireArtist, (req, res) => res.render('artist-profile-preview'));
router.get('/artist-settings', requireArtist, (req, res) => res.render('artist-settings'));

// Admin Routes (unprotected for now as per plan, can be updated later)
router.get('/admin', (req, res) => res.redirect('/admin-dashboard'));
router.get('/admin-dashboard', (req, res) => res.render('admin-dashboard'));

// Generic route fallback for other existing pages (like artists.ejs, explore.ejs, etc.)
router.get('/:page', (req, res, next) => {
    let page = req.params.page;
    
    // Strip .html extension and redirect to clean URL so they hit protected routes
    if (page.endsWith('.html')) {
        return res.redirect(`/${page.slice(0, -5)}`);
    }
    
    // Basic protection to prevent directory traversal
    if (page.includes('..') || page.includes('/')) return next();
    
    const viewPath = path.join(__dirname, '..', 'views', `${page}.ejs`);
    
    if (fs.existsSync(viewPath)) {
        res.render(page);
    } else {
        next(); // pass to 404 handler
    }
});

module.exports = router;
