const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const artistSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    specialization: {
        type: String,
        required: true
    },
    otherSpecialization: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        required: true
    },
    isApproved: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

artistSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
artistSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Artist', artistSchema);
