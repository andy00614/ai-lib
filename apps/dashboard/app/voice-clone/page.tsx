'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mic, CheckCircle } from 'lucide-react';
import AudioRecorder from './components/AudioRecorder';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const requirements = [
  "录音时长至少10秒，建议30秒-2分钟",
  "在安静环境中录音，避免背景噪音",
  "说话清晰，语速适中，情感自然",
  "建议朗读一些富有表现力的文本"
];

export default function VoiceClonePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 rounded-lg border border-border">
              <Mic className="h-8 w-8 text-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            语音克隆工具
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-8">
            录制您的语音样本，我们将为您创建专属的AI语音模型。只需10秒的录音，即可让AI学会您的声音。
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Recording Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-border shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">开始录音</CardTitle>
                <CardDescription>
                  点击下方按钮开始录制您的语音样本
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AudioRecorder />
              </CardContent>
            </Card>
          </motion.div>

          {/* Requirements Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <CheckCircle className="h-5 w-5 text-foreground mr-2" />
                  录音要求
                </CardTitle>
                <CardDescription>
                  为了获得最佳的语音克隆效果，请遵循以下录音要求
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {requirements.map((requirement, index) => (
                    <motion.li 
                      key={index}
                      className="flex items-center text-sm text-foreground"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                    >
                      <div className="w-2 h-2 bg-foreground rounded-full mr-3 flex-shrink-0"></div>
                      {requirement}
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}