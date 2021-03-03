// loading mongoose package
const mongoose = require('mongoose')

// creating schema for the task module
const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

// data model for the tasks
const Task = mongoose.model('Task', taskSchema)


// exporting user model to use in the other files
module.exports = Task