import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          AI 工具集
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          打造智能化的 AI 工具集，帮助您在学习、创作、交流和语音交互等场景中更高效、更好用。
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {/* 语音克隆卡片 */}
          <Link href="/voice-clone">
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 cursor-pointer border border-gray-100 hover:border-blue-200">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                语音克隆
              </h3>
              <p className="text-gray-600 text-sm">
                只需10秒录音，即可训练出专属的AI语音模型，让AI学会您的声音
              </p>
            </div>
          </Link>

          {/* 知识生成卡片 */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 cursor-pointer border border-gray-100 hover:border-blue-200 opacity-60">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              知识点生成
            </h3>
            <p className="text-gray-600 text-sm">
              输入知识点，自动生成结构清晰的大纲和相关练习题（即将推出）
            </p>
          </div>

          {/* 多模型问答卡片 */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 cursor-pointer border border-gray-100 hover:border-blue-200 opacity-60">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              多模型问答
            </h3>
            <p className="text-gray-600 text-sm">
              一次性调用多个AI模型，横向对比不同模型的回答效果（即将推出）
            </p>
          </div>

          {/* RAG 知识检索卡片 */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 cursor-pointer border border-gray-100 hover:border-blue-200 opacity-60">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              RAG 知识检索
            </h3>
            <p className="text-gray-600 text-sm">
              上传文档，构建专属知识库，智能问答系统（即将推出）
            </p>
          </div>

          {/* 语音转文本卡片 */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 cursor-pointer border border-gray-100 hover:border-blue-200 opacity-60">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011 1v8a1 1 0 01-1 1H8a1 1 0 01-1-1V2a1 1 0 011-1v3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              语音转文本
            </h3>
            <p className="text-gray-600 text-sm">
              实时语音转文字，支持多语言识别（即将推出）
            </p>
          </div>

          {/* 文本转语音卡片 */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 cursor-pointer border border-gray-100 hover:border-blue-200 opacity-60">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              文本转语音
            </h3>
            <p className="text-gray-600 text-sm">
              将文字转换为自然流畅的语音，支持多种音色（即将推出）
            </p>
          </div>
        </div>

        <div className="mt-16">
          <p className="text-gray-500 text-sm">
            基于 ai-sdk 构建，提供统一的AI接口和流式体验
          </p>
        </div>
      </div>
    </div>
  );
}
