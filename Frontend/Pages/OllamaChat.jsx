import React, { useState, useEffect } from 'react';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';
import { AlertCircle, WifiOff } from 'lucide-react';
import Alert from "../components/ui/alert";
import Button from "../components/ui/button";

const BACKEND_ASK_URL = 'http://localhost:8006/ask';

export default function OllamaChatPage() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ollamaAvailable, setOllamaAvailable] = useState(true); // Assume available initially

  // Check Ollama availability on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        // Try to reach the backend /ask endpoint with a dummy question
        const response = await fetch('http://localhost:8006/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: 'ping' }),
        });
        if (!response.ok) {
          setOllamaAvailable(false);
          setError('Backend API is not responding. Please ensure the backend is running at http://localhost:8006.');
        } else {
          setOllamaAvailable(true);
          setError(null);
        }
      } catch (e) {
        setOllamaAvailable(false);
        setError('Could not connect to backend. Please ensure it is running at http://localhost:8006.');
        console.error("Backend connection check failed:", e);
      }
    };
    checkBackend();
  }, []);


  const handleSendMessage = async (userInput) => {
    setError(null); // Clear previous errors
    const newMessages = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch(BACKEND_ASK_URL, {
        method: 'POST',
        headers: {
          // Accept form-data as per backend API, or use JSON if backend supports it
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userInput
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Unknown error from backend' }));
        throw new Error(errData.error || `Backend responded with status ${response.status}`);
      }

      const data = await response.json();
      if (data && data.answer) {
        setMessages(prevMessages => [
          ...prevMessages,
          { role: 'assistant', content: data.answer.trim() },
        ]);
      } else {
        throw new Error('Received an unexpected response structure from backend.');
      }
      setOllamaAvailable(true); // If successful, backend is available
    } catch (e) {
      console.error("Error communicating with backend /ask:", e);
      setError(`Error: ${e.message}. Please ensure the backend is running at http://localhost:8006 and is reachable.`);
      setMessages(prevMessages => prevMessages.slice(0, -1)); // Remove user's message if AI fails
      if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
        setOllamaAvailable(false);
      }
    } finally {
      setIsLoading(false);
    }
  };


  const retryConnection = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (!response.ok) {
        setOllamaAvailable(false);
        setError('Ollama API is still not responding. Please ensure Ollama is running locally.');
      } else {
        setOllamaAvailable(true);
        setError(null); // Clear previous error if now available
      }
    } catch (e) {
      setOllamaAvailable(false);
      setError('Failed to connect to Ollama. Please ensure Ollama is running locally.');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-h-[800px] bg-white shadow-xl rounded-lg overflow-hidden">
      {!ollamaAvailable && (
        <Alert variant="destructive" className="m-4 rounded-md">
          <WifiOff className="h-5 w-5" />
          <strong>Backend Not Reachable</strong>
          <div>
            {error || "Cannot connect to backend at http://localhost:8006. Please ensure it's running."}
            <Button onClick={retryConnection} variant="outline" size="sm" className="mt-2">
              Retry Connection
            </Button>
          </div>
        </Alert>
      )}
      {error && ollamaAvailable && ( // Show general errors if ollama was available but something else went wrong
         <Alert variant="destructive" className="m-4 rounded-md">
          <AlertCircle className="h-5 w-5" />
          <strong>Chat Error</strong>
          <div>{error}</div>
        </Alert>
      )}
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading || !ollamaAvailable} />
    </div>
  );
}