
import { useState, useRef, useCallback } from 'react';

type RecorderState = 'idle' | 'recording' | 'stopped';

export const useAudioRecorder = () => {
  const [recorderState, setRecorderState] = useState<RecorderState>('idle');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setStream(mediaStream);
      mediaRecorderRef.current = new MediaRecorder(mediaStream, { mimeType: 'video/webm' });
      mediaChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        mediaChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const mediaBlob = new Blob(mediaChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(mediaBlob);
        setMediaUrl(url);
        setRecorderState('stopped');
        // Clean up stream tracks
        mediaStream.getTracks().forEach(track => track.stop());
        setStream(null);
      };

      mediaRecorderRef.current.start();
      setRecorderState('recording');
      setMediaUrl(null);
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const resetRecording = useCallback(() => {
    setRecorderState('idle');
    setMediaUrl(null);
    mediaRecorderRef.current = null;
    mediaChunksRef.current = [];
     if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  return {
    recorderState,
    audioUrl: mediaUrl, // Keep audioUrl for compatibility, but it's a video URL
    mediaUrl,
    stream,
    startRecording,
    stopRecording,
    resetRecording,
  };
};