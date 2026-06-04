const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Available', 'Reserved', 'Sold'],
        default: 'Available'
    },
    description: {
        type: String,
        default: ''
    },
    imageUrl: {
        type: String, // base64 string or URL
        required: true
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Artwork', artworkSchema);
