# SimpleChat

SimpleChat is a minimalistic web-based chat application designed for easy deployment and extensibility.  
It features user registration, local storage of user details, chat messaging, and a sleek dark-themed responsive UI.

## Features

- 🧑‍💻 User registration with local storage
- 💬 Real-time chat interface
- 🌙 Dark mode design
- 🖥️ Responsive layout for desktop and mobile
- ⚡ Lightweight frontend using HTML, CSS, and JavaScript
- 💄 Backend with Flask (Python)
- 🔒 Basic security practices for user input

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Python 3, Flask
- **Database**: SQLite

## Getting Started

### Prerequisites

- Python 3.7+
- `pip` package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Evtefeev/SimpleChat.git
   cd SimpleChat
   ```

2. **Install the required packages:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the server:**
   ```bash
   python app.py
   ```

4. **Access the app:**
   Open your browser and go to `http://127.0.0.1:5000/`

### Project Structure

```
SimpleChat/
├── static/
│   ├── css/
│   └── js/
├── templates/
│   └── index.html
├── app.py
├── requirements.txt
└── README.md
```

- `static/` — CSS and JavaScript files
- `templates/` — HTML template
- `app.py` — Flask server script
- `requirements.txt` — Python dependencies

## Screenshots

> _[Insert screenshots here if you want — UI looks good!]_

## Future Improvements

- Add authentication (login/password)
- WebSocket support for true real-time messaging
- Message persistence in the database
- User avatars and profiles
- Group chats

## Contributing

Contributions are welcome!  
Please open an issue or submit a pull request if you have suggestions or improvements.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

