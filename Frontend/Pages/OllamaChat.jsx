import React, { useState, useEffect } from 'react';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';
import { AlertCircle, WifiOff } from 'lucide-react';
import Alert from "../components/ui/alert";
import Button from "../components/ui/button";

const OLLAMA_API_URL = 'http://localhost:11434/api/chat';
const MODEL_NAME = 'mistral'; // Or any other model you have like 'llama2', 'codellama'

export default function OllamaChatPage() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ollamaAvailable, setOllamaAvailable] = useState(true); // Assume available initially

  // Check Ollama availability on mount
  useEffect(() => {
    const checkOllama = async () => {
      try {
        // A light check, like trying to list models or a very short prompt
        const response = await fetch('http://localhost:11434/api/tags');
        if (!response.ok) {
          // throw new Error(`Ollama API check failed: ${response.statusText}`);
          // Don't throw, just set state. User might start ollama later.
           setOllamaAvailable(false);
           setError('Ollama API is not responding. Please ensure Ollama is running locally on port 11434.');
        } else {
           setOllamaAvailable(true);
           setError(null); // Clear previous error if now available
        }
      } catch (e) {
        setOllamaAvailable(false);
        setError('Could not connect to Ollama. Please ensure Ollama is running locally on port 11434.');
        console.error("Ollama connection check failed:", e);
      }
    };
    checkOllama();
  }, []);


  const handleSendMessage = async (userInput) => {
    setError(null); // Clear previous errors
    const newMessages = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setIsLoading(true);

    // Prepare context from previous messages
    const ollamaMessages = newMessages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      const response = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: ollamaMessages,
          stream: false, // For simplicity, not using streaming responses
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Unknown error from Ollama API' }));
        throw new Error(errData.error || `Ollama API responded with status ${response.status}`);
      }

      const data = await response.json();
      
      if (data.message && data.message.content) {
        setMessages(prevMessages => [
          ...prevMessages,
          { role: 'assistant', content: data.message.content.trim() },
        ]);
      } else {
        throw new Error('Received an unexpected response structure from Ollama.');
      }
      setOllamaAvailable(true); // If successful, Ollama is available

    } catch (e) {
      console.error("Error communicating with Ollama:", e);
      setError(`Error: ${e.message}. Please ensure Ollama is running and the model '${MODEL_NAME}' is available.`);
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
          <AlertTitle>Ollama Not Reachable</AlertTitle>
          <AlertDescription>
            {error || "Cannot connect to Ollama at http://localhost:11434. Please ensure it's running."}
            <Button onClick={retryConnection} variant="outline" size="sm" className="mt-2">
              Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {error && ollamaAvailable && ( // Show general errors if ollama was available but something else went wrong
         <Alert variant="destructive" className="m-4 rounded-md">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Chat Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading || !ollamaAvailable} />
    </div>
  );
}