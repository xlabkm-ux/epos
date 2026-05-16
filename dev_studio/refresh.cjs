#!/usr/bin/env node
/**
 * Dev Studio — Project Architect: refresh.js (EPIOS Edition)
 * 
 * Сканирует проект Epistemic OS (epios) и генерирует PROJECT_MAP.md —
 * живую карту архитектуры для человека и ИИ-агента.
 * 
 * Запуск: node dev_studio/refresh.js
 * Зависимости: нет (чистый Node.js)
 */

const fs = require('fs');
const path = require('path');

// ── Конфигурация ────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..');
const SCAN_DIRS = [
  { dir: path.join(ROOT, 'apps'), label: 'apps' },
  { dir: path.join(ROOT, 'packages'), label: 'packages' },
];
const OUTPUT = path.join(ROOT, 'PROJECT_MAP.md');
const IGNORE = ['node_modules', '.git', 'data', 'dist', 'build', '.husky', '.github', 'work_doc', 'docs'];
const EXTENSIONS = ['.js', '.mjs', '.ts', '.tsx'];

// ── Утилиты ─────────────────────────────────────────────

function walkDir(dir, base) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE.includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walkDir(fullPath, base));
    } else if (EXTENSIONS.includes(path.extname(entry.name)) && !entry.name.endsWith('.d.ts')) {
      results.push({
        absolute: fullPath,
        relative: path.relative(base, fullPath).replace(/\\/g, '/')
      });
    }
  }
  return results;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const result = {
    exports: [],
    imports: [],
    routes: [],
    envVars: [],
    classes: [],
    description: '',
    lineCount: lines.length,
    sizeKB: (Buffer.byteLength(content) / 1024).toFixed(1),
    contentLen: content.length
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*')) continue;

    // ── Экспорты ──
    let m = trimmed.match(/^module\.exports\s*=\s*(.+?);?\s*$/);
    if (m && !result.exports.includes(m[1])) result.exports.push(m[1]);

    m = trimmed.match(/^module\.exports\s*=\s*\{(.+)\}/);
    if (m) {
      const items = m[1].split(',').map(s => s.trim().split(':')[0].trim()).filter(Boolean);
      for (const item of items) {
        if (!result.exports.includes(item)) result.exports.push(item);
      }
    }

    m = trimmed.match(/^exports\.(\w+)\s*=/);
    if (m && !result.exports.includes(m[1])) result.exports.push(m[1]);

    m = trimmed.match(/^export\s+(default\s+)?(const|let|var|function|class|interface|type)\s+(\w+)/);
    if (m && !result.exports.includes(m[3])) result.exports.push(m[3]);

    // ── Импорты ──
    m = trimmed.match(/(?:const|let|var)\s+\{?([^}=]+)\}?\s*=\s*require\(['"]([^'"]+)['"]\)/);
    if (m) {
      result.imports.push({
        symbols: m[1].trim().replace(/[{}]/g, '').split(',').map(s => s.trim()).filter(Boolean),
        from: m[2]
      });
    }

    m = trimmed.match(/import\s+(?:(.+?)\s+from\s+)?['"]([^'"]+)['"]/);
    if (m) {
      result.imports.push({
        symbols: m[1] ? m[1].replace(/[{}]/g, '').split(',').map(s => s.trim()).filter(Boolean) : ['(side-effect)'],
        from: m[2]
      });
    }

    // ── API роуты ──
    m = trimmed.match(/(?:app|router)\.(get|post|put|delete|patch|use)\s*\(\s*['"]([^'"]+)['"]/);
    if (m) {
      const route = { method: m[1].toUpperCase(), path: m[2] };
      if (!result.routes.some(r => r.method === route.method && r.path === route.path)) {
        result.routes.push(route);
      }
    }

    // ── Переменные окружения ──
    const envMatches = trimmed.matchAll(/process\.env\.([A-Z_][A-Z0-9_]*)/g);
    for (const em of envMatches) {
      if (!result.envVars.includes(em[1])) result.envVars.push(em[1]);
    }

    // ── Классы ──
    m = trimmed.match(/^class\s+(\w+)(\s+extends\s+(\w+))?/);
    if (m) {
      if (!result.classes.some(c => c.name === m[1])) {
        result.classes.push({ name: m[1], extends: m[3] || null });
      }
    }
  }

  const docMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)(?:\n|\*\/)/);
  if (docMatch) result.description = docMatch[1].trim();

  return result;
}

function parseEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return [];
  const content = fs.readFileSync(envPath, 'utf-8');
  const vars = [];
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const m = trimmed.match(/^([A-Z_][A-Z0-9_]*)\s*=/);
    if (m) {
      const isSensitive = /key|secret|password|token/i.test(m[1]);
      const value = trimmed.split('=').slice(1).join('=').trim();
      vars.push({
        name: m[1],
        value: isSensitive ? '***' : (value.length > 60 ? value.substring(0, 60) + '...' : value)
      });
    }
  }
  return vars;
}

