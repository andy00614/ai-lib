"use client"
import Image from "next/image"
import { ArrowLeft, Download, RefreshCcw, PackageOpen, Sparkles, Brain, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Stepper } from "@/components/stepper"
import { useMemo, useState, useRef } from "react"
import SampleImage from "../sample.png"

type PartialPrinciple = {
  topic?: string;
  summary?: string;
  mechanism?: string[];
  cause?: string[];
  effects?: string[];
  consequence?: string[];
  analogies?: string[];
  classroomSafe?: boolean;
}

export default function Home() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [question, setQuestion] = useState("为什么恐龙会灭绝？")
  const [style, setStyle] = useState("")
  
  // Stream states
  const [principle, setPrinciple] = useState<PartialPrinciple>({})
  const [loadingBreakdown, setLoadingBreakdown] = useState(false)
  const [streamComplete, setStreamComplete] = useState(false)
  
  // Image states
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [loadingImage, setLoadingImage] = useState(false)
  
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3003/api"
  const abortControllerRef = useRef<AbortController | null>(null)

  const steps = useMemo(
    () => [
      { id: 1, label: "输入问题", icon: Brain },
      { id: 2, label: "分解问题", icon: Sparkles },
      { id: 3, label: "生成插图", icon: ImageIcon },
    ],
    []
  )

  async function handleDecomposeStream() {
    try {
      // Immediately show step 2 with loading state
      setLoadingBreakdown(true)
      setStreamComplete(false)
      setPrinciple({})
      setStep(2)
      
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      const response = await fetch(`${apiBase}/text-to-image/principle/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: question }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No reader available")
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(line => line.trim())

        for (const line of lines) {
          try {
            const partialData = JSON.parse(line)
            
            // Handle initial status message
            if (partialData.status === "starting") {
              console.log('Stream started for topic:', partialData.topic)
              continue
            }
            
            // Handle principle data
            if (typeof partialData === 'object' && partialData !== null) {
              setPrinciple(prev => ({
                ...prev,
                ...partialData
              }))
            }
          } catch (e) {
            console.warn('Failed to parse chunk:', line)
          }
        }
      }

      setStreamComplete(true)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Stream aborted')
        return
      }
      console.error('Stream error:', error)
      // Fallback to non-streaming
      await handleDecomposeFallback()
    } finally {
      setLoadingBreakdown(false)
    }
  }

  async function handleDecomposeFallback() {
    try {
      const res = await fetch(`${apiBase}/text-to-image/principle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: question })
      })
      const json = await res.json()
      const data = json?.data || {}
      setPrinciple(data)
      setStreamComplete(true)
    } catch (e) {
      console.error(e)
      setPrinciple({
        topic: question,
        summary: "由于多种复杂的环境因素导致恐龙这一古老物种的灭绝",
        mechanism: ["小行星撞击地球", "火山活动加剧", "气候急剧变化"],
        cause: ["地质活动", "天体撞击", "环境恶化"],
        effects: ["生态系统崩溃", "食物链断裂", "栖息地消失"],
        consequence: ["物种大灭绝", "哺乳动物崛起", "生态重建"],
        classroomSafe: true
      })
      setStreamComplete(true)
    }
  }

  async function handleGenerate() {
    try {
      // Immediately show step 3 with loading state
      setLoadingImage(true)
      setImageSrc(null) // Clear previous image
      setStep(3)

      const response = await fetch(`${apiBase}/text-to-image/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic: question,
          style: style || undefined
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Since the API now returns binary PNG data
      const blob = await response.blob()
      const imageUrl = URL.createObjectURL(blob)
      setImageSrc(imageUrl)
    } catch (e) {
      console.error(e)
      setImageSrc(null)
    } finally {
      setLoadingImage(false)
    }
  }

  const getAllBreakdownItems = () => {
    const items: string[] = []
    if (principle.mechanism) items.push(...principle.mechanism)
    if (principle.cause) items.push(...principle.cause)
    if (principle.effects) items.push(...principle.effects)
    if (principle.consequence) items.push(...principle.consequence)
    return items.slice(0, 5)
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-4">
          <h1 className="text-2xl font-bold mb-2">
            AI 插图生成器
          </h1>
          <p className="text-sm text-muted-foreground">
            将复杂概念分解为易懂的步骤，并生成精美的教学插图
          </p>
        </header>

        {/* Progress Stepper */}
        <div className="mb-4">
          <Stepper
            steps={steps.map(s => ({
              id: s.id,
              label: s.label,
              icon: s.icon
            }))}
            currentStep={step}
          />
        </div>

        <main>
          {/* Step 1: Input */}
          {step === 1 && (
            <Card>
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg font-semibold flex items-center justify-center gap-2 mb-2">
                  <Brain className="size-5" />
                  输入你想了解的问题
                </CardTitle>
                <CardDescription className="text-sm">
                  输入任何你好奇的科学或知识问题，AI 将帮你深入解析
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-6 pb-6">
                <div className="space-y-2">
                  <Label htmlFor="question" className="text-sm font-medium">
                    问题描述
                  </Label>
                  <Textarea
                    id="question"
                    placeholder="例如：为什么恐龙会灭绝？机器学习是如何工作的？"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="min-h-[80px] text-sm resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="style" className="text-sm font-medium">
                    插图风格（可选）
                  </Label>
                  <Input
                    id="style"
                    placeholder="例如：扁平设计、卡通风格、科技感、手绘风格..."
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="text-sm h-9"
                  />
                </div>
                <Button 
                  onClick={handleDecomposeStream} 
                  disabled={loadingBreakdown || !question.trim()}
                  className="w-full h-9 text-sm"
                >
                  {loadingBreakdown ? (
                    <>
                      <Sparkles className="mr-2 size-4 animate-spin" />
                      AI 正在分析中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 size-4" />
                      开始 AI 分析
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Breakdown */}
          {step === 2 && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Sparkles className="size-5" />
                      问题分解分析
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                      <ArrowLeft className="mr-1 size-3" />
                      返回编辑
                    </Button>
                  </div>
                  <CardDescription className="text-sm">
                    AI 正在分析：<span className="font-medium">{question}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-6 pb-6">
                  {/* Summary */}
                  {principle.summary ? (
                    <div className="p-3 bg-muted rounded-lg border">
                      <h3 className="text-sm font-semibold mb-2">核心概述</h3>
                      <p className="text-sm">{principle.summary}</p>
                    </div>
                  ) : loadingBreakdown ? (
                    <div className="p-3 bg-muted rounded-lg border">
                      <h3 className="text-sm font-semibold mb-2">核心概述</h3>
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4 mt-2" />
                    </div>
                  ) : null}

                  {/* Breakdown Items */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">关键要点分解</h3>
                    <div className="grid gap-2">
                      {getAllBreakdownItems().map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg border"
                        >
                          <Badge variant="secondary" className="text-xs min-w-6 h-6 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <span className="text-sm flex-1">{item}</span>
                        </div>
                      ))}
                      
                      {/* Loading skeletons for streaming */}
                      {loadingBreakdown && (
                        <>                     
                          {Array.from({ length: Math.max(1, 5 - getAllBreakdownItems().length) }).map((_, index) => (
                            <div key={`skeleton-${index}`} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border animate-pulse">
                              <Badge variant="outline" className="text-xs min-w-6 h-6 flex items-center justify-center">
                                <Sparkles className="size-3 animate-spin" />
                              </Badge>
                              <Skeleton className="h-3 flex-1" />
                            </div>
                          ))}
                          {getAllBreakdownItems().length === 0 && (
                            <div className="text-center py-4 text-muted-foreground">
                              <Sparkles className="size-5 animate-spin mx-auto mb-2" />
                              <p className="text-sm">AI 正在深度分析你的问题...</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Analogies */}
                  {principle.analogies && principle.analogies.length > 0 && (
                    <div className="p-3 bg-muted rounded-lg border">
                      <h3 className="text-sm font-semibold mb-2">生动比喻</h3>
                      <ul className="space-y-1">
                        {principle.analogies.map((analogy, index) => (
                          <li key={index} className="text-sm">• {analogy}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-2">
                    <Button 
                      onClick={handleGenerate} 
                      disabled={loadingImage || (!streamComplete && loadingBreakdown)}
                      className="w-full h-9 text-sm"
                    >
                      {loadingImage ? (
                        <>
                          <ImageIcon className="mr-2 size-4 animate-pulse" />
                          AI 正在创作插图...
                        </>
                      ) : (
                        <>
                          <ImageIcon className="mr-2 size-4" />
                          生成教学插图
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Generated Image */}
          {step === 3 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <ImageIcon className="size-6" />
                      生成的教学插图
                    </CardTitle>
                    <Button variant="ghost" onClick={() => setStep(2)}>
                      <ArrowLeft className="mr-2 size-4" />
                      返回分解
                    </Button>
                  </div>
                  <CardDescription>
                    基于问题分析生成的可视化插图
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Image Display */}
                  <div className="relative aspect-video max-w-xl mx-auto">
                    <div className="rounded-xl border bg-background p-4">
                      {loadingImage && !imageSrc ? (
                        <div className="aspect-square w-full rounded-lg bg-muted/50 flex flex-col items-center justify-center gap-4">
                          <div className="space-y-3 text-center">
                            <ImageIcon className="size-12 animate-pulse mx-auto text-muted-foreground" />
                            <div className="space-y-2">
                              <p className="text-lg font-medium">AI 正在创作插图</p>
                              <p className="text-sm text-muted-foreground">
                                基于你的问题"{question}"生成精美插图...
                              </p>
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <div className="size-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                              <div className="size-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                              <div className="size-2 bg-primary rounded-full animate-bounce"></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Image
                          src={imageSrc || SampleImage}
                          alt="Generated illustration"
                          width={1024}
                          height={1024}
                          className="w-full h-auto rounded-lg"
                          style={{ objectFit: 'cover' }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Breakdown Summary */}
                  <div className="bg-muted rounded-lg p-4">
                    <h3 className="font-semibold mb-3">插图说明要点</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {getAllBreakdownItems().map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="text-xs min-w-6 justify-center">
                            {index + 1}
                          </Badge>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant="secondary" 
                      onClick={handleGenerate} 
                      disabled={loadingImage}
                      className="flex-1 min-w-0"
                    >
                      {loadingImage ? (
                        <>
                          <Sparkles className="mr-2 size-4 animate-spin"/>
                          创作中...
                        </>
                      ) : (
                        <>
                          <RefreshCcw className="mr-2 size-4"/>
                          重新生成
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (!imageSrc) return
                        const a = document.createElement('a')
                        a.href = imageSrc
                        a.download = `illustration-${Date.now()}.png`
                        a.click()
                      }}
                      disabled={!imageSrc || loadingImage}
                      className="flex-1 min-w-0"
                    >
                      <Download className="mr-2 size-4"/>
                      下载图片
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 min-w-0"
                      disabled={loadingImage}
                    >
                      <PackageOpen className="mr-2 size-4"/>
                      打包下载
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}