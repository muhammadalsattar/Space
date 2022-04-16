const socket = io()
let myPosition;
const sendMessageForm = document.querySelector('form');
const messageInput = sendMessageForm.elements.message;
const shareLocationButton = document.querySelector('#send-location');
const urlParams = new URLSearchParams(location.search);
const name = urlParams.get('name');
const room = urlParams.get('room');
const messageTemplate = (message) => {
    const time = moment(new Date().getTime()).format("h:mm A")
    const newMessage = `
            <div class="toast" role="alert" aria-live="assertive" aria-atomic="true" style="display: block !important; margin: .5em; width: 95% !important;">
                <div class="toast-header">
                    <strong class="me-auto">${message.name}</strong>
                    <small class="text-muted">${time}</small>
                </div>
                <div class="toast-body">
                    ${message.text}
                </div>
            </div>`;
    document.querySelector('.messages').insertAdjacentHTML('beforeend', newMessage);
}
const roomDataTemplate = (users) => {
    document.querySelector('#users').innerHTML = '';
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const userDiv = `
        <div class="toast rounded-0" role="alert" aria-live="assertive" aria-atomic="true" style="display: block !important; margin: .3em; width: 95% !important;">
            <div class="toast-header">
                <img src="/assets/filled-circle.png" class="rounded me-2" alt="active status" style="width: 1em;">
                <h4 class="me-auto">${user.name}</h4>
            </div>
        </div>
        `;
        document.querySelector('#users').insertAdjacentHTML('beforeend', userDiv);
    }
}
const scrollToBottom = () => {
    const messages = document.querySelector('.messages');
    const newMessage = messages.lastElementChild;
    const newMessageHeight = newMessage.clientHeight;
    const height = messages.scrollHeight;
    messages.scrollTop = height - newMessageHeight;
}
socket.emit('join', { name, room}, (error) => {
    if(error){
        alert(error);
        location.href = '/';
    }
});
document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault()
    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, ()=>{
        messageInput.value = '';
        messageInput.focus();
    });
})

document.querySelector('#send-location').addEventListener('click', () => {
    shareLocationButton.disabled = true;
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        myPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('sendLocation', myPosition, () => {
            shareLocationButton.disabled = false;
        })
    })
});

socket.on('message', (message) => {
    messageTemplate({name: 'Admin', text: message});
    scrollToBottom();
});

socket.on('newMessage', ({name, message}) => {
    messageTemplate({name, text: message});
    scrollToBottom();
});

socket.on('locationMessage', ({name, location}) => {
    location = `<a href="${location}" target="_blank" style="text-decoration: underline !important; color: #457b9d;">My Location</a>`;
    messageTemplate({name, text: location});
    scrollToBottom();
});

socket.on('roomData', ({users}) => {
    roomDataTemplate(users);
});