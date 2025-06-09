import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import OllamaChat from './Pages/OllamaChat.jsx';
import MessageBubble from './Components/chat/MessageBubble.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <OllamaChat />
  </React.StrictMode>
);
