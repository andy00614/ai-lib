'use client';

import React from 'react';
import AudioRecorder from './components/AudioRecorder';

export default function VoiceClonePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            语音克隆工具
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            录制您的语音样本，我们将为您创建专属的AI语音模型。只需10秒的录音，即可让AI学会您的声音。
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <AudioRecorder />
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            录音要求
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
              录音时长至少10秒，建议30秒-2分钟
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
              在安静环境中录音，避免背景噪音
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
              说话清晰，语速适中，情感自然
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
              建议朗读一些富有表现力的文本
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}