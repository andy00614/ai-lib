"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Mic, 
  BookOpen, 
  MessageSquare, 
  Search, 
  Volume2, 
  FileText,
  Menu,
  X,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "首页", href: "/", icon: Home },
  { name: "语音克隆", href: "/voice-clone", icon: Mic },
  { name: "知识点生成", href: "/knowledge", icon: BookOpen, disabled: true },
  { name: "多模型问答", href: "/chat", icon: MessageSquare, disabled: true },
  { name: "RAG 知识检索", href: "/search", icon: Search, disabled: true },
  { name: "语音转文本", href: "/speech-to-text", icon: FileText, disabled: true },
  { name: "文本转语音", href: "/text-to-speech", icon: Volume2, disabled: true },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-white border border-border text-foreground rounded-md shadow-sm"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <motion.div 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-border shadow-sm transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        initial={{ x: -256 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-border">
            <h1 className="text-xl font-semibold text-foreground">AI 工具集</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.disabled ? "#" : item.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : item.disabled
                      ? "text-muted-foreground cursor-not-allowed"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => {
                    if (!item.disabled) {
                      setIsOpen(false);
                    }
                  }}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                  {item.disabled && (
                    <span className="ml-auto text-xs text-muted-foreground">即将推出</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              基于 ai-sdk 构建
            </p>
          </div>
        </div>
      </motion.div>

      {/* Overlay for mobile */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}