var socket = io.connect('http://localhost:8080/');


while (!pseudo) {
    var pseudo = prompt('Quel est ton nom ?');
}
// envoyer au serveur
socket.emit('pseudo', pseudo);
document.title = pseudo + ' - ' + document.title;
// écouter l'évenement recu du serveur (on a reçu le pseudo stocké)
socket.on('newUser', (pseudo) => {
    createElementFunction('newUser', pseudo)
})
// écouter l'évenement recu du serveur (on a reçu le pseudo du USER qui a quitté le chat)
socket.on('quitUser', (pseudo) => {
    createElementFunction('quitUser', pseudo)
})

// afficher le message écrit par l'utilisateur 
document.getElementById('chatForm').addEventListener('submit', function (e) {

    e.preventDefault();

    const textInput = document.getElementById('msgInput').value;
    document.getElementById('msgInput').value = '';

    if (textInput.length > 0) {

        socket.emit('newMessage', textInput);
        createElementFunction('newMessageMe', textInput)

    } else {

        return false;
    }


});

socket.on('NewMessageAll', (content) => {
    createElementFunction('NewMessageAll', content);
    console.log('msg recu', content);
});
socket.on('oldMessages', (messages)=>{
    messages.forEach(message => {
        if (message.sender === pseudo) {
            createElementFunction('oldMessageMe', message)
        } else {
            createElementFunction('oldMessages',message)
        }
    });
})
// on écoute l'évenement isWriting pour que tous les utilisateur puissent voir que un utilisateur 'X' est en train ou a arreté d'écrire
socket.on('isWriting', (pseudo) => {
    document.getElementById('isWriting').textContent = pseudo + ' est en train d\'écrire ...';
});
socket.on('isNotWriting', () => {
    document.getElementById('isWriting').textContent = '';
});

// FUNCTION
// document.getElementById('msgInput').addEventListener('keypress', function isWriting() {
//     socket.emit('isWriting', pseudo)
    
// });
// document.getElementById('msgInput').addEventListener('keypress', function isNotWriting() {
//     socket.emit('isNotWriting')
    
// });
// function isWriting() {
//     socket.emit('isWriting', pseudo)
// }
// function isNotWriting() {
//     socket.emit('isNotWriting')
// }


function createElementFunction(element, content) {
    const newElement = document.createElement('div')
    switch (element) {
        case 'newUser':
            newElement.classList.add(element, 'message');
            newElement.textContent = content + ' a rejoint le chat';
            document.getElementById('msgContainer').appendChild(newElement);
            break;

        case 'newMessageMe':
            newElement.classList.add(element, 'message');
            newElement.innerHTML = pseudo + ':' + content;
            document.getElementById('msgContainer').appendChild(newElement);
            break;
        case 'NewMessageAll':
            newElement.classList.add(element, 'message');
            newElement.innerHTML = content.pseudo + ':' + content.message;
            document.getElementById('msgContainer').appendChild(newElement);
            break;
        case 'oldMessages':
            newElement.classList.add(element, 'message');
            newElement.innerHTML = content.sender + ':' + content.content;
            document.getElementById('msgContainer').appendChild(newElement);
            break;
        case 'oldMessagesMe' :
            newElement.classList.add('newMessageMe', 'message');
            newElement.innerHTML = content.sender + ':' + content.content;
            document.getElementById('msgContainer').appendChild(newElement);
            break;
        case 'quitUser':
            newElement.classList.add(element, 'message');
            newElement.textContent = content + ' a quitté le chat';
            document.getElementById('msgContainer').appendChild(newElement);
            break;
    }
}