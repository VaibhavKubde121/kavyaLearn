const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['Course Completion', 'Assessment Score', 'Participation', 'Special', 'Streak', 'Milestone'],
        required: true
    },
    points: {
        type: Number,
        default: 0,
        min: 0
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        index: true
    },
    icon: {
        type: String,
        default: 'default-achievement.png'
    },
    badge: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
        default: 'Bronze'
    },
    unlockedBy: {
        type: Number,
        default: 1
    },
    dateEarned: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Create compound index for user and dateEarned for faster queries
achievementSchema.index({ user: 1, dateEarned: -1 });

const Achievement = mongoose.model('Achievement', achievementSchema);
module.exports = Achievement;