import React, { useEffect, useRef } from 'react';
import cx from 'classnames';

const ME = 'me';

export default function Message({ nextMessage, message, botTyping }) {
  // What shape is `message` and `nextMessage?
  // message {
  //  user
  //  id
  //  message
  // }
  const ref = useRef(null)
  const scrollToBottom = () => {
    ref.current.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (ref) {
      scrollToBottom()
    }
  })
  return (
    <p
      className={cx(
        'messages__message',
        'animate__animated animate__rubberBand',
        {
          'messages__message--me': message.user === ME,
          'messages__message--last': (!nextMessage && (!botTyping || message.user === ME))
            || (nextMessage && nextMessage.user !== message.user)
        }
      )}
      key={message.id}
      ref={ref}
    >
      {message.message}
    </p>
  );
}