const { execSync } = require('child_process');

// ── Генерация Mermaid через Dependency Cruiser ──────────

function getMermaidFromDepCruise(scope) {
  try {
    console.log(`  [DepCruise] Генерация графа для: ${scope}...`);
    // Используем конфигурацию проекта для точного анализа
    const cmd = `npx depcruise --output-type mermaid --config .dependency-cruiser.cjs ${scope}`;
    const output = execSync(cmd, { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 10 });
    
    // DepCruise выводит чистый Mermaid код без markdown-ограждений
    if (output && output.includes('graph')) {
      return `\`\`\`mermaid\n${output.trim()}\n\`\`\``;
    }
    return '```mermaid\ngraph LR\n  Error["Не удалось извлечь Mermaid"]\n```';
  } catch (e) {
    console.error(`  [DepCruise] Ошибка: ${e.message}`);
    return '```mermaid\ngraph LR\n  Error["Ошибка Dependency Cruiser"]\n```';
  }
}

// ── Генерация PROJECT_MAP.md ────────────────────────────

function generateMap() {
  console.log('[DevStudio] Сканирование проекта EPIOS (Интеграция с DepCruise)...');
  
  const componentMap = {};
  const allEnvVars = new Set();

  for (const scanDef of SCAN_DIRS) {
    const files = walkDir(scanDef.dir, scanDef.dir);
    console.log(`  [${scanDef.label}] Найдено ${files.length} файлов`);
    
    componentMap[scanDef.label] = files.map(f => {
      const analysis = analyzeFile(f.absolute);
      analysis.envVars.forEach(v => allEnvVars.add(v));
      return { ...f, analysis };
    });
  }

  // Используем профессиональный инструмент для диаграмм
  const mermaidHigh = getMermaidFromDepCruise('packages apps');
  // Для детальной карты можно использовать другие настройки или тот же депкруз
  const mermaidDetailed = mermaidHigh; 

  // Собираем .env
  const envVars = parseEnvFile(path.join(ROOT, '.env.example'));
  const envFromCode = parseEnvFile(path.join(ROOT, '.env'));

  let totalFiles = 0;
  let totalLines = 0;
  let totalChars = 0;
  for (const files of Object.values(componentMap)) {
    totalFiles += files.length;
    files.forEach(f => {
      totalLines += f.analysis.lineCount;
      totalChars += f.analysis.contentLen;
    });
  }
  const estTokens = Math.ceil(totalChars / 4);
  const contextPressure = ((estTokens / 128000) * 100).toFixed(1);
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const sections = [];

  sections.push(`# 🗺️ PROJECT MAP — epios`);
  sections.push(`> Автоматически сгенерировано: \`${now}\``);
  sections.push(`> Скрипт: \`node dev_studio/refresh.js\``);
  sections.push('');
  sections.push('## 📊 Telemetry / Context Health');
  sections.push(`| Metric | Value | Note |`);
  sections.push(`|---|---|---|`);
  sections.push(`| **Total Files** | \`${totalFiles}\` | Только JS/TS/TSX исходники |`);
  sections.push(`| **Total Lines** | \`${totalLines}\` | Суммарно по проекту |`);
  sections.push(`| **Project Weight** | \`~${estTokens.toLocaleString()} tokens\` | Оценка (4 символа/токен) |`);
  sections.push(`| **Context Pressure** | \`${contextPressure}%\` | Нагрузка на окно 128k (Full Scan) |`);
  sections.push(`| **Map Efficiency** | \`~${(100 - (Buffer.byteLength(JSON.stringify(componentMap)) / totalChars) * 100).toFixed(0)}%\` | Экономия контекста через карту |`);
  sections.push('');
  sections.push('---');
  sections.push('');

  sections.push('## Высокоуровневая архитектура');
  sections.push('> Связи между основными пакетами и приложениями');
  sections.push('');
  sections.push(mermaidHigh);
  sections.push('');

  sections.push('## Детальная карта компонентов');
  sections.push('> Полный граф зависимостей всех файлов проекта');
  sections.push('');
  sections.push(mermaidDetailed);
  sections.push('');

  sections.push('## 🎨 Архитектура UI Интерфейсов (work-shell)');
  sections.push('> Обобщенная концептуальная структура компонентов пользовательского интерфейса');
  sections.push('');
  const uiDiagram = `\`\`\`mermaid
flowchart TD
    subgraph "Global Contexts"
        Security["SecurityContext (RBAC)"]
        WSContext["WorkspaceContext"]
    end

    subgraph "Core Layout"
        App["App.tsx"] --> Sidebar["Sidebar / Command Palette"]
        App --> Workspace["ADRReviewWorkspace"]
    end

    subgraph "Workspace Panels"
        Workspace --> GraphCanvas["GraphCanvas (React Flow)"]
        Workspace --> MissionPanel["MissionPanel"]
        Workspace --> SourcePanel["SourcePanel"]
        Workspace --> RatingPanel["RatingPanel"]
        Workspace --> MappingPanel["MappingPanel (Async Status)"]
        Workspace --> GovernancePanel["GovernancePanel (Patches)"]
        Workspace --> ReadinessPanel["ReadinessPanel"]
    end
    
    App -. "Provides" .-> Security
    App -. "Provides" .-> WSContext
    Workspace -. "Reads" .-> WSContext
    GovernancePanel -. "Role Check" .-> Security
\`\`\``;
  sections.push(uiDiagram);
  sections.push('');
  sections.push('> Подробная документация и Roadmap по развитию интерфейсов находится в [docs/05_ui_roadmap/](docs/05_ui_roadmap/00_ROADMAP_INDEX.md)');
  sections.push('');

  for (const [component, files] of Object.entries(componentMap)) {
    sections.push(`## Компонент: \`${component}\``);
    sections.push('');

    sections.push('| Файл | Строк | Размер | Описание |');
    sections.push('|---|---|---|---|');
    for (const f of files) {
      const a = f.analysis;
      const desc = a.description || (a.classes.length > 0 ? `Класс: ${a.classes.map(c => c.name).join(', ')}` : '—');
      sections.push(`| \`${f.relative}\` | ${a.lineCount} | ${a.sizeKB} KB | ${desc} |`);
    }
    sections.push('');

    for (const f of files) {
      const a = f.analysis;
      if (a.exports.length === 0 && a.routes.length === 0 && a.classes.length === 0) continue;
      sections.push(`### \`${f.relative}\``);
      if (a.classes.length > 0) {
        for (const cls of a.classes) {
          sections.push(`- **Класс**: \`${cls.name}\`${cls.extends ? ` extends \`${cls.extends}\`` : ''}`);
        }
      }
      if (a.exports.length > 0) {
        sections.push(`- **Экспорт**: ${a.exports.map(e => '`' + e + '`').join(', ')}`);
      }
      if (a.routes.length > 0) {
        sections.push('- **Роуты**:');
        for (const r of a.routes) {
          sections.push(`  - \`${r.method} ${r.path}\``);
        }
      }
      if (a.imports.length > 0) {
        sections.push('- **Зависимости**:');
        for (const imp of a.imports) {
          if (imp.from.startsWith('.') || imp.from.startsWith('@epios/')) {
            sections.push(`  - \`${imp.from}\` → ${imp.symbols.join(', ')}`);
          }
        }
      }
      sections.push('');
    }
  }

  sections.push('## Переменные окружения');
  sections.push('');
  sections.push('| Переменная | Используется в |');
  sections.push('|---|---|');
  const envUsage = {};
  for (const [component, files] of Object.entries(componentMap)) {
    for (const f of files) {
      for (const v of f.analysis.envVars) {
        if (!envUsage[v]) envUsage[v] = [];
        envUsage[v].push(`${component}/${path.basename(f.relative)}`);
      }
    }
  }
  for (const [varName, usedIn] of Object.entries(envUsage).sort()) {
    sections.push(`| \`${varName}\` | ${usedIn.join(', ')} |`);
  }
  sections.push('');

  sections.push('## API Реестр');
  sections.push('');
  sections.push('| Метод | Путь | Файл |');
  sections.push('|---|---|---|');
  for (const [component, files] of Object.entries(componentMap)) {
    for (const f of files) {
      for (const r of f.analysis.routes) {
        sections.push(`| \`${r.method}\` | \`${r.path}\` | \`${component}/${f.relative}\` |`);
      }
    }
  }
  sections.push('');

  const content = sections.join('\n');
  fs.writeFileSync(OUTPUT, content, 'utf-8');
  console.log(`[DevStudio] ✅ PROJECT_MAP.md сгенерирован (${(content.length / 1024).toFixed(1)} KB)`);

  const TEMPLATE_PATH = path.join(ROOT, 'dev_studio', 'viewer_template.html');
  const VIEWER_PATH = path.join(ROOT, 'dev_studio', 'viewer.html');
  
  if (fs.existsSync(TEMPLATE_PATH)) {
      let template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
      const b64Content = Buffer.from(content).toString('base64');
      const hydrated = template.replace('{{PROJECT_MAP_CONTENT_B64}}', b64Content);
      fs.writeFileSync(VIEWER_PATH, hydrated, 'utf-8');
      console.log(`[DevStudio] ✅ viewer.html обновлен`);
  }
}

generateMap();
