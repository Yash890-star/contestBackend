const mongoose = require('mongoose')

const User = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    competitions: Array,
    remainders: Array,
    completions: Array,
    staffCompletions: Array
})

module.exports = mongoose.model("User", User)