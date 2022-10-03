const mongoose = require('mongoose');

var roomSchema = new mongoose.Schema({
    name : String

});

mongoose.model('room', roomSchema)