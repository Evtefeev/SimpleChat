from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship, sessionmaker, declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    pubkey = Column(String, unique=True, nullable=False)

    messages = relationship('Message', back_populates='sender')
    chats = relationship('Chat', secondary='chat_members', back_populates='members')

    # Add a method to create a user
    @classmethod
    def create(cls, session, name, pubkey):
        user = cls(name=name, pubkey=pubkey)
        session.add(user)
        session.commit()
        return user

    # Add a method to get user by public key
    @classmethod
    def get_by_pubkey(cls, session, pubkey):
        return session.query(cls).filter_by(pubkey=pubkey).first()

class Chat(Base):
    __tablename__ = 'chats'
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    pubkey = Column(String, unique=True, nullable=False)

    messages = relationship('Message', back_populates='chat')
    members = relationship('User', secondary='chat_members', back_populates='chats')

    # Add a method to create a chat
    @classmethod
    def create(cls, session, name, pubkey):
        chat = cls(name=name, pubkey=pubkey)
        session.add(chat)
        session.commit()
        return chat

    # Add a method to add a user to a chat
    def add_user(self, session, user):
        if user not in self.members:
            self.members.append(user)
            session.commit()

class Message(Base):
    __tablename__ = 'messages'
    
    id = Column(Integer, primary_key=True)
    sender_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    chat_id = Column(Integer, ForeignKey('chats.id'), nullable=False)
    text = Column(Text, nullable=False)
    date = Column(DateTime, default=datetime.now())

    sender = relationship('User', back_populates='messages')
    chat = relationship('Chat', back_populates='messages')

    # Add a method to send a message
    @classmethod
    def send(cls, session, sender, chat, text):
        message = cls(sender_id=sender.id, chat_id=chat.id, text=text)
        session.add(message)
        session.commit()
        return message

class ChatMembers(Base):
    __tablename__ = 'chat_members'
    
    chat_id = Column(Integer, ForeignKey('chats.id'), primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)


def start():
    # Create the database engine
    engine = create_engine('sqlite:///chatapp.db')
    Base.metadata.create_all(engine)

    # Create a session
    Session = sessionmaker(bind=engine)
    return Session()
