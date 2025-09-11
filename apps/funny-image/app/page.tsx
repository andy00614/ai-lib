"use client"
import Image from "next/image"
import { ArrowLeft, Download, RefreshCcw, PackageOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Stepper } from "@/components/stepper"
import { useMemo, useState } from "react"
import SampleImage from "../sample.png"

export default function Home() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [question, setQuestion] = useState(
    "为什么恐龙会灭绝？"
  )
  const steps = useMemo(
    () => [
      { id: 1, label: "输入问题" },
      { id: 2, label: "分解问题" },
      { id: 3, label: "生成插图" },
    ],
    []
  )

  const [breakdown, setBreakdown] = useState<string[]>([])
  const [loadingBreakdown, setLoadingBreakdown] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [loadingImage, setLoadingImage] = useState(false)

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3003/api"

  async function handleDecompose() {
    try {
      setLoadingBreakdown(true)
      const res = await fetch(`${apiBase}/text-to-image/principle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: question })
      })
      const json = await res.json()
      const data = json?.data || {}
      const merged: string[] = [
        ...(data.mechanism || []),
        ...(data.cause || []),
        ...(data.effects || []),
        ...(data.consequence || []),
      ]
      const unique = Array.from(new Set(merged)).filter(Boolean).slice(0, 5)
      setBreakdown(unique.length ? unique : [
        "恐龙的繁盛时代",
        "小行星撞击前兆",
        "撞击瞬间与全球尘埃",
        "连锁气候变化",
        "物种灭绝与新生",
      ])
      setStep(2)
    } catch (e) {
      console.error(e)
      setBreakdown([
        "恐龙的繁盛时代",
        "小行星撞击前兆",
        "撞击瞬间与全球尘埃",
        "连锁气候变化",
        "物种灭绝与新生",
      ])
      setStep(2)
    } finally {
      setLoadingBreakdown(false)
    }
  }

  async function handleGenerate() {
    try {
      setLoadingImage(true)
      const res = await fetch(`${apiBase}/text-to-image/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: question })
      })
      const json = await res.json()
      const b64 = json?.data?.imageBase64 as string | undefined
      if (b64) setImageSrc(`data:image/png;base64,${b64}`)
      setStep(3)
    } catch (e) {
      console.error(e)
      setImageSrc(null)
      setStep(3)
    } finally {
      setLoadingImage(false)
    }
  }

  return (
    <div className="min-h-dvh bg-muted/20">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Button variant="ghost" size="sm" onClick={() => setStep((s) => (s > 1 ? ((s - 1) as any) : s))}>
              <ArrowLeft className="mr-1 size-4" />
              返回
            </Button>
            <div>
              <div className="text-lg font-semibold text-foreground">你的专属插画</div>
              <div className="text-xs text-muted-foreground">基于 AI 分析生成的教育插画</div>
            </div>
          </div>

          <Button variant="link" onClick={() => setStep(2)} className="text-primary">
            返回修改
          </Button>
        </div>

        <div className="mt-6">
          <Stepper steps={steps} current={step} />
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">问题</CardTitle>
            <CardDescription>
              {step === 1 && "请输入你想讲解或生成插图的问题。"}
              {step === 2 && "已根据你的问题进行要点拆分，可在此调整。"}
              {step === 3 && "下面展示根据问题自动生成的插图与步骤。"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="question">输入你的问题</Label>
                  <Textarea
                    id="question"
                    placeholder="例如：为什么恐龙会灭绝？"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Input placeholder="可选：指定插画风格，例如 扁平可爱" />
                  <Button onClick={handleDecompose} disabled={loadingBreakdown}>
                    {loadingBreakdown ? "分析中..." : "开始分解"}
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-sm text-muted-foreground">
                  基于问题“{question}”，系统建议以下 5 个讲解步骤：
                </div>
                <ol className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {breakdown.map((b, i) => (
                    <li key={b} className="rounded-lg border bg-card p-3">
                      <div className="text-sm font-medium">{i + 1}. {b}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        点击后可微调提示词与内容。
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setStep(1)}>上一步</Button>
                  <Button onClick={handleGenerate} disabled={loadingImage}>
                    {loadingImage ? "生成中..." : "生成插图"}
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="text-center text-2xl font-bold tracking-tight">
                    WHY DID THE DINOSAURS DIE OUT?
                  </div>
                  <div className="rounded-xl border bg-background p-3">
                    <Image
                      src={imageSrc || SampleImage}
                      alt="生成的插图预览"
                      width={1024}
                      height={768}
                      className="mx-auto h-auto w-full rounded-lg"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    封面图 - 由 Gemini AI 生成
                  </div>
                </div>

                <Separator />

                <div className="grid gap-6 md:grid-cols-5">
                  <div className="md:col-span-3 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">分步骤生成（5 个步骤）</div>
                      <Badge variant="success">已启用风格一致性</Badge>
                    </div>
                    <div className="grid gap-2">
                      {breakdown.map((b, i) => (
                        <Button key={b} variant={i === 0 ? "secondary" : "outline" as any} className="justify-start">
                          <span className="mr-2 rounded-full bg-primary text-primary-foreground size-5 text-[11px] inline-flex items-center justify-center">{i + 1}</span>
                          {b}
                        </Button>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button variant="secondary" onClick={handleGenerate} disabled={loadingImage}>
                        <RefreshCcw className="mr-1 size-4"/>{loadingImage ? "生成中..." : "重新生成"}
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
                      >
                        <Download className="mr-1 size-4"/>下载图片
                      </Button>
                      <Button variant="outline"><PackageOpen className="mr-1 size-4"/>打包下载</Button>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <Button className="w-full">生成所有步骤图片</Button>
                    <Button variant="secondary" className="w-full">生成此步骤</Button>
                    <Separator />
                    <Button variant="outline" className="w-full">创建新插画</Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
