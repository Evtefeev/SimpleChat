
function getAPIURL() {
    const apiUrl = localStorage.getItem('serverAddress');
    return "http://" + apiUrl;
}


export async function login(name) {
    try {
        const response = await fetch(getAPIURL() + "/login", {
            method: 'POST',
            // mode: "no-cors",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name }),
        });

        if (!response.ok) {
            throw new Error('Failed to login');
        }

        return true;
    } catch (error) {
        console.error('Failed to login :', error);
        return false;
    }
}


export async function getUsers(user) {

    const response = await fetch(getAPIURL() + "/users?user=" + user);
    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }
    const users = await response.json();
    return users;

}


export async function createChat(sender, user) {
    const response = await fetch(getAPIURL() + "/chat?sender=" + sender + "&user=" + user);
    if (!response.ok) {
        throw new Error('Failed to create chat');
    }
    const chat_id = await response.json().chat_id;
    return chat_id;
}


export async function fetchMessages(chat_id, user, last_id) {

    try {
        const response = await fetch(
            getAPIURL() +
            "/messages?chat_id=" +
            chat_id +
            "&user=" +
            user +
            "&last_id=" +
            last_id
        );
        if (!response.ok) {
            throw new Error('Failed to fetch messages');
        }
        const messages = await response.json();
        return messages;
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw new Error('Failed to fetch messages');
    }
}

export async function sendMessage(sender, message, chat_id) {


    try {
        const response = await fetch(getAPIURL() + "/messages", {
            method: 'POST',
            // mode: "no-cors",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sender, message, chat_id }),
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        return true;
    } catch (error) {
        console.error('Error sending message:', error);
        return false;
    }
}


export async function newMessages(lasts, user) {

    const response = await fetch(getAPIURL() + "/new_messages", {
        method: 'POST',
        // mode: "no-cors",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "lasts": lasts, "user": user }),
    });

    if (!response.ok) {
        throw new Error('Failed to load new messages');
    }

    return response.json();

}