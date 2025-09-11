"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Mic, 
  BookOpen, 
  MessageSquare, 
  Search, 
  Volume2, 
  FileText,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const tools = [
  {
    title: "语音克隆",
    description: "只需10秒录音，即可训练出专属的AI语音模型，让AI学会您的声音",
    icon: Mic,
    href: "/voice-clone",
    color: "bg-red-500",
    available: true,
  },
  {
    title: "知识点生成",
    description: "输入知识点，自动生成结构清晰的大纲和相关练习题",
    icon: BookOpen,
    href: "/knowledge",
    color: "bg-blue-500",
    available: false,
  },
  {
    title: "多模型问答",
    description: "一次性调用多个AI模型，横向对比不同模型的回答效果",
    icon: MessageSquare,
    href: "/chat",
    color: "bg-green-500",
    available: false,
  },
  {
    title: "RAG 知识检索",
    description: "上传文档，构建专属知识库，智能问答系统",
    icon: Search,
    href: "/search",
    color: "bg-purple-500",
    available: false,
  },
  {
    title: "语音转文本",
    description: "实时语音转文字，支持多语言识别",
    icon: FileText,
    href: "/speech-to-text",
    color: "bg-yellow-500",
    available: false,
  },
  {
    title: "文本转语音",
    description: "将文字转换为自然流畅的语音，支持多种音色",
    icon: Volume2,
    href: "/text-to-speech",
    color: "bg-indigo-500",
    available: false,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-6">
            AI 工具集
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-8">
            打造智能化的 AI 工具集，帮助您在学习、创作、交流和语音交互等场景中更高效、更好用。
          </p>
        </motion.div>

        {/* Tools Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <motion.div key={tool.title} variants={item}>
                {tool.available ? (
                  <Link href={tool.href}>
                    <Card className="h-full hover:shadow-lg transition-all duration-200 border-border hover:border-border/60 group cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 rounded-lg border border-border">
                            <Icon className="h-6 w-6 text-foreground" />
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                        <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                          {tool.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm leading-relaxed">
                          {tool.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                ) : (
                  <Card className="h-full opacity-60 border-border cursor-not-allowed">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-lg border border-border">
                          <Icon className="h-6 w-6 text-foreground opacity-50" />
                        </div>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          即将推出
                        </span>
                      </div>
                      <CardTitle className="text-xl font-semibold text-muted-foreground">
                        {tool.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed">
                        {tool.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <p className="text-sm text-muted-foreground">
            基于 ai-sdk 构建，提供统一的AI接口和流式体验
          </p>
        </motion.div>
      </div>
    </div>
  );
}
