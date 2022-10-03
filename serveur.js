var express = require('express');
var app = express();
var server = require('http').createServer(app);
var mongoose = require('mongoose');

// const ObjectId = mongoose.Types.ObjectId;

// mongoose.connect('mongodb://localhost/ChatSocket',{ useNewUrlParser: true , useUnifiedTopology: true})




//Créer une fonction asynchrone main

async function testchatproject() {
        // Se connecter à notre BDD
    // on peut indiquer le port utilisé après localhost par défaut 27017

    await mongoose.connect('mongodb://127.0.0.1:27017/chatproject', { useNewUrlParser: true, useUnifiedTopology: true }, function (err) {
        if (err) {
            console.log(err)
        } else {
            console.log('Connected to mongodb')
        }
    })
}
testchatproject();

require('./models/user.model')
require('./models/chat.model')
var User = mongoose.model('user')
var Chat = mongoose.model('chat')


app.use(express.static(__dirname + '/public'))
var PORT = process.env.PORT || 8080

// Route

app.get('/', function(req,res){
    res.render('index.ejs');
})

app.use(function(req, res, next){
    res.status(404).send('Page introuvable ! '); 
})

// IO déclaration
const io = require("socket.io")(server, {
    cors: {
      origin: "*",
    },
  });
// écouter l'evenement 
io.on('connection', (socket) => {
    socket.on('pseudo',(pseudo)=> {
        User.findOne({pseudo: pseudo},(err,user)=>{
            if (user) {
                socket.pseudo = pseudo;
                socket.broadcast.emit('newUser',pseudo);
            } else {
                var user = new User();
                user.pseudo = pseudo;
                user.save();
                socket.pseudo = pseudo;
                socket.broadcast.emit('newUser',pseudo);
            }
            Chat.find((err,messages)=> {
                socket.emit('oldMessages', messages);
            });
        });
        // stocker le pseudo et le renvoyer a chat 
      
    });
    socket.on('newMessage',(message) => {
        var chat = new Chat();
        chat.content = message;
        chat.sender = socket.pseudo;
        chat.save();
        socket.broadcast.emit('NewMessageAll',{message : message , pseudo : socket.pseudo});

    });
    // Envoie une notification au client pour lui dire que l'utilisateur s'est déconnecté 
    socket.on('disconnect',()=> {
        socket.broadcast.emit('quitUser',socket.pseudo);
    });
    // notifié que l'utilisateur est en train d'écrire
    socket.on('isWriting',(pseudo)=> {
        socket.broadcast.emit('isWriting',pseudo)
    });
    // notifié que l'utilisateur a arreté d'écrire
    socket.on('isNotWriting',()=> {
        socket.broadcast.emit('isNotWriting')
    });
});
//TODO
server.listen(PORT, () => console.log('Server started at port : 8080'));