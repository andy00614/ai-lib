'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, Square, Mic, MicOff, Upload, Download, Trash2 } from 'lucide-react';

interface AudioRecorderProps {
  onAudioSave?: (audioBlob: Blob, duration: number) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioSave }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string>('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 开始录音
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setAudioBlob(blob);
        
        // 停止所有轨道
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setUploadSuccess(false);

      // 开始计时
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('无法访问麦克风，请检查权限设置');
    }
  }, []);

  // 停止录音
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [isRecording]);

  // 播放录音
  const playAudio = useCallback(() => {
    if (audioRef.current) {
      if (isPaused) {
        audioRef.current.play();
        setIsPaused(false);
      } else {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      setIsPlaying(true);
    }
  }, [isPaused]);

  // 暂停播放
  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  }, []);

  // 停止播放
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, []);

  // 清除录音
  const clearAudio = useCallback(() => {
    setAudioURL('');
    setAudioBlob(null);
    setIsPlaying(false);
    setIsPaused(false);
    setRecordingTime(0);
    setUploadSuccess(false);
    if (audioRef.current) {
      audioRef.current.src = '';
    }
  }, []);

  // 转换为WAV格式
  const convertToWav = useCallback(async (audioBlob: Blob): Promise<Blob> => {
    return new Promise((resolve) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // 创建WAV文件
          const wavBuffer = audioBufferToWav(audioBuffer);
          const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
          resolve(wavBlob);
        } catch (error) {
          console.error('Error converting to WAV:', error);
          resolve(audioBlob); // 如果转换失败，返回原始文件
        }
      };
      
      reader.readAsArrayBuffer(audioBlob);
    });
  }, []);

  // AudioBuffer转WAV格式
  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    const channels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;

    // WAV文件头
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);

    // 写入音频数据
    const channelData = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }

    return arrayBuffer;
  };

  // 上传录音
  const uploadAudio = useCallback(async () => {
    if (!audioBlob) return;

    setIsUploading(true);
    try {
      // 转换为WAV格式
      const wavBlob = await convertToWav(audioBlob);
      
      const formData = new FormData();
      formData.append('audio', wavBlob, `recording_${Date.now()}.wav`);
      formData.append('duration', recordingTime.toString());

      const response = await fetch('/api/voice-clone/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUploadSuccess(true);
        onAudioSave?.(wavBlob, recordingTime);
        console.log('Upload successful:', result);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  }, [audioBlob, recordingTime, convertToWav, onAudioSave]);

  // 下载录音
  const downloadAudio = useCallback(async () => {
    if (!audioBlob) return;

    try {
      const wavBlob = await convertToWav(audioBlob);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voice_recording_${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  }, [audioBlob, convertToWav]);

  // 清理资源
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  return (
    <div className="space-y-6">
      {/* 录音控制区域 */}
      <div className="text-center">
        <div className="mb-6">
          {isRecording ? (
            <div className="inline-flex items-center space-x-4">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-2xl font-mono font-bold text-red-600">
                {formatTime(recordingTime)}
              </span>
            </div>
          ) : (
            <div className="text-2xl font-mono font-bold text-gray-600">
              {formatTime(recordingTime)}
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full transition-colors"
            >
              <Mic className="w-5 h-5" />
              <span>开始录音</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full transition-colors"
            >
              <MicOff className="w-5 h-5" />
              <span>停止录音</span>
            </button>
          )}
        </div>
      </div>

      {/* 录音播放区域 */}
      {audioURL && (
        <div className="bg-gray-50 rounded-lg p-6">
          <audio
            ref={audioRef}
            src={audioURL}
            onEnded={() => {
              setIsPlaying(false);
              setIsPaused(false);
            }}
            className="hidden"
          />

          <div className="flex items-center justify-center space-x-4 mb-4">
            <button
              onClick={isPlaying ? pauseAudio : playAudio}
              className="flex items-center justify-center w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>
            
            <button
              onClick={stopAudio}
              className="flex items-center justify-center w-12 h-12 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-colors"
            >
              <Square className="w-6 h-6" />
            </button>
          </div>

          <div className="flex justify-center space-x-3">
            <button
              onClick={uploadAudio}
              disabled={isUploading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                uploadSuccess 
                  ? 'bg-green-500 text-white cursor-default'
                  : isUploading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>
                {uploadSuccess ? '上传成功' : isUploading ? '上传中...' : '上传录音'}
              </span>
            </button>

            <button
              onClick={downloadAudio}
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>下载WAV</span>
            </button>

            <button
              onClick={clearAudio}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>清除</span>
            </button>
          </div>
        </div>
      )}

      {/* 录音提示 */}
      {recordingTime > 0 && recordingTime < 10 && !isRecording && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-center">
            ⚠️ 录音时长少于10秒，可能影响语音克隆效果，建议重新录制
          </p>
        </div>
      )}

      {recordingTime >= 10 && !isRecording && !uploadSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-center">
            ✅ 录音长度符合要求，可以上传进行语音克隆训练
          </p>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;