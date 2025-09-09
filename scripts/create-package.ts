#!/usr/bin/env bun

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

/**
 * 创建新的AI工具包脚本
 * 使用方法: bun run scripts/create-package.ts <package-name>
 */

// 获取命令行参数
const packageName = process.argv[2];

if (!packageName) {
  console.error('❌ 请提供包名');
  console.log('使用方法: bun run scripts/create-package.ts <package-name>');
  console.log('示例: bun run scripts/create-package.ts knowledge-generator');
  process.exit(1);
}

// 验证包名格式
if (!/^[a-z]+(-[a-z]+)*$/.test(packageName)) {
  console.error('❌ 包名格式无效，只能包含小写字母和连字符');
  process.exit(1);
}

const ROOT_DIR = resolve(process.cwd());
const TEMPLATE_DIR = join(ROOT_DIR, 'templates/ai-tools-package');
const PACKAGES_DIR = join(ROOT_DIR, 'packages');
const TARGET_DIR = join(PACKAGES_DIR, packageName);

// 检查模板是否存在
if (!existsSync(TEMPLATE_DIR)) {
  console.error('❌ 模板目录不存在:', TEMPLATE_DIR);
  process.exit(1);
}

// 检查目标目录是否已存在
if (existsSync(TARGET_DIR)) {
  console.error(`❌ 包 '${packageName}' 已经存在`);
  process.exit(1);
}

// 生成替换变量
const replacements = {
  '{{PACKAGE_NAME}}': packageName,
  '{{PACKAGE_NAME_PASCAL}}': toPascalCase(packageName),
  '{{PACKAGE_NAME_CAMEL}}': toCamelCase(packageName),
};

/**
 * 转换为 PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * 转换为 camelCase
 */
function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * 递归复制并替换模板文件
 */
function copyTemplate(sourceDir: string, targetDir: string): void {
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  const files = readdirSync(sourceDir, { withFileTypes: true });

  for (const file of files) {
    const sourcePath = join(sourceDir, file.name);
    const targetPath = join(targetDir, file.name);

    if (file.isDirectory()) {
      copyTemplate(sourcePath, targetPath);
    } else {
      // 读取文件内容
      let content = readFileSync(sourcePath, 'utf-8');

      // 替换模板变量
      for (const [placeholder, value] of Object.entries(replacements)) {
        content = content.replace(new RegExp(placeholder, 'g'), value);
      }

      // 写入目标文件
      writeFileSync(targetPath, content);
    }
  }
}

/**
 * 更新根目录的 package.json 工作空间
 */
function updateRootPackageJson(): void {
  const rootPackageJsonPath = join(ROOT_DIR, 'package.json');
  
  if (!existsSync(rootPackageJsonPath)) {
    console.warn('⚠️  根目录 package.json 不存在，跳过工作空间更新');
    return;
  }

  try {
    const rootPackageJson = JSON.parse(readFileSync(rootPackageJsonPath, 'utf-8'));
    
    if (!rootPackageJson.workspaces) {
      rootPackageJson.workspaces = [];
    }

    const workspacePath = `packages/${packageName}`;
    if (!rootPackageJson.workspaces.includes(workspacePath)) {
      rootPackageJson.workspaces.push(workspacePath);
      rootPackageJson.workspaces.sort(); // 保持排序
      
      writeFileSync(
        rootPackageJsonPath, 
        JSON.stringify(rootPackageJson, null, 2) + '\n'
      );
      
      console.log('✅ 已更新根目录 package.json 工作空间配置');
    }
  } catch (error) {
    console.warn('⚠️  更新根目录 package.json 失败:', error);
  }
}

// 主执行逻辑
console.log(`🚀 创建新包: @ai-tools/${packageName}`);
console.log(`📁 目标目录: ${TARGET_DIR}`);

try {
  // 复制模板
  copyTemplate(TEMPLATE_DIR, TARGET_DIR);
  
  // 更新工作空间配置
  updateRootPackageJson();
  
  console.log('✅ 包创建成功!');
  console.log(`\n📋 下一步操作:`);
  console.log(`   1. cd packages/${packageName}`);
  console.log(`   2. bun install`);
  console.log(`   3. 开始开发你的功能!`);
  console.log(`\n📖 包结构:`);
  console.log(`   - src/types/     - 类型定义和Zod schemas`);
  console.log(`   - src/generators/- 核心生成器逻辑`);
  console.log(`   - src/utils/     - 工具函数`);
  console.log(`   - src/service.ts - 主服务类`);
  console.log(`   - src/index.ts   - 包入口文件`);

} catch (error) {
  console.error('❌ 创建包时发生错误:', error);
  process.exit(1);
}