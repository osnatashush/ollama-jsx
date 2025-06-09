import React, { useState, useRef, useEffect } from 'react';
import Button from '../ui/button';
import { Mic, MicOff, Square } from 'lucide-react';

function AnimatedDots() {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length < 3 ? prev + '.' : ''));
    }, 400);
    return () => clearInterval(interval);
  }, []);
  return <span>{dots}</span>;
}

export default function VoiceRecorder({ onTranscription, onVoiceResponse, onVoiceUserLoading, disabled, isRecording, setIsRecording }) {


  const [loading, setLoading] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const streamRef = useRef(null);
  const cancelled = useRef(false); // Track if cancel was pressed
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);

  const startRecording = async () => {
    cancelled.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        setIsRecording(false);
        clearInterval(timerRef.current);
        setRecordingTime(0);
        if (cancelled.current) return; // If cancelled, do not send or call onVoiceResponse
        // Show 'thinking' indicator in chat before sending audio
        let tempId = undefined;
        if (onVoiceUserLoading) {
          tempId = onVoiceUserLoading();
        }
        // Force React to render the blue bubble before sending
        await Promise.resolve();
        // Now send audio to backend
        try {
          const formData = new FormData();
          formData.append('file', audioBlob, 'audio.wav');
          const response = await fetch('http://localhost:8006/voice', {
            method: 'POST',
            body: formData
          });
          if (response.ok) {
            const data = await response.json();
            if (onVoiceResponse) {
              onVoiceResponse(data.transcription, data.response, tempId);
            }
          } else {
            if (onVoiceResponse) {
              onVoiceResponse('Voice upload failed', '', tempId);
            }
          }
        } catch (err) {
          if (onVoiceResponse) {
            onVoiceResponse('Voice upload failed', '', tempId);
          }
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleSend = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
      const response = await fetch('http://localhost:8006/voice', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        const data = await response.json();
        if (onVoiceResponse) {
          onVoiceResponse(data.transcription, data.response);
        }
      } else {
        if (onVoiceResponse) {
          onVoiceResponse('Voice upload failed', '');
        }
      }
    } catch (err) {
      if (onVoiceResponse) {
        onVoiceResponse('Voice upload failed', '');
      }
    }
    setLoading(false);
    setShowActions(false);
    setAudioURL(null);
    setAudioBlob(null);
  };

  const handleCancel = () => {
    cancelled.current = true;
    if (isRecording && mediaRecorder.current) {
      mediaRecorder.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
    setLoading(false);
    // Do NOT call onVoiceResponse here. No message is sent on cancel.
  };



  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center min-h-[48px] w-full">
      {/* While recording: show stop and cancel */}
      {isRecording && (
        <div className="flex items-center justify-center gap-4 w-full">
          <button
            aria-label="Stop recording"
            className="text-blue-500 text-sm font-bold bg-white/10 rounded-full px-2 py-1 hover:bg-blue-600 hover:text-white transition-colors leading-none"
            onClick={stopRecording}
          >&#9632;</button>
          <button
            aria-label="Cancel"
            className="text-blue-500 text-sm font-bold bg-white/10 rounded-full px-2 py-1 hover:bg-blue-600 hover:text-white transition-colors leading-none"
            onClick={handleCancel}
          >❌</button>
        </div>
      )}
      {/* Show mic button when idle */}
      {!isRecording && (
        <Button
          variant={"secondary"}
          size="icon"
          onClick={startRecording}
          disabled={disabled}
          className="relative"
        >
          <Mic className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}