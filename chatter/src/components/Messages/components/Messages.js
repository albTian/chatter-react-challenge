import React, { useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import useSound from 'use-sound';
import config from '../../../config';
import LatestMessagesContext from '../../../contexts/LatestMessages/LatestMessages';
import TypingMessage from './TypingMessage';
import Header from './Header';
import Footer from './Footer';
import Message from './Message';
import '../styles/_messages.scss';
import initialBottyMessage from '../../../common/constants/initialBottyMessage';

const socket = io(
  config.BOT_SERVER_ENDPOINT,
  { transports: ['websocket', 'polling', 'flashsocket'] }
);

const ME = 'me';

// Most work should be done in here, scroll to bottom when sending/recieving mesage
function Messages() {
  const [playSend] = useSound(config.SEND_AUDIO_URL);
  const [playReceive] = useSound(config.RECEIVE_AUDIO_URL);
  const { setLatestMessage } = useContext(LatestMessagesContext);

  // Internal state for messages
  const [messageList, setMessageList] = useState([{ user: 1, id: -1, message: initialBottyMessage }])
  const [currentMessage, setCurrentMessage] = useState("")
  const [messageID, setMessageID] = useState(0)
  const [botTyping, setBotTyping] = useState(false)

  // Wraper to update state alongside typing info
  function changeMessage(event) {
    setCurrentMessage(event.target.value)
  }

  // Helper to handle updating the messageList state and everything that comes with that
  // Only deals with state, not context. Returns the new message object for other functions to use
  // (state) update messageList 
  // (state) increment messageID
  // (state) set currentMessage to nothing
  function updateMessageList(message, user) {
    const nextMessage = {
      id: messageID,
      user: user,
      message: message
    }
    setMessageList(prevMessageList => [...prevMessageList, nextMessage])
    setMessageID(prevMessageID => prevMessageID + 1)
    setCurrentMessage("DOG")
    return nextMessage
  }

  // Things to do when we send a message:
  // (state) update internal state
  // (context) update latestMessage
  // (socket) send message to socket
  // (misc) play send sound
  function sendMessage(event) {
    const nextMessage = updateMessageList(currentMessage, ME)
    setLatestMessage("bot", nextMessage.message)
    socket.emit('user-message', nextMessage.message)
    playSend()
  }

  // Things to do when we recieve a message:
  // (state) update internal state
  // (context) update latestMessage
  // (misc) play recieve sound
  function recieveMessage(message) {
    const nextMessage = updateMessageList(message, "bot")
    setLatestMessage("bot", nextMessage.message)
    console.log('PLATY RECIEVE MF');
    playReceive()
  }

  // On startup useEffect: establish all socket connections
  // (connection) recieved a message
  // (connection) is typing
  useEffect(() => {
    socket.on('bot-message', (message) => {
      console.log(`botty sending ${message}`);
      recieveMessage(message)
      setBotTyping(false)
    });

    socket.on('bot-typing', () => {
      setBotTyping(true)
    });
  }, [])

  return (
    <div className="messages">
      <Header />
      <div className="messages__list" id="message-list">
        {messageList.map(message => (
          <Message message={message} nextMessage={message} botTyping={botTyping} />
        ))}
      </div>
      <Footer message={currentMessage} sendMessage={sendMessage} onChangeMessage={changeMessage} />
    </div>
  );
}

export default Messages;
