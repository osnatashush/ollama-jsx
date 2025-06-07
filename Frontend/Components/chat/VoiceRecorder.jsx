import React, { useState, useRef } from 'react';
import Button from '../ui/button';
import { Mic, MicOff, Square } from 'lucide-react';

export default function VoiceRecorder({ onTranscription, disabled }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        
        // Here you would typically send the audio to a speech-to-text service
        // For demo purposes, we'll simulate a transcription
        setTimeout(() => {
          const mockTranscription = "This is a mock transcription from voice input.";
          onTranscription(mockTranscription);
        }, 1000);

        // Clean up
        stream.getTracks().forEach(track => track.stop());
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
      setIsRecording(false);
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2">
      {isRecording && (
        <div className="flex items-center gap-2 glass-effect px-3 py-1 rounded-lg animate-scale-in">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse-soft"></div>
          <span className="text-xs text-blue-200 font-mono">{formatTime(recordingTime)}</span>
        </div>
      )}
      
      <Button
        variant={isRecording ? "destructive" : "secondary"}
        size="icon"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        className={`relative ${isRecording ? 'animate-pulse-soft' : ''}`}
      >
        {isRecording ? (
          <Square className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}