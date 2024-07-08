const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    publication: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    isPractical: {
        type: Boolean,
        default: false
    },
    chapterName: {
        type: [String],
        default: []
    },
    boughtNo: {
        type: Number,
        default: 0
    }
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;