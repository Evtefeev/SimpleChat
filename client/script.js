import { fetchMessages, sendMessage, login, getUsers, createChat, newMessages } from './api.js';


let chat_id = -1;
let lasts = []

const messages = {};

function displayMessages() {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = ''; // Clear existing messages
    console.log(chat_id);
    
    console.log(messages[chat_id]);
    
    if (chat_id != -1 && messages[chat_id]) {
        messages[chat_id].forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = 'message';

            const senderElement = document.createElement('span');
            senderElement.className = 'sender';
            senderElement.textContent = `${message.sender}:`;

            const textElement = document.createElement('span');
            textElement.className = 'text';
            textElement.textContent = message.message;

            messageElement.appendChild(senderElement);
            messageElement.appendChild(textElement);
            chatMessages.appendChild(messageElement);
        });
    }


    // Scroll to the bottom of the chat
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


function addChatSelecter(element) {
    // Add an event listener to the element
    element.addEventListener("click", function (event) {
        // Get the ID of the clicked element
        this.classList.remove("new-msg")
        let elementId = this.id;


        // Extract the number from the ID
        let idNumber = elementId.match(/\d+/)[0];
        // Output the ID number
        chat_id = idNumber;
        // chat_id = createChat()

        let header = document.querySelector("#chat-header-name");
        header.innerHTML = "Chat with " + this.innerHTML;
        let highlightedElement = document.querySelector(".highlighted");
        if (highlightedElement) {
            highlightedElement.classList.remove("highlighted");
            highlightedElement.style.backgroundColor = ""; // Reset to original color
        }

        // Highlight the clicked element
        event.target.classList.add("highlighted");
        event.target.style.backgroundColor = "#007BFF"; // Change this to any color you prefer
        displayMessages();
    });
}


function displayUsers(users) {
    const contacts = document.getElementById('contact-list');
    users.forEach(user => {
        let userElement = document.querySelector("#user-" + user.chat_id);
        if (!userElement) {
            userElement = document.createElement('li');
        }
        userElement.innerHTML = user.name;
        if (user.name == localStorage.getItem("username")) {
            userElement.innerHTML += "(self)";
        }
        userElement.id = "user-" + user.chat_id;
        contacts.appendChild(userElement);
        addChatSelecter(userElement);
        if (chat_id == user.chat_id) {
            userElement.classList.add("highlighted");
            userElement.style.backgroundColor = "#007BFF";
        }
    });
}


async function loadUsers(set) {
    const username = localStorage.getItem('username');
    const users = await getUsers(username);

    if (users) {
        if (set) {
            chat_id = users.find((entry) => entry.name === username).chat_id;
            users.forEach(user => lasts.push({ "chat_id": user.chat_id, "last_id": 0 }));
        }
        displayUsers(users)
    } else {
        clearInterval(usersIter);
    }
}


async function updateUsers() {
    await loadUsers(false);
    // await loadNewMessages();
}


async function serverLogin() {
    const username = localStorage.getItem('username');
    if (username) {
        const success = await login(username);
        if (success) {
            loadUsers(true);
            loadMessages(); // Refresh messages after sending
            // messageInput.value = ''; // Clear the input field
            const inter = setInterval(loadMessages, 1000);
            const usersIter = setInterval(updateUsers, 2000);
            // const messageInterval = setInterval(loadNewMessages, 5000);
        }
    } else {
        openPopup();
    }
}


async function loadMessages() {
    try {
        const username = localStorage.getItem('username');
        if (chat_id != -1) {
            // console.log(lasts);
            const last_id = lasts.find(last => last.chat_id == chat_id).last_id;
            const new_messages = await fetchMessages(
                chat_id,
                username,
                last_id
            );
            if (!messages[chat_id] || last_id == 0) {
                messages[chat_id] = [];
            }
            messages[chat_id].push(...new_messages);


            displayMessages();
            document.getElementById('hint').style.display = 'none';
        }

        document.getElementById('error').style.display = 'none';

    } catch (error) {
        document.getElementById('error').style.display = 'block';
        console.log(error);

        // if (inter)
        //     clearInterval(inter);
    }
}


async function loadNewMessages() {
    let new_lasts = await newMessages(lasts, localStorage.getItem("username"));
    new_lasts.forEach(newItem => {
        let userEl = document.querySelector("#user-" + newItem.chat_id);
        const existingItem = lasts.find(last => last.chat_id === newItem.chat_id);


        if (existingItem && newItem.last_id > existingItem.last_id) {
            console.log(userEl);
            console.log(newItem.last_id);
            console.log(existingItem.last_id);

            userEl.classList.add("new-msg")
        }
        // } else {
        // userEl.classList.remove("new-msg")
        // }
    });
    lasts = new_lasts;
}

async function handleSendMessage() {
    const messageInput = document.getElementById('message-input');
    const messageText = messageInput.value.trim();
    const username = localStorage.getItem('username');

    if (messageText) {
        const success = await sendMessage(username, messageText, chat_id);
        if (success) {
            // loadMessages(); // Refresh messages after sending
            messageInput.value = ''; // Clear the input field
        }
    }
}


function openPopup() {
    const username = localStorage.getItem('username');
    const serverAddress = localStorage.getItem('serverAddress');
    document.getElementById('user-popup').style.display = 'flex';

    document.getElementById('username').value = username
    document.getElementById('server-address').value = serverAddress

}

// Function to show the popup if user details are not saved
function showPopup() {
    const username = localStorage.getItem('username');
    const serverAddress = localStorage.getItem('serverAddress');

    if (!username || !serverAddress) {
        document.getElementById('user-popup').style.display = 'flex';
    } else {
        document.getElementById('main-container').style.display = 'flex';
    }
}

// Function to save user details to local storage
function saveUserDetails() {
    const username = document.getElementById('username').value;
    const serverAddress = document.getElementById('server-address').value;

    if (username && serverAddress) {
        localStorage.setItem('username', username);
        localStorage.setItem('serverAddress', serverAddress);

        document.getElementById('user-popup').style.display = 'none';
        document.getElementById('main-container').style.display = 'flex';
        document.location.reload();
    } else {
        alert('Please fill in both fields.');
    }
}

// Add event listener to the save button
document.getElementById('save-details-button').addEventListener('click', saveUserDetails);
document.getElementById('settings-button').addEventListener('click', openPopup);

// Show the popup on page load if necessary
document.addEventListener('DOMContentLoaded', showPopup);

// Add event listener to the send button
document.getElementById('send-button').addEventListener('click', handleSendMessage);

// Fetch messages when the page loads
window.onload = serverLogin;

