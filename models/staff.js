const mongoose = require('mongoose')

const Staff = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    students: Array,
    remainders: Array,
})

module.exports = mongoose.model('Staff', Staff)