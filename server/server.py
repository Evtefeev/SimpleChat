import uuid
from flask import Flask, json, request, jsonify
from flask_cors import cross_origin
import model

app = Flask(__name__)
session = model.start()


def get_chat_for_user(user_id, chat_id):
    member = session.query(
        model.Chat
    ).join(
        model.ChatMembers, model.Chat.id == model.ChatMembers.chat_id
    ).join(
        model.User, model.ChatMembers.user_id == model.User.id
    ).filter(
        model.Chat.id == chat_id,
        model.User.id == user_id
    ).one_or_none()
    if not member:
        return None
    return session.query(model.Chat).filter_by(id=member.id).one_or_none()


# Login to server
@app.route('/login', methods=['POST'])
@cross_origin()
def server_login():
    sender = request.json['name']
    user = session.query(model.User).filter_by(
        name=sender).one_or_none()
    if not user:
        user = model.User.create(session, sender, str(uuid.uuid4()))
    resp = jsonify({"message": "Login successful!", "pubkey": user.pubkey})
    return resp, 201


# Store a message
@app.route('/messages', methods=['POST'])
@cross_origin()
def store_message():
    sender = request.json['sender']
    message = request.json['message']
    chat = request.json['chat_id']
    sender = session.query(model.User).filter_by(
        name=sender).one_or_none()
    if not sender:
        resp = jsonify({"message": "Invalid user"})
        return resp, 400
    chat = get_chat_for_user(sender.id, chat)

    if chat:
        model.Message.send(session, sender, chat, message)
        resp = jsonify({"message": "Message stored successfully!"})
        return resp, 201
    else:
        resp = jsonify({"message": "Invalid chat_id"})
        return resp, 400


@app.route('/chat', methods=['GET'])
@cross_origin()
def fetch_chat_id():
    sender = request.args.get('sender')
    user = request.args.get('user')
    return jsonify({"chat_id": get_chat_id(sender, user)})


def get_chat_name(user1, user2):
    users = sorted([user1, user2])
    return users[0]+"+"+users[1]


def get_chat_id(sender, user):
    chat_name = get_chat_name(sender, user)
    # Get sender from DB by name
    sender = get_user(sender)
    if not sender:
        return -1
    # Get user from DB by name
    user = get_user(user)
    if not user:
        return -1
    # Get chat by name
    chat = session.query(model.Chat).filter_by(
        name=chat_name).one_or_none()
    # Return chat if exist
    if chat:
        return chat.id
    # Creating new chat
    chat = model.Chat.create(session, chat_name, str(uuid.uuid4()))
    # Inserting sender and user to this chat
    if not get_chat_for_user(sender.id, chat.id):
        chat.add_user(session, sender)
    if not get_chat_for_user(user.id, chat.id):
        chat.add_user(session, user)
    return chat.id


def get_user(user):
    return session.query(model.User).filter_by(name=user).one_or_none()


def get_user_by_pubkey(pubkey):
    return session.query(model.User).filter_by(pubkey=pubkey).one_or_none()

# Retrieve all messages


@app.route('/messages', methods=['GET'])
@cross_origin()
def get_messages():
    chat_id = request.args.get('chat_id')
    last_id = request.args.get('last_id')
    user = request.args.get('user')
    user = get_user(user)
    if not user:
        resp = jsonify({"message": "Invalid user"})
        return resp, 400
    chat = get_chat_for_user(user.id, chat_id)

    if not chat:
        resp = jsonify({"message": "Invalid chat_id"})
        return resp, 400
    if not last_id:
        last_id = 0
    rows = session.query(model.Message).filter(
        model.Message.chat_id == chat_id, model.Message.id > int(last_id)).all()

    messages = [{"id": row.id, "sender": row.sender.name, "message": row.text}
                for row in rows]
    response = jsonify(messages)
    # response.headers.add("Access-Control-Allow-Origin", "*")
    return response, 200


# Retrieve all users
@app.route('/users', methods=['GET'])
@cross_origin()
def get_users():
    user = request.args.get('user')
    if not get_user(user):
        resp = jsonify({"message": "Invalid user"})
        return resp, 400
    rows = session.query(model.User).all()
    users = [{"id": row.id, "name": row.name, "chat_id":  get_chat_id(user, row.name)}
             for row in rows]
    response = jsonify(users)
    return response, 200


# Retrieve all users
@app.route('/new_messages', methods=['POST'])
@cross_origin()
def new_messages():
    user = request.json['user']
    lasts = request.json['lasts']
    if not get_user(user):
        resp = jsonify({"message": "Invalid user"})
        return resp, 400

    # Prepare the result
    result = []

    # Check each element in `lasts`
    for last in lasts:
        chat_id = last["chat_id"]
        last_id = last["last_id"]

        # Query the database to check if any message has id > last_id for the given chat_id
        exists = session.query(model.Message).filter(
            model.Message.chat_id == chat_id,
            model.Message.id > last_id
        ).order_by(model.Message.id.desc()).first()

        # Append result to the list
        if exists:
            last_id = exists.id
        result.append({
            "chat_id": chat_id,
            "last_id": last_id
        })

    # Convert the result to JSON
    return json.dumps(result, indent=4)


# Run the Flask server
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
