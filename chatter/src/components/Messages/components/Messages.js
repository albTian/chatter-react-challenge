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

  const [messageList, setMessageList] = useState([{user: 1, id: -1, message: initialBottyMessage}])
  const [currentMessage, setCurrentMessage] = useState("")
  const [messageID, setMessageID] = useState(0)
  const [botTyping, setBotTyping] = useState(false)

  const changeMessage = (event) => {
    setCurrentMessage(event.target.value)
  }

  const sendMessage = (event) => {
    const nextMessage = {
      id: messageID,
      user: ME,
      message: currentMessage
    }
    setMessageList(prevMessageList => [...prevMessageList, nextMessage])
    // Look at this later...
    setCurrentMessage("")
    setMessageID(prevMessageID => prevMessageID + 1)
    // socket.emit(nextMessage)
    socket.emmit()
    playSend()
  }

  useEffect(() => {
    console.log("on startup, connecting to socket...");
    socket.connect();
  }, [])

  socket.on('bot-message', (message) => {
    console.log(`botty sending ${message}`);
  });

  socket.on('bot-typing', (message) => {
    console.log(`bot-typing ${message}`);
    setBotTyping(true)
  });

  socket.on('user-message', (message) => {
    console.log(`user-message ${message}`);
  });

  return (
    <div className="messages">
      <Header />
      <div className="messages__list" id="message-list">
        {/* List of messages here... maintain as state maybe ...?*/}
        {messageList.map(message => (
          <Message message={message} nextMessage={"nextMessage"} botTyping={false} />
        ))}
      </div>
      <Footer message={currentMessage} sendMessage={sendMessage} onChangeMessage={changeMessage} />
    </div>
  );
}

export default Messages;
