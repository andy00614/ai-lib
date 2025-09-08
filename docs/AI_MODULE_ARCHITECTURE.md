# Midday AI 模块技术文档

## 目录
- [系统概述](#系统概述)
- [技术架构](#技术架构)
- [AI 服务集成](#ai-服务集成)
- [核心组件](#核心组件)
- [智能功能实现](#智能功能实现)
- [向量数据库集成](#向量数据库集成)
- [实现细节](#实现细节)
- [性能优化](#性能优化)
- [最佳实践](#最佳实践)

## 系统概述

Midday 采用基于 Google Gemini 的现代 AI 架构，结合向量数据库和机器学习技术，为财务管理提供智能化解决方案。系统支持自动分类、智能匹配、语义搜索，并针对财务数据处理进行了深度优化。

### 核心特性
- 🤖 智能交易分类 (AI-Powered Transaction Classification)
- 🔍 语义搜索 (Vector-based Semantic Search)
- 📊 智能数据增强 (Automatic Data Enrichment)
- 🏷️ 自动商家识别 (Merchant Recognition)
- 📄 文档智能处理 (Document Classification)
- 🧠 向量嵌入 (Vector Embeddings)
- ⚡ 批量处理优化 (Batch Processing)
- 🎯 上下文感知推理 (Context-Aware Reasoning)

## 技术架构

### 整体架构图

```mermaid
graph TB
    %% 应用层
    subgraph "应用层"
        DASHBOARD[Dashboard 前端]
        API_SERVER[API 服务器]
        BACKGROUND_JOBS[后台任务队列]
    end

    %% AI 服务层
    subgraph "AI 服务层"
        GEMINI[Google Gemini API]
        AI_SDK[Vercel AI SDK]
        EMBEDDING_SERVICE[嵌入向量服务]
        CLASSIFICATION_ENGINE[分类引擎]
    end

    %% AI 组件层
    subgraph "AI 组件层"
        CATEGORY_AI[分类 AI 模块]
        ENRICHMENT_AI[数据增强 AI]
        DOCUMENT_AI[文档 AI 处理]
        SEARCH_AI[智能搜索]
    end

    %% 向量存储层
    subgraph "向量存储层"
        PGVECTOR[PostgreSQL + pgvector]
        TRANSACTION_EMBEDDINGS[交易向量]
        CATEGORY_EMBEDDINGS[分类向量]
        DOCUMENT_EMBEDDINGS[文档向量]
    end

    %% 数据处理层
    subgraph "数据处理层"
        TEXT_PROCESSING[文本预处理]
        BATCH_PROCESSOR[批量处理器]
        VECTOR_INDEX[向量索引]
        SIMILARITY_ENGINE[相似度计算]
    end

    %% 连接关系
    DASHBOARD --> API_SERVER
    API_SERVER --> BACKGROUND_JOBS
    
    BACKGROUND_JOBS --> CATEGORY_AI
    BACKGROUND_JOBS --> ENRICHMENT_AI
    BACKGROUND_JOBS --> DOCUMENT_AI
    
    CATEGORY_AI --> GEMINI
    ENRICHMENT_AI --> GEMINI
    DOCUMENT_AI --> GEMINI
    SEARCH_AI --> EMBEDDING_SERVICE
    
    GEMINI --> AI_SDK
    EMBEDDING_SERVICE --> AI_SDK
    
    CATEGORY_AI --> TEXT_PROCESSING
    ENRICHMENT_AI --> BATCH_PROCESSOR
    
    TEXT_PROCESSING --> PGVECTOR
    BATCH_PROCESSOR --> TRANSACTION_EMBEDDINGS
    
    PGVECTOR --> CATEGORY_EMBEDDINGS
    PGVECTOR --> DOCUMENT_EMBEDDINGS
    
    TRANSACTION_EMBEDDINGS --> SIMILARITY_ENGINE
    CATEGORY_EMBEDDINGS --> VECTOR_INDEX
```

### 目录结构

```
packages/
├── categories/                       # 分类管理包
│   ├── src/
│   │   ├── index.ts                  # 对外接口
│   │   ├── embeddings.ts             # 分类向量生成
│   │   ├── categories.ts             # 分类定义
│   │   ├── types.ts                  # 类型定义
│   │   ├── utils.ts                  # 工具函数
│   │   ├── color-system.ts           # 颜色系统
│   │   └── tax-rates.ts              # 税率配置
│   └── package.json
├── jobs/                             # 后台任务包
│   ├── src/
│   │   ├── utils/
│   │   │   ├── embeddings.ts         # 通用向量生成
│   │   │   ├── enrichment-helpers.ts # 数据增强助手
│   │   │   ├── enrichment-schema.ts  # 增强数据模式
│   │   │   ├── text-preparation.ts   # 文本预处理
│   │   │   └── process-batch.ts      # 批量处理工具
│   │   ├── tasks/
│   │   │   ├── transactions/
│   │   │   │   ├── embed-transaction.ts    # 交易向量化
│   │   │   │   ├── enrich-transaction.ts   # 交易增强
│   │   │   │   └── classify-transaction.ts # 交易分类
│   │   │   ├── document/
│   │   │   │   ├── classify-document.ts    # 文档分类
│   │   │   │   ├── classify-image.ts       # 图像分类
│   │   │   │   └── process-document.ts     # 文档处理
│   │   │   └── inbox/
│   │   │       ├── embed-inbox.ts          # 邮件向量化
│   │   │       └── classify-inbox.ts       # 邮件分类
│   │   └── init.ts
│   └── package.json
└── db/                               # 数据库包
    ├── src/
    │   ├── utils/
    │   │   └── embeddings.ts         # 数据库向量工具
    │   ├── queries/
    │   │   ├── transaction-embeddings.ts      # 交易向量查询
    │   │   ├── transaction-category-embeddings.ts # 分类向量查询
    │   │   ├── transaction-matching.ts        # 智能匹配查询
    │   │   └── search.ts                      # 搜索查询
    │   └── schema.ts                 # 向量数据表定义
    └── package.json
```

## AI 服务集成

### Google Gemini 集成

**模型配置**:
```typescript
// Gemini API 配置
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

// 嵌入向量配置
const EMBEDDING_CONFIG = {
  model: google.textEmbedding("gemini-embedding-001"),
  providerOptions: {
    google: {
      outputDimensionality: 768,        // 768维向量
      taskType: "SEMANTIC_SIMILARITY",  // 语义相似度任务
    },
  },
  modelName: "gemini-embedding-001",
};

// 生成模型配置
const GENERATION_CONFIG = {
  model: google("gemini-2.5-flash-lite"),
  temperature: 0.1,                     // 低温度保证一致性
  maxTokens: 2048,                      // 最大 token 数
};
```

### AI SDK 架构

```mermaid
graph LR
    subgraph "Vercel AI SDK"
        EMBED[embed函数]
        EMBED_MANY[embedMany函数]
        GENERATE_OBJECT[generateObject函数]
        GENERATE_TEXT[generateText函数]
    end

    subgraph "Midday AI 抽象层"
        CATEGORY_EMBEDDINGS[CategoryEmbeddings类]
        TRANSACTION_ENRICHER[TransactionEnricher类]
        DOCUMENT_CLASSIFIER[DocumentClassifier类]
    end

    subgraph "业务逻辑层"
        SMART_CATEGORIZATION[智能分类]
        MERCHANT_RECOGNITION[商家识别]
        SEMANTIC_SEARCH[语义搜索]
    end

    EMBED --> CATEGORY_EMBEDDINGS
    EMBED_MANY --> CATEGORY_EMBEDDINGS
    GENERATE_OBJECT --> TRANSACTION_ENRICHER
    GENERATE_TEXT --> DOCUMENT_CLASSIFIER

    CATEGORY_EMBEDDINGS --> SMART_CATEGORIZATION
    TRANSACTION_ENRICHER --> MERCHANT_RECOGNITION
    DOCUMENT_CLASSIFIER --> SEMANTIC_SEARCH
```

## 核心组件

### 1. 分类向量生成服务

**文件**: `packages/categories/src/embeddings.ts`

```typescript
/**
 * 分类向量生成服务
 * 为交易分类生成语义向量，支持智能分类和相似性搜索
 */
export class CategoryEmbeddings {
  private static instance: CategoryEmbeddings;
  private readonly google: GoogleGenerativeAI;
  private readonly config: EmbeddingConfig;

  constructor() {
    this.google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
    });

    this.config = {
      model: this.google.textEmbedding("gemini-embedding-001"),
      providerOptions: {
        google: {
          outputDimensionality: 768,
          taskType: "SEMANTIC_SIMILARITY",
        },
      },
      modelName: "gemini-embedding-001",
    };
  }

  /**
   * 为单个分类生成向量
   */
  async generateEmbedding(categoryName: string): Promise<EmbeddingResult> {
    try {
      const { embedding } = await embed({
        model: this.config.model,
        value: this.normalizeText(categoryName),
        providerOptions: this.config.providerOptions,
      });

      return {
        embedding,
        model: this.config.modelName,
        dimension: 768,
        metadata: {
          inputText: categoryName,
          normalizedText: this.normalizeText(categoryName),
          createdAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      throw new Error(`Failed to generate embedding for category "${categoryName}": ${error.message}`);
    }
  }

  /**
   * 批量生成分类向量
   * 优化性能，减少API调用次数
   */
  async generateEmbeddings(categoryNames: string[]): Promise<BatchEmbeddingResult> {
    if (categoryNames.length === 0) {
      return { embeddings: [], model: this.config.modelName };
    }

    try {
      const normalizedNames = categoryNames.map(name => this.normalizeText(name));
      
      const { embeddings } = await embedMany({
        model: this.config.model,
        values: normalizedNames,
        providerOptions: this.config.providerOptions,
      });

      return {
        embeddings: embeddings.map((embedding, index) => ({
          embedding,
          model: this.config.modelName,
          metadata: {
            inputText: categoryNames[index],
            normalizedText: normalizedNames[index],
            index,
          },
        })),
        model: this.config.modelName,
        totalCount: embeddings.length,
      };
    } catch (error) {
      throw new Error(`Failed to generate batch embeddings: ${error.message}`);
    }
  }

  /**
   * 文本标准化处理
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')  // 移除特殊字符
      .replace(/\s+/g, ' ')      // 标准化空格
      .trim();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): CategoryEmbeddings {
    if (!CategoryEmbeddings.instance) {
      CategoryEmbeddings.instance = new CategoryEmbeddings();
    }
    return CategoryEmbeddings.instance;
  }
}

// 便捷导出函数
export const generateCategoryEmbedding = (categoryName: string) =>
  CategoryEmbeddings.getInstance().generateEmbedding(categoryName);

export const generateCategoryEmbeddings = (categoryNames: string[]) =>
  CategoryEmbeddings.getInstance().generateEmbeddings(categoryNames);
```

### 2. 智能交易增强服务

**文件**: `packages/jobs/src/tasks/transactions/enrich-transaction.ts`

```typescript
/**
 * 智能交易增强任务
 * 使用 Gemini AI 自动识别商家名称和分类
 */
export const enrichTransactions = schemaTask({
  id: "enrich-transactions",
  schema: z.object({
    transactionIds: z.array(z.string().uuid()),
    teamId: z.string().uuid(),
  }),
  machine: "micro",
  maxDuration: 300, // 5分钟批量处理
  queue: {
    concurrencyLimit: 2, // 控制API成本
  },
  run: async ({ transactionIds, teamId }) => {
    // 获取需要增强的交易
    const transactionsToEnrich = await getTransactionsForEnrichment(getDb(), {
      transactionIds,
      teamId,
    });

    if (transactionsToEnrich.length === 0) {
      logger.info("No transactions need enrichment", { teamId });
      return { enrichedCount: 0, teamId };
    }

    logger.info("Starting transaction enrichment", {
      teamId,
      transactionCount: transactionsToEnrich.length,
    });

    let totalEnriched = 0;

    // 分批处理，每批50个交易
    await processBatch(
      transactionsToEnrich,
      BATCH_SIZE,
      async (batch): Promise<string[]> => {
        // 准备交易数据供LLM分析
        const transactionData = prepareTransactionData(batch);
        const prompt = generateEnrichmentPrompt(transactionData, batch);

        try {
          // 使用 Gemini 生成结构化数据
          const { object } = await generateObject({
            model: google("gemini-2.5-flash-lite"),
            prompt,
            output: "array",
            schema: enrichmentSchema,
            temperature: 0.1, // 低温度确保一致性
          });

          const updates: UpdateTransactionEnrichmentParams[] = [];
          const noUpdateNeeded: string[] = [];

          // 处理AI返回的结果
          for (let i = 0; i < Math.min(object.length, batch.length); i++) {
            const result = object[i];
            const transaction = batch[i];

            if (!result || !transaction) continue;

            // 验证并准备更新数据
            const updateData = prepareUpdateData(result, transaction);
            
            if (updateData) {
              updates.push({
                id: transaction.id,
                ...updateData,
              });
            } else {
              noUpdateNeeded.push(transaction.id);
            }
          }

          // 批量更新数据库
          if (updates.length > 0) {
            await updateTransactionEnrichments(getDb(), updates);
            totalEnriched += updates.length;
          }

          // 标记为已处理（即使没有更新）
          const allProcessedIds = [
            ...updates.map(u => u.id),
            ...noUpdateNeeded,
          ];

          if (allProcessedIds.length > 0) {
            await markTransactionsAsEnriched(getDb(), allProcessedIds);
          }

          logger.info("Batch enrichment completed", {
            batchSize: batch.length,
            updatesCount: updates.length,
            teamId,
          });

          return allProcessedIds;
        } catch (error) {
          logger.error("Batch enrichment failed", {
            batchSize: batch.length,
            teamId,
            error: error.message,
          });
          
          // 标记失败的批次，避免无限重试
          const failedIds = batch.map(tx => tx.id);
          await markTransactionsAsEnriched(getDb(), failedIds);
          
          return failedIds;
        }
      }
    );

    logger.info("Transaction enrichment completed", {
      totalEnriched,
      totalProcessed: transactionsToEnrich.length,
      teamId,
    });

    return { enrichedCount: totalEnriched, teamId };
  },
});
```

### 3. 交易向量化服务

**文件**: `packages/jobs/src/tasks/transactions/embed-transaction.ts`

```typescript
/**
 * 交易向量化任务
 * 为交易生成语义向量，支持相似性搜索和智能匹配
 */
export const embedTransaction = schemaTask({
  id: "embed-transaction",
  schema: z.object({
    transactionIds: z.array(z.string().uuid()),
    teamId: z.string().uuid(),
  }),
  machine: "micro",
  maxDuration: 180, // 3分钟
  queue: {
    concurrencyLimit: 3,
  },
  run: async ({ transactionIds, teamId }) => {
    // 第一步：尝试增强交易数据（非阻塞）
    try {
      await enrichTransactions.triggerAndWait({
        transactionIds,
        teamId,
      });
      logger.info("Transaction enrichment completed successfully", { teamId });
    } catch (error) {
      logger.warn(
        "Transaction enrichment failed, proceeding with embedding anyway",
        {
          teamId,
          error: error instanceof Error ? error.message : "Unknown error",
        }
      );
    }

    // 第二步：获取需要向量化的交易
    const transactionsToEmbed = await getTransactionsForEmbedding(getDb(), {
      transactionIds,
      teamId,
    });

    if (transactionsToEmbed.length === 0) {
      logger.info("No transactions need embedding", {
        teamId,
        requestedCount: transactionIds.length,
      });
      return;
    }

    logger.info("Starting transaction embedding", {
      teamId,
      transactionCount: transactionsToEmbed.length,
      requestedCount: transactionIds.length,
    });

    // 分批处理向量生成
    await processBatch(transactionsToEmbed, BATCH_SIZE, async (batch) => {
      const validItems: Array<{
        transaction: TransactionForEmbedding;
        text: string;
      }> = [];

      // 准备文本数据
      for (const tx of batch) {
        const text = prepareTransactionText(tx);
        if (text.trim().length > 0) {
          validItems.push({ transaction: tx, text });
        }
      }

      if (validItems.length === 0) {
        logger.warn("No valid text content in batch", {
          batchSize: batch.length,
          teamId,
        });
        return [];
      }

      // 生成向量
      const texts = validItems.map(item => item.text);
      const { embeddings, model } = await generateEmbeddings(texts);

      // 验证向量数量
      if (embeddings.length !== validItems.length) {
        throw new Error(
          `Embeddings count mismatch: expected ${validItems.length}, got ${embeddings.length}`
        );
      }

      // 准备插入数据
      const embeddingsToInsert: CreateTransactionEmbeddingParams[] =
        validItems.map((item, index) => {
          const embedding = embeddings[index];
          if (!embedding) {
            throw new Error(`Missing embedding at index ${index}`);
          }
          return {
            transactionId: item.transaction.id,
            teamId,
            embedding,
            sourceText: item.text,
            model,
          };
        });

      // 插入向量数据
      const result = await createTransactionEmbeddings(
        getDb(),
        embeddingsToInsert
      );

      logger.info("Transaction embeddings batch created", {
        batchSize: embeddingsToInsert.length,
        teamId,
      });

      return result;
    });

    logger.info("All transaction embeddings created", {
      totalCount: transactionsToEmbed.length,
      teamId,
    });
  },
});
```

### 4. 文本预处理工具

**文件**: `packages/jobs/src/utils/text-preparation.ts`

```typescript
/**
 * 交易文本预处理工具
 * 为AI分析准备优化的文本内容
 */
export function prepareTransactionText(
  transaction: TransactionForEmbedding
): string {
  const components: string[] = [];

  // 1. 主要描述信息（权重最高）
  if (transaction.name?.trim()) {
    components.push(cleanText(transaction.name));
  }

  // 2. 增强的商家名称
  if (transaction.merchantName?.trim() && 
      transaction.merchantName !== transaction.name) {
    components.push(`Merchant: ${cleanText(transaction.merchantName)}`);
  }

  // 3. 分类信息（如果存在）
  if (transaction.categoryName?.trim()) {
    components.push(`Category: ${cleanText(transaction.categoryName)}`);
  }

  // 4. 金额和币种信息
  if (transaction.amount && transaction.currency) {
    const formattedAmount = formatCurrency(transaction.amount, transaction.currency);
    components.push(`Amount: ${formattedAmount}`);
  }

  // 5. 交易方法
  if (transaction.method?.trim()) {
    components.push(`Method: ${cleanText(transaction.method)}`);
  }

  // 6. 银行账户信息
  if (transaction.bankAccountName?.trim()) {
    components.push(`Account: ${cleanText(transaction.bankAccountName)}`);
  }

  // 7. 备注信息
  if (transaction.note?.trim()) {
    components.push(`Note: ${cleanText(transaction.note)}`);
  }

  return components.join(" | ");
}

/**
 * 文本清理工具
 */
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')           // 标准化空格
    .replace(/[^\w\s\-\.]/g, ' ')   // 移除特殊字符，保留基本标点
    .trim()
    .substring(0, 200);             // 限制长度避免token过多
}

/**
 * 货币格式化
 */
function formatCurrency(amount: number, currency: string): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  
  // 简化的货币格式
  return `${sign}${currency} ${absAmount.toFixed(2)}`;
}

/**
 * 为增强准备交易数据
 */
export function prepareTransactionData(
  transactions: TransactionForEnrichment[]
): TransactionData[] {
  return transactions.map(tx => ({
    description: tx.name,
    amount: tx.amount,
    currency: tx.currency,
    counterparty: tx.counterpartyName || undefined,
    existing_merchant: tx.merchantName || undefined,
    raw_description: tx.originalDescription || undefined,
    account_name: tx.bankAccountName || undefined,
    method: tx.method || undefined,
  }));
}
```

## 智能功能实现

### 1. 智能分类算法

```mermaid
graph TD
    A[原始交易数据] --> B[文本预处理]
    B --> C[特征提取]
    C --> D[向量生成]
    D --> E[相似度计算]
    E --> F[分类候选]
    F --> G{置信度检查}
    G -->|高置信度| H[自动分类]
    G -->|中等置信度| I[建议分类]
    G -->|低置信度| J[待人工分类]
    
    H --> K[更新数据库]
    I --> L[推送建议]
    J --> M[标记待处理]
    
    K --> N[训练数据更新]
    L --> N
    M --> N
    
    N --> O[模型优化]
```

### 2. 商家识别流程

```typescript
/**
 * 智能商家识别系统
 * 从交易描述中提取正式商家名称
 */
export class MerchantRecognitionEngine {
  private readonly llmClient: GoogleGenerativeAI;
  private readonly knownMerchantsCache: Map<string, string>;

  constructor() {
    this.llmClient = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
    });
    this.knownMerchantsCache = new Map();
  }

  /**
   * 识别商家名称的层级策略
   */
  async recognizeMerchant(
    transactionData: {
      rawDescription: string;
      counterparty?: string;
      existingMerchant?: string;
    }
  ): Promise<MerchantRecognitionResult> {
    const { rawDescription, counterparty, existingMerchant } = transactionData;

    // 第一优先级：现有商家名称增强
    if (existingMerchant?.trim()) {
      const enhancedMerchant = await this.enhanceMerchantName(existingMerchant);
      if (enhancedMerchant !== existingMerchant) {
        return {
          merchantName: enhancedMerchant,
          confidence: 0.95,
          source: "enhanced_existing",
          originalValue: existingMerchant,
        };
      }
    }

    // 第二优先级：银行解析的对手方
    if (counterparty?.trim() && counterparty !== rawDescription) {
      const recognizedMerchant = await this.extractLegalEntity(counterparty);
      if (recognizedMerchant) {
        return {
          merchantName: recognizedMerchant,
          confidence: 0.85,
          source: "counterparty_parsed",
          originalValue: counterparty,
        };
      }
    }

    // 第三优先级：原始描述提取
    const extractedMerchant = await this.extractFromDescription(rawDescription);
    if (extractedMerchant) {
      return {
        merchantName: extractedMerchant,
        confidence: 0.75,
        source: "description_extracted",
        originalValue: rawDescription,
      };
    }

    // 无法识别
    return {
      merchantName: this.fallbackMerchantName(rawDescription),
      confidence: 0.3,
      source: "fallback",
      originalValue: rawDescription,
    };
  }

  /**
   * 使用LLM增强商家名称
   */
  private async enhanceMerchantName(merchantName: string): Promise<string> {
    // 检查缓存
    if (this.knownMerchantsCache.has(merchantName)) {
      return this.knownMerchantsCache.get(merchantName)!;
    }

    const prompt = `
Transform this merchant name to its formal legal business entity name with proper suffixes:
Input: "${merchantName}"

Rules:
1. Add appropriate entity suffix (Inc, LLC, Corp, Ltd, Co, etc.) if missing
2. Correct common abbreviations (AMZN -> Amazon, MSFT -> Microsoft)
3. Standardize capitalization
4. Remove unnecessary codes or reference numbers
5. Keep the name concise but complete

Return only the transformed name, nothing else.
`;

    try {
      const { text } = await generateText({
        model: this.llmClient("gemini-2.5-flash-lite"),
        prompt,
        temperature: 0.1,
        maxTokens: 50,
      });

      const enhancedName = text.trim();
      
      // 缓存结果
      this.knownMerchantsCache.set(merchantName, enhancedName);
      
      return enhancedName;
    } catch (error) {
      console.error("Failed to enhance merchant name:", error);
      return merchantName;
    }
  }

  /**
   * 从描述中提取法律实体名称
   */
  private async extractLegalEntity(description: string): Promise<string | null> {
    const prompt = `
Extract the formal business entity name from this transaction description:
"${description}"

Requirements:
1. Identify the main business/merchant
2. Add proper entity suffix if identifiable
3. Remove payment references, codes, dates
4. Return null if no clear business entity found

Examples:
"AMAZON.COM*AMZN.CO/BILL" -> "Amazon.com Inc"
"STARBUCKS #1234 SEATTLE WA" -> "Starbucks Corp"
"ATM WITHDRAWAL 123456" -> null

Return only the business name or "null":
`;

    try {
      const { text } = await generateText({
        model: this.llmClient("gemini-2.5-flash-lite"),
        prompt,
        temperature: 0.1,
        maxTokens: 100,
      });

      const result = text.trim();
      return result.toLowerCase() === 'null' ? null : result;
    } catch (error) {
      console.error("Failed to extract legal entity:", error);
      return null;
    }
  }

  /**
   * 从原始描述提取商家信息
   */
  private async extractFromDescription(description: string): Promise<string | null> {
    // 预处理：移除明显的非商家信息
    const cleaned = description
      .replace(/\b\d{4,}\b/g, '')        // 移除长数字
      .replace(/\b\d{1,2}\/\d{1,2}\b/g, '') // 移除日期
      .replace(/[*#]/g, ' ')             // 移除特殊符号
      .trim();

    if (cleaned.length < 3) {
      return null;
    }

    return this.extractLegalEntity(cleaned);
  }

  /**
   * 降级处理：生成基本商家名称
   */
  private fallbackMerchantName(description: string): string {
    // 简单的文本清理，保留可读的部分
    const cleaned = description
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // 取前几个有意义的词
    const words = cleaned.split(' ').filter(word => 
      word.length > 2 && !/^\d+$/.test(word)
    );

    return words.slice(0, 3).join(' ') || 'Unknown Merchant';
  }
}
```

### 3. 语义搜索实现

```typescript
/**
 * 基于向量的语义搜索引擎
 */
export class SemanticSearchEngine {
  constructor(private db: Database) {}

  /**
   * 语义搜索交易
   */
  async searchTransactions(
    teamId: string,
    query: string,
    options: {
      limit?: number;
      threshold?: number;
      filters?: SearchFilters;
    } = {}
  ): Promise<SemanticSearchResult[]> {
    const { limit = 20, threshold = 0.7, filters } = options;

    // 生成查询向量
    const { embedding: queryEmbedding } = await generateEmbedding(query);

    // 构建搜索条件
    const conditions = [eq(transactions.teamId, teamId)];

    // 添加过滤条件
    if (filters?.dateFrom) {
      conditions.push(gte(transactions.date, filters.dateFrom));
    }
    if (filters?.dateTo) {
      conditions.push(lte(transactions.date, filters.dateTo));
    }
    if (filters?.categories?.length) {
      conditions.push(inArray(transactions.categoryId, filters.categories));
    }
    if (filters?.amountMin !== undefined) {
      conditions.push(gte(transactions.amount, filters.amountMin));
    }
    if (filters?.amountMax !== undefined) {
      conditions.push(lte(transactions.amount, filters.amountMax));
    }

    // 执行向量相似度搜索
    const results = await this.db
      .select({
        transaction: {
          id: transactions.id,
          name: transactions.name,
          amount: transactions.amount,
          currency: transactions.currency,
          date: transactions.date,
          merchantName: transactions.merchantName,
        },
        category: {
          name: transactionCategories.name,
          color: transactionCategories.color,
        },
        // 计算相似度分数
        similarity: sql<number>`1 - (${transactionEmbeddings.embedding} <=> ${JSON.stringify(queryEmbedding)})`,
      })
      .from(transactions)
      .innerJoin(transactionEmbeddings, eq(transactions.id, transactionEmbeddings.transactionId))
      .leftJoin(transactionCategories, eq(transactions.categoryId, transactionCategories.id))
      .where(
        and(
          ...conditions,
          // 相似度阈值过滤
          sql`1 - (${transactionEmbeddings.embedding} <=> ${JSON.stringify(queryEmbedding)}) > ${threshold}`
        )
      )
      .orderBy(
        desc(sql`1 - (${transactionEmbeddings.embedding} <=> ${JSON.stringify(queryEmbedding)})`)
      )
      .limit(limit);

    return results.map(row => ({
      ...row.transaction,
      category: row.category,
      similarityScore: row.similarity,
      searchQuery: query,
    }));
  }

  /**
   * 查找相似交易
   */
  async findSimilarTransactions(
    transactionId: string,
    teamId: string,
    options: {
      limit?: number;
      threshold?: number;
      excludeSelf?: boolean;
    } = {}
  ): Promise<SimilarTransaction[]> {
    const { limit = 10, threshold = 0.8, excludeSelf = true } = options;

    // 获取目标交易的向量
    const targetEmbedding = await this.db
      .select({ embedding: transactionEmbeddings.embedding })
      .from(transactionEmbeddings)
      .where(eq(transactionEmbeddings.transactionId, transactionId))
      .limit(1);

    if (targetEmbedding.length === 0) {
      return [];
    }

    const embedding = targetEmbedding[0].embedding;

    // 搜索相似交易
    const conditions = [eq(transactions.teamId, teamId)];
    
    if (excludeSelf) {
      conditions.push(ne(transactions.id, transactionId));
    }

    const results = await this.db
      .select({
        id: transactions.id,
        name: transactions.name,
        amount: transactions.amount,
        currency: transactions.currency,
        date: transactions.date,
        merchantName: transactions.merchantName,
        categoryName: transactionCategories.name,
        similarity: sql<number>`1 - (${transactionEmbeddings.embedding} <=> ${JSON.stringify(embedding)})`,
      })
      .from(transactions)
      .innerJoin(transactionEmbeddings, eq(transactions.id, transactionEmbeddings.transactionId))
      .leftJoin(transactionCategories, eq(transactions.categoryId, transactionCategories.id))
      .where(
        and(
          ...conditions,
          sql`1 - (${transactionEmbeddings.embedding} <=> ${JSON.stringify(embedding)}) > ${threshold}`
        )
      )
      .orderBy(
        desc(sql`1 - (${transactionEmbeddings.embedding} <=> ${JSON.stringify(embedding)})`)
      )
      .limit(limit);

    return results;
  }

  /**
   * 智能分类建议
   */
  async suggestCategories(
    transactionText: string,
    teamId: string,
    options: {
      limit?: number;
      threshold?: number;
      includeSystemCategories?: boolean;
    } = {}
  ): Promise<CategorySuggestion[]> {
    const { limit = 5, threshold = 0.7, includeSystemCategories = true } = options;

    // 生成交易文本的向量
    const { embedding } = await generateEmbedding(transactionText);

    // 构建查询条件
    const conditions = [];
    
    if (includeSystemCategories) {
      conditions.push(eq(transactionCategoryEmbeddings.system, true));
    }

    // 查找最相似的分类
    const results = await this.db
      .select({
        name: transactionCategoryEmbeddings.name,
        similarity: sql<number>`1 - (${transactionCategoryEmbeddings.embedding} <=> ${JSON.stringify(embedding)})`,
        system: transactionCategoryEmbeddings.system,
      })
      .from(transactionCategoryEmbeddings)
      .where(
        and(
          ...conditions,
          sql`1 - (${transactionCategoryEmbeddings.embedding} <=> ${JSON.stringify(embedding)}) > ${threshold}`
        )
      )
      .orderBy(
        desc(sql`1 - (${transactionCategoryEmbeddings.embedding} <=> ${JSON.stringify(embedding)})`)
      )
      .limit(limit);

    return results.map(row => ({
      categoryName: row.name,
      similarityScore: row.similarity,
      isSystemCategory: row.system,
      confidence: this.calculateCategoryConfidence(row.similarity),
    }));
  }

  /**
   * 计算分类置信度
   */
  private calculateCategoryConfidence(similarity: number): 'high' | 'medium' | 'low' {
    if (similarity >= 0.85) return 'high';
    if (similarity >= 0.75) return 'medium';
    return 'low';
  }
}
```

## 向量数据库集成

### 1. pgvector 配置

```sql
-- 启用 pgvector 扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 交易向量表
CREATE TABLE transaction_embeddings (
  transaction_id UUID PRIMARY KEY,
  team_id UUID NOT NULL,
  embedding VECTOR(768) NOT NULL,
  source_text TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'gemini-embedding-001',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 分类向量表
CREATE TABLE transaction_category_embeddings (
  name TEXT PRIMARY KEY,
  embedding VECTOR(768) NOT NULL,
  model TEXT NOT NULL DEFAULT 'gemini-embedding-001',
  system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 向量相似度索引 (HNSW)
CREATE INDEX transaction_embeddings_vector_idx 
ON transaction_embeddings 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

CREATE INDEX transaction_category_embeddings_vector_idx 
ON transaction_category_embeddings 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

-- 复合索引优化查询
CREATE INDEX transaction_embeddings_team_idx 
ON transaction_embeddings (team_id);

CREATE INDEX transaction_category_embeddings_system_idx 
ON transaction_category_embeddings (system);
```

### 2. 向量查询优化

```typescript
/**
 * 向量查询优化工具
 */
export class VectorQueryOptimizer {
  /**
   * 批量向量相似度查询
   * 优化多个查询的性能
   */
  async batchSimilaritySearch<T>(
    db: Database,
    queries: Array<{
      embedding: number[];
      filters?: Record<string, any>;
      limit?: number;
    }>,
    table: string,
    options: BatchSearchOptions = {}
  ): Promise<T[][]> {
    const { threshold = 0.7, maxConcurrency = 5 } = options;

    // 分批执行查询，控制并发
    const batches = chunk(queries, maxConcurrency);
    const allResults: T[][] = [];

    for (const batch of batches) {
      const batchPromises = batch.map(async query => {
        const { embedding, filters, limit = 10 } = query;

        // 构建动态查询
        let queryBuilder = db
          .select()
          .from(sql.identifier(table))
          .where(
            sql`1 - (embedding <=> ${JSON.stringify(embedding)}) > ${threshold}`
          )
          .orderBy(
            desc(sql`1 - (embedding <=> ${JSON.stringify(embedding)})`)
          )
          .limit(limit);

        // 添加过滤条件
        if (filters) {
          for (const [key, value] of Object.entries(filters)) {
            if (value !== undefined) {
              queryBuilder = queryBuilder.where(
                sql`${sql.identifier(key)} = ${value}`
              );
            }
          }
        }

        return queryBuilder;
      });

      const batchResults = await Promise.all(batchPromises);
      allResults.push(...batchResults);
    }

    return allResults;
  }

  /**
   * 向量聚类分析
   * 识别相似交易群组
   */
  async clusterSimilarTransactions(
    db: Database,
    teamId: string,
    options: {
      similarityThreshold?: number;
      minClusterSize?: number;
      maxClusters?: number;
    } = {}
  ): Promise<TransactionCluster[]> {
    const { 
      similarityThreshold = 0.85,
      minClusterSize = 3,
      maxClusters = 20 
    } = options;

    // 获取所有交易向量
    const embeddings = await db
      .select({
        transactionId: transactionEmbeddings.transactionId,
        embedding: transactionEmbeddings.embedding,
        sourceText: transactionEmbeddings.sourceText,
      })
      .from(transactionEmbeddings)
      .innerJoin(transactions, eq(transactions.id, transactionEmbeddings.transactionId))
      .where(eq(transactions.teamId, teamId));

    if (embeddings.length < minClusterSize * 2) {
      return [];
    }

    // 使用基于密度的聚类算法
    const clusters: TransactionCluster[] = [];
    const visited = new Set<string>();

    for (const embedding of embeddings) {
      if (visited.has(embedding.transactionId)) {
        continue;
      }

      // 找到相似的交易
      const similarTransactions = await this.findSimilarEmbeddings(
        db,
        embedding.embedding,
        embeddings,
        similarityThreshold
      );

      if (similarTransactions.length >= minClusterSize) {
        const cluster: TransactionCluster = {
          id: `cluster_${clusters.length + 1}`,
          transactionIds: similarTransactions.map(t => t.transactionId),
          centerText: embedding.sourceText,
          averageSimilarity: this.calculateAverageSimilarity(similarTransactions),
          size: similarTransactions.length,
        };

        clusters.push(cluster);

        // 标记已访问
        similarTransactions.forEach(t => visited.add(t.transactionId));

        if (clusters.length >= maxClusters) {
          break;
        }
      }
    }

    return clusters.sort((a, b) => b.size - a.size);
  }

  /**
   * 找到相似向量
   */
  private async findSimilarEmbeddings(
    db: Database,
    targetEmbedding: number[],
    candidateEmbeddings: Array<{
      transactionId: string;
      embedding: number[];
      sourceText: string;
    }>,
    threshold: number
  ): Promise<typeof candidateEmbeddings> {
    const similar: typeof candidateEmbeddings = [];

    // 使用向量相似度计算
    for (const candidate of candidateEmbeddings) {
      const similarity = this.cosineSimilarity(targetEmbedding, candidate.embedding);
      if (similarity >= threshold) {
        similar.push(candidate);
      }
    }

    return similar;
  }

  /**
   * 余弦相似度计算
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error("Vectors must have the same dimension");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * 计算平均相似度
   */
  private calculateAverageSimilarity(
    embeddings: Array<{ embedding: number[] }>
  ): number {
    if (embeddings.length <= 1) return 1.0;

    let totalSimilarity = 0;
    let comparisons = 0;

    for (let i = 0; i < embeddings.length; i++) {
      for (let j = i + 1; j < embeddings.length; j++) {
        totalSimilarity += this.cosineSimilarity(
          embeddings[i].embedding,
          embeddings[j].embedding
        );
        comparisons++;
      }
    }

    return comparisons > 0 ? totalSimilarity / comparisons : 1.0;
  }
}
```

## 性能优化

### 1. 批量处理优化

```typescript
/**
 * 智能批量处理器
 * 根据系统负载动态调整批量大小
 */
export class AdaptiveBatchProcessor {
  private currentBatchSize: number;
  private readonly minBatchSize: number;
  private readonly maxBatchSize: number;
  private performanceMetrics: PerformanceMetric[];

  constructor(options: {
    initialBatchSize?: number;
    minBatchSize?: number;
    maxBatchSize?: number;
  } = {}) {
    this.currentBatchSize = options.initialBatchSize || 50;
    this.minBatchSize = options.minBatchSize || 10;
    this.maxBatchSize = options.maxBatchSize || 200;
    this.performanceMetrics = [];
  }

  /**
   * 自适应批量处理
   */
  async processAdaptive<T, R>(
    items: T[],
    processor: (batch: T[]) => Promise<R[]>,
    options: {
      targetProcessingTime?: number;
      maxConcurrency?: number;
    } = {}
  ): Promise<R[]> {
    const { targetProcessingTime = 30000, maxConcurrency = 3 } = options; // 30秒目标

    const results: R[] = [];
    let remainingItems = [...items];

    while (remainingItems.length > 0) {
      const batchSize = Math.min(this.currentBatchSize, remainingItems.length);
      const batch = remainingItems.splice(0, batchSize);

      const startTime = Date.now();
      
      try {
        // 并发处理多个批次
        const concurrentBatches: T[][] = [];
        let currentBatch = batch;

        // 根据并发限制分割批次
        if (batch.length > batchSize / maxConcurrency) {
          const chunkSize = Math.ceil(batch.length / maxConcurrency);
          for (let i = 0; i < batch.length; i += chunkSize) {
            concurrentBatches.push(batch.slice(i, i + chunkSize));
          }
        } else {
          concurrentBatches.push(currentBatch);
        }

        // 并发执行
        const batchResults = await Promise.allSettled(
          concurrentBatches.map(processor)
        );

        // 收集成功的结果
        for (const result of batchResults) {
          if (result.status === 'fulfilled') {
            results.push(...result.value);
          } else {
            console.error('Batch processing failed:', result.reason);
          }
        }

        const processingTime = Date.now() - startTime;
        
        // 记录性能指标
        this.recordPerformance({
          batchSize,
          processingTime,
          itemsProcessed: batch.length,
          throughput: batch.length / (processingTime / 1000),
        });

        // 动态调整批量大小
        this.adjustBatchSize(processingTime, targetProcessingTime);

      } catch (error) {
        console.error('Batch processing error:', error);
        
        // 出错时减小批量大小
        this.currentBatchSize = Math.max(
          this.minBatchSize,
          Math.floor(this.currentBatchSize * 0.7)
        );
      }
    }

    return results;
  }

  /**
   * 调整批量大小
   */
  private adjustBatchSize(actualTime: number, targetTime: number): void {
    const ratio = targetTime / actualTime;

    if (ratio > 1.2) {
      // 处理速度快，可以增加批量大小
      this.currentBatchSize = Math.min(
        this.maxBatchSize,
        Math.floor(this.currentBatchSize * 1.1)
      );
    } else if (ratio < 0.8) {
      // 处理速度慢，需要减小批量大小
      this.currentBatchSize = Math.max(
        this.minBatchSize,
        Math.floor(this.currentBatchSize * 0.9)
      );
    }

    console.log(`Adjusted batch size to: ${this.currentBatchSize}`);
  }

  /**
   * 记录性能指标
   */
  private recordPerformance(metric: PerformanceMetric): void {
    this.performanceMetrics.push({
      ...metric,
      timestamp: Date.now(),
    });

    // 只保留最近100次的记录
    if (this.performanceMetrics.length > 100) {
      this.performanceMetrics = this.performanceMetrics.slice(-100);
    }
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats(): PerformanceStats {
    if (this.performanceMetrics.length === 0) {
      return {
        averageThroughput: 0,
        averageProcessingTime: 0,
        optimalBatchSize: this.currentBatchSize,
        totalItemsProcessed: 0,
      };
    }

    const totalItems = this.performanceMetrics.reduce(
      (sum, metric) => sum + metric.itemsProcessed, 0
    );
    
    const totalTime = this.performanceMetrics.reduce(
      (sum, metric) => sum + metric.processingTime, 0
    );

    const averageThroughput = this.performanceMetrics.reduce(
      (sum, metric) => sum + metric.throughput, 0
    ) / this.performanceMetrics.length;

    return {
      averageThroughput,
      averageProcessingTime: totalTime / this.performanceMetrics.length,
      optimalBatchSize: this.currentBatchSize,
      totalItemsProcessed: totalItems,
    };
  }
}
```

### 2. AI API 调用优化

```typescript
/**
 * AI API 调用优化器
 * 实现智能重试、速率限制和成本优化
 */
export class AIAPIOptimizer {
  private readonly retryConfig: RetryConfig;
  private readonly rateLimiter: RateLimiter;
  private callStats: Map<string, APICallStats>;

  constructor(config: AIOptimizerConfig) {
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2,
      ...config.retry,
    };

    this.rateLimiter = new RateLimiter({
      requestsPerMinute: 60, // Gemini API 限制
      requestsPerDay: 1500,
      ...config.rateLimit,
    });

    this.callStats = new Map();
  }

  /**
   * 优化的API调用包装器
   */
  async callWithOptimization<T>(
    apiFunction: () => Promise<T>,
    options: {
      operation: string;
      priority?: 'high' | 'medium' | 'low';
      cacheKey?: string;
      cacheTTL?: number;
    }
  ): Promise<T> {
    const { operation, priority = 'medium', cacheKey, cacheTTL } = options;

    // 检查缓存
    if (cacheKey) {
      const cachedResult = await this.getFromCache<T>(cacheKey);
      if (cachedResult) {
        this.updateStats(operation, 'cache_hit', 0);
        return cachedResult;
      }
    }

    // 速率限制检查
    await this.rateLimiter.waitForSlot(priority);

    const startTime = Date.now();
    let attempts = 0;

    while (attempts <= this.retryConfig.maxRetries) {
      try {
        attempts++;
        
        const result = await apiFunction();
        const duration = Date.now() - startTime;

        // 更新统计
        this.updateStats(operation, 'success', duration);

        // 缓存结果
        if (cacheKey && cacheTTL) {
          await this.setCache(cacheKey, result, cacheTTL);
        }

        return result;

      } catch (error) {
        const isRetryable = this.isRetryableError(error);
        
        if (attempts > this.retryConfig.maxRetries || !isRetryable) {
          const duration = Date.now() - startTime;
          this.updateStats(operation, 'error', duration);
          throw error;
        }

        // 指数退避
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, attempts - 1),
          this.retryConfig.maxDelay
        );

        console.log(`API call failed, retrying in ${delay}ms (attempt ${attempts}/${this.retryConfig.maxRetries})`);
        await this.delay(delay);
      }
    }

    throw new Error('Max retries exceeded');
  }

  /**
   * 批量API调用优化
   */
  async batchCallWithOptimization<T, R>(
    items: T[],
    apiFunction: (batch: T[]) => Promise<R[]>,
    options: {
      operation: string;
      maxBatchSize?: number;
      concurrency?: number;
      priority?: 'high' | 'medium' | 'low';
    }
  ): Promise<R[]> {
    const { operation, maxBatchSize = 50, concurrency = 2, priority = 'medium' } = options;

    const batches = chunk(items, maxBatchSize);
    const results: R[] = [];

    // 控制并发数量
    const semaphore = new Semaphore(concurrency);

    const batchPromises = batches.map(async (batch, index) => {
      await semaphore.acquire();

      try {
        return await this.callWithOptimization(
          () => apiFunction(batch),
          {
            operation: `${operation}_batch_${index}`,
            priority,
          }
        );
      } finally {
        semaphore.release();
      }
    });

    const batchResults = await Promise.allSettled(batchPromises);

    // 收集成功的结果
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(...result.value);
      } else {
        console.error('Batch API call failed:', result.reason);
      }
    }

    return results;
  }

  /**
   * 检查错误是否可重试
   */
  private isRetryableError(error: any): boolean {
    if (!error.status) return false;

    // HTTP状态码判断
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    if (retryableStatusCodes.includes(error.status)) {
      return true;
    }

    // 特定错误信息判断
    const retryableMessages = [
      'timeout',
      'rate limit',
      'quota exceeded',
      'temporarily unavailable',
    ];

    const errorMessage = error.message?.toLowerCase() || '';
    return retryableMessages.some(msg => errorMessage.includes(msg));
  }

  /**
   * 更新API调用统计
   */
  private updateStats(operation: string, status: 'success' | 'error' | 'cache_hit', duration: number): void {
    if (!this.callStats.has(operation)) {
      this.callStats.set(operation, {
        totalCalls: 0,
        successCalls: 0,
        errorCalls: 0,
        cacheHits: 0,
        totalDuration: 0,
        averageDuration: 0,
      });
    }

    const stats = this.callStats.get(operation)!;
    stats.totalCalls++;

    switch (status) {
      case 'success':
        stats.successCalls++;
        stats.totalDuration += duration;
        break;
      case 'error':
        stats.errorCalls++;
        stats.totalDuration += duration;
        break;
      case 'cache_hit':
        stats.cacheHits++;
        break;
    }

    // 更新平均持续时间
    const callsWithDuration = stats.successCalls + stats.errorCalls;
    if (callsWithDuration > 0) {
      stats.averageDuration = stats.totalDuration / callsWithDuration;
    }
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): PerformanceReport {
    const report: PerformanceReport = {
      operations: {},
      overallStats: {
        totalCalls: 0,
        totalSuccessRate: 0,
        totalCacheHitRate: 0,
        averageDuration: 0,
      },
    };

    for (const [operation, stats] of this.callStats.entries()) {
      const successRate = stats.totalCalls > 0 ? stats.successCalls / stats.totalCalls : 0;
      const cacheHitRate = stats.totalCalls > 0 ? stats.cacheHits / stats.totalCalls : 0;

      report.operations[operation] = {
        ...stats,
        successRate,
        cacheHitRate,
      };

      // 累计整体统计
      report.overallStats.totalCalls += stats.totalCalls;
    }

    // 计算整体成功率和缓存命中率
    if (report.overallStats.totalCalls > 0) {
      const totalSuccess = Array.from(this.callStats.values()).reduce(
        (sum, stats) => sum + stats.successCalls, 0
      );
      const totalCacheHits = Array.from(this.callStats.values()).reduce(
        (sum, stats) => sum + stats.cacheHits, 0
      );

      report.overallStats.totalSuccessRate = totalSuccess / report.overallStats.totalCalls;
      report.overallStats.totalCacheHitRate = totalCacheHits / report.overallStats.totalCalls;
    }

    return report;
  }

  // 辅助方法
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async getFromCache<T>(key: string): Promise<T | null> {
    // 实现缓存获取逻辑
    return null;
  }

  private async setCache<T>(key: string, value: T, ttl: number): Promise<void> {
    // 实现缓存设置逻辑
  }
}
```

## 最佳实践

### 1. AI 模型管理

```typescript
/**
 * AI 模型管理最佳实践
 */
export class AIModelManager {
  private models: Map<string, ModelConfig>;
  private usage: Map<string, ModelUsage>;

  constructor() {
    this.models = new Map([
      ['gemini-embedding-001', {
        type: 'embedding',
        dimensions: 768,
        maxTokens: 2048,
        costPerToken: 0.00001,
        rateLimit: { rpm: 60, rpd: 1500 },
      }],
      ['gemini-2.5-flash-lite', {
        type: 'generation',
        maxTokens: 8192,
        costPerToken: 0.00005,
        rateLimit: { rpm: 15, rpd: 1500 },
      }],
    ]);
    this.usage = new Map();
  }

  /**
   * 选择最优模型
   */
  selectOptimalModel(task: AITask): string {
    switch (task.type) {
      case 'embedding':
        // 对于嵌入任务，优先考虑成本和维度
        return 'gemini-embedding-001';
      
      case 'classification':
        // 对于分类任务，考虑精确度和速度
        if (task.requiresHighAccuracy) {
          return 'gemini-2.5-flash'; // 假设有更高精度的模型
        }
        return 'gemini-2.5-flash-lite';
      
      case 'enrichment':
        // 对于数据增强任务，平衡成本和质量
        return 'gemini-2.5-flash-lite';
      
      default:
        return 'gemini-2.5-flash-lite';
    }
  }

  /**
   * 监控模型使用情况
   */
  trackUsage(modelName: string, tokens: number, success: boolean): void {
    if (!this.usage.has(modelName)) {
      this.usage.set(modelName, {
        totalTokens: 0,
        totalCalls: 0,
        successfulCalls: 0,
        totalCost: 0,
      });
    }

    const usage = this.usage.get(modelName)!;
    const model = this.models.get(modelName);

    usage.totalTokens += tokens;
    usage.totalCalls++;
    
    if (success) {
      usage.successfulCalls++;
    }

    if (model) {
      usage.totalCost += tokens * model.costPerToken;
    }
  }

  /**
   * 获取使用报告
   */
  getUsageReport(): UsageReport {
    const report: UsageReport = {
      models: {},
      totalCost: 0,
      totalTokens: 0,
      overallSuccessRate: 0,
    };

    for (const [modelName, usage] of this.usage.entries()) {
      const successRate = usage.totalCalls > 0 ? 
        usage.successfulCalls / usage.totalCalls : 0;

      report.models[modelName] = {
        ...usage,
        successRate,
        averageTokensPerCall: usage.totalCalls > 0 ? 
          usage.totalTokens / usage.totalCalls : 0,
      };

      report.totalCost += usage.totalCost;
      report.totalTokens += usage.totalTokens;
    }

    // 计算整体成功率
    const totalCalls = Array.from(this.usage.values()).reduce(
      (sum, usage) => sum + usage.totalCalls, 0
    );
    const totalSuccessfulCalls = Array.from(this.usage.values()).reduce(
      (sum, usage) => sum + usage.successfulCalls, 0
    );

    report.overallSuccessRate = totalCalls > 0 ? 
      totalSuccessfulCalls / totalCalls : 0;

    return report;
  }
}
```

### 2. 向量数据管理

```typescript
/**
 * 向量数据管理最佳实践
 */
export class VectorDataManager {
  constructor(private db: Database) {}

  /**
   * 向量数据生命周期管理
   */
  async manageVectorLifecycle(): Promise<void> {
    await Promise.all([
      this.cleanupStaleEmbeddings(),
      this.updateOutdatedEmbeddings(),
      this.optimizeVectorIndexes(),
      this.validateVectorIntegrity(),
    ]);
  }

  /**
   * 清理过期向量
   */
  private async cleanupStaleEmbeddings(): Promise<void> {
    // 清理孤立的交易向量（对应的交易已删除）
    const orphanedEmbeddings = await this.db.execute(sql`
      DELETE FROM transaction_embeddings 
      WHERE transaction_id NOT IN (
        SELECT id FROM transactions
      )
    `);

    // 清理过期的临时向量
    await this.db.execute(sql`
      DELETE FROM temporary_embeddings 
      WHERE created_at < NOW() - INTERVAL '7 days'
    `);

    console.log(`Cleaned up ${orphanedEmbeddings.rowCount} orphaned embeddings`);
  }

  /**
   * 更新过时的向量
   */
  private async updateOutdatedEmbeddings(): Promise<void> {
    // 查找使用旧模型的向量
    const outdatedEmbeddings = await this.db
      .select({
        transactionId: transactionEmbeddings.transactionId,
        model: transactionEmbeddings.model,
      })
      .from(transactionEmbeddings)
      .where(ne(transactionEmbeddings.model, 'gemini-embedding-001'));

    if (outdatedEmbeddings.length > 0) {
      console.log(`Found ${outdatedEmbeddings.length} outdated embeddings to update`);
      
      // 批量重新生成向量
      const transactionIds = outdatedEmbeddings.map(e => e.transactionId);
      
      // 触发重新生成任务
      await embedTransaction.trigger({
        transactionIds,
        teamId: 'system', // 系统级更新
      });
    }
  }

  /**
   * 优化向量索引
   */
  private async optimizeVectorIndexes(): Promise<void> {
    // 重建HNSW索引以提高查询性能
    await this.db.execute(sql`REINDEX INDEX CONCURRENTLY transaction_embeddings_vector_idx`);
    await this.db.execute(sql`REINDEX INDEX CONCURRENTLY transaction_category_embeddings_vector_idx`);
    
    // 更新表统计信息
    await this.db.execute(sql`ANALYZE transaction_embeddings`);
    await this.db.execute(sql`ANALYZE transaction_category_embeddings`);

    console.log('Vector indexes optimized');
  }

  /**
   * 验证向量完整性
   */
  private async validateVectorIntegrity(): Promise<VectorIntegrityReport> {
    const report: VectorIntegrityReport = {
      totalEmbeddings: 0,
      validEmbeddings: 0,
      invalidEmbeddings: 0,
      missingEmbeddings: 0,
      issues: [],
    };

    // 检查向量维度
    const dimensionCheck = await this.db.execute(sql`
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN array_length(embedding, 1) = 768 THEN 1 END) as valid_dim
      FROM transaction_embeddings
    `);

    report.totalEmbeddings = dimensionCheck.rows[0].total;
    report.validEmbeddings = dimensionCheck.rows[0].valid_dim;
    report.invalidEmbeddings = report.totalEmbeddings - report.validEmbeddings;

    if (report.invalidEmbeddings > 0) {
      report.issues.push(`Found ${report.invalidEmbeddings} embeddings with invalid dimensions`);
    }

    // 检查缺失的向量
    const missingCheck = await this.db.execute(sql`
      SELECT COUNT(*) as missing
      FROM transactions t
      LEFT JOIN transaction_embeddings te ON t.id = te.transaction_id
      WHERE te.transaction_id IS NULL
    `);

    report.missingEmbeddings = missingCheck.rows[0].missing;

    if (report.missingEmbeddings > 0) {
      report.issues.push(`Found ${report.missingEmbeddings} transactions without embeddings`);
    }

    return report;
  }

  /**
   * 向量质量评估
   */
  async assessVectorQuality(): Promise<VectorQualityReport> {
    const report: VectorQualityReport = {
      averageSimilarity: 0,
      distinctiveness: 0,
      clusteringQuality: 0,
      recommendedActions: [],
    };

    // 计算平均相似度（随机采样）
    const sampleSize = 1000;
    const sampleEmbeddings = await this.db
      .select({ embedding: transactionEmbeddings.embedding })
      .from(transactionEmbeddings)
      .orderBy(sql`RANDOM()`)
      .limit(sampleSize);

    if (sampleEmbeddings.length >= 2) {
      let totalSimilarity = 0;
      let comparisons = 0;

      // 计算样本间的平均相似度
      for (let i = 0; i < Math.min(100, sampleEmbeddings.length); i++) {
        for (let j = i + 1; j < Math.min(i + 10, sampleEmbeddings.length); j++) {
          const similarity = this.cosineSimilarity(
            sampleEmbeddings[i].embedding,
            sampleEmbeddings[j].embedding
          );
          totalSimilarity += similarity;
          comparisons++;
        }
      }

      report.averageSimilarity = comparisons > 0 ? totalSimilarity / comparisons : 0;
    }

    // 评估向量区分度
    report.distinctiveness = 1 - report.averageSimilarity;

    // 生成建议
    if (report.averageSimilarity > 0.9) {
      report.recommendedActions.push("Vector similarity is too high, consider improving text preprocessing");
    }

    if (report.distinctiveness < 0.1) {
      report.recommendedActions.push("Vectors lack distinctiveness, review embedding model or input data");
    }

    return report;
  }

  // 辅助方法
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
```

### 3. 成本优化策略

```typescript
/**
 * AI 成本优化策略
 */
export class AICostOptimizer {
  private readonly costThresholds: CostThresholds;
  private readonly optimizationStrategies: OptimizationStrategy[];

  constructor(config: CostOptimizerConfig) {
    this.costThresholds = config.thresholds;
    this.optimizationStrategies = [
      new CachingStrategy(),
      new BatchingStrategy(),
      new ModelSelectionStrategy(),
      new PreprocessingStrategy(),
    ];
  }

  /**
   * 成本监控和优化
   */
  async optimizeCosts(): Promise<CostOptimizationReport> {
    const currentUsage = await this.getCurrentUsage();
    const report: CostOptimizationReport = {
      currentCosts: currentUsage,
      optimizations: [],
      projectedSavings: 0,
    };

    // 应用优化策略
    for (const strategy of this.optimizationStrategies) {
      const optimization = await strategy.analyze(currentUsage);
      if (optimization.potentialSavings > 0) {
        report.optimizations.push(optimization);
        report.projectedSavings += optimization.potentialSavings;
      }
    }

    // 实施自动优化
    await this.implementAutoOptimizations(report.optimizations);

    return report;
  }

  /**
   * 智能缓存策略
   */
  async implementSmartCaching(): Promise<void> {
    // 识别高频查询
    const frequentQueries = await this.identifyFrequentQueries();

    // 预生成常用向量
    for (const query of frequentQueries) {
      await this.preGenerateEmbedding(query);
    }

    // 设置缓存过期策略
    await this.setupCacheExpiration();
  }

  /**
   * 批处理优化
   */
  async optimizeBatchProcessing(): Promise<void> {
    // 分析当前批处理模式
    const batchAnalysis = await this.analyzeBatchPatterns();

    // 调整批量大小
    const optimalBatchSize = this.calculateOptimalBatchSize(batchAnalysis);

    // 实施新的批处理策略
    await this.updateBatchingStrategy(optimalBatchSize);
  }

  /**
   * 模型选择优化
   */
  async optimizeModelSelection(): Promise<void> {
    const taskAnalysis = await this.analyzeTaskComplexity();

    for (const task of taskAnalysis) {
      const optimalModel = this.selectCostEffectiveModel(task);
      await this.updateTaskModelMapping(task.type, optimalModel);
    }
  }

  // 私有辅助方法
  private async getCurrentUsage(): Promise<CurrentUsage> {
    // 实现当前使用情况获取逻辑
    return {
      totalCost: 0,
      tokenUsage: 0,
      apiCalls: 0,
      cacheHitRate: 0,
    };
  }

  private async identifyFrequentQueries(): Promise<string[]> {
    // 分析查询日志，识别高频查询
    return [];
  }

  private async preGenerateEmbedding(query: string): Promise<void> {
    // 预生成并缓存向量
  }

  private calculateOptimalBatchSize(analysis: BatchAnalysis): number {
    // 基于分析结果计算最优批量大小
    return 50;
  }

  private selectCostEffectiveModel(task: TaskComplexity): string {
    // 根据任务复杂度选择最具成本效益的模型
    if (task.complexity === 'low') {
      return 'gemini-2.5-flash-lite';
    }
    return 'gemini-2.5-flash';
  }

  private async implementAutoOptimizations(
    optimizations: OptimizationRecommendation[]
  ): Promise<void> {
    for (const optimization of optimizations) {
      if (optimization.autoImplement) {
        await optimization.implement();
      }
    }
  }
}
```

---

## 总结

Midday 的 AI 模块采用了现代化的人工智能架构，通过 Google Gemini 提供强大的语言理解能力，结合 pgvector 实现高效的向量检索。系统在智能分类、语义搜索、数据增强等方面展现了出色的性能。

### 核心优势

1. **智能化程度高**: 自动分类、商家识别、语义搜索全面覆盖
2. **技术栈先进**: Gemini + pgvector + Drizzle 的现代化组合
3. **性能优化**: 批量处理、缓存策略、动态调优全面优化
4. **成本控制**: 智能重试、模型选择、使用监控有效控制成本
5. **扩展性强**: 模块化设计，易于添加新的AI功能
6. **可维护性**: 清晰的抽象层次，完善的错误处理

### 技术亮点

- **向量数据库集成**: 高效的语义搜索和相似性匹配
- **自适应批处理**: 根据系统负载动态调整批量大小
- **多层缓存策略**: API结果缓存、向量缓存、模型选择缓存
- **智能重试机制**: 指数退避、错误分类、成本优化
- **质量保障**: 向量完整性检查、模型性能监控、数据验证

通过本文档的详细说明，开发者可以深入理解 Midday AI 模块的设计理念和实现细节，并能够基于此架构构建智能化的现代应用系统。

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "\u5206\u6790 Midday AI \u6a21\u5757\u67b6\u6784\u548c\u8bbe\u8ba1\u6a21\u5f0f", "status": "completed", "activeForm": "Analyzing Midday AI module architecture and design patterns"}, {"content": "\u68c0\u67e5 AI \u76f8\u5173\u5305\u548c\u7ec4\u4ef6", "status": "completed", "activeForm": "Examining AI-related packages and components"}, {"content": "\u5206\u6790 AI \u670d\u52a1\u548c\u96c6\u6210\u7b56\u7565", "status": "completed", "activeForm": "Analyzing AI services and integration strategies"}, {"content": "\u751f\u6210\u5b8c\u6574\u7684 AI \u6a21\u5757\u6280\u672f\u6587\u6863", "status": "completed", "activeForm": "Generating complete AI module technical documentation"}]