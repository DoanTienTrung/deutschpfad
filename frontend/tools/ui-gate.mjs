#!/usr/bin/env node
// Cổng kiểm tra giao diện: chặn code lệch khỏi design system (token + bộ component @kit).
// Chạy: node tools/ui-gate.mjs [thư mục...]   (mặc định: src). Báo file:dòng kèm lý do, sai thì exit 1.
// Miễn trừ cả file (phải ghi lý do): dòng `// ui-gate-ignore-file: <lý do>` ở bất kỳ đâu trong file.
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..')
const targets = process.argv.slice(2).length ? process.argv.slice(2) : ['src']

// Thư mục được phép làm việc "cấp thấp": chính bộ kit, lớp token, và trang duyệt design system.
const ALLOWED_DIRS = ['src/components/kit/', 'src/styles/', 'src/pages/dev/']

const COLOR_PREFIX = '(?:bg|text|border(?:-[trblxy])?|ring|ring-offset|from|via|to|fill|stroke|divide|outline|decoration|placeholder|accent|caret|shadow)'
const VARIANTS = '(?:[a-z0-9-]+:)*'

const RULES = [
  {
    id: 'hex-color',
    re: /#[0-9a-fA-F]{3,8}\b(?![-\w])/,
    why: 'Màu viết thẳng (#hex). Dùng token trong src/styles/tokens.css qua class Tailwind (vd. bg-karteikarte).',
    skipLine: (line) => /href=["'`]#|id=["'`]|url\(#|#[0-9]+\b|\$\{.*#/.test(line),
  },
  { id: 'rgba', re: /\brgba?\(|\bhsla?\(/, why: 'Màu viết thẳng (rgb/hsl). Dùng token.' },
  {
    id: 'arbitrary-value',
    re: new RegExp(`(?<![\\w-])${VARIANTS}(?:bg|text|border|rounded|shadow)-\\[`),
    why: 'Giá trị tự chọn (bg-[...], text-[...], rounded-[...], shadow-[...]). Thiếu thì thêm token, đừng đặc cách tại chỗ.',
  },
  {
    id: 'font-weight',
    re: new RegExp(`(?<![\\w-])${VARIANTS}font-(?:black|extrabold|thin|extralight|light)\\b`),
    why: 'Độ đậm ngoài thang (chỉ dùng normal/medium/semibold/bold).',
  },
  {
    id: 'default-palette',
    re: new RegExp(`(?<![\\w-])${VARIANTS}${COLOR_PREFIX}-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d{2,3})\\b`),
    why: 'Màu của bảng mặc định Tailwind (đã bị xoá, sẽ không hiện). Dùng token theo ẩn dụ (bleistift, rotstift, tinte...).',
  },
  {
    id: 'deprecated-token',
    re: new RegExp(`(?<![\\w-])${VARIANTS}(?:${COLOR_PREFIX}-(?:canvas|surface|card|ink|muted|hairline|primary|primary-deep|accent|accent-deep|danger|danger-bg|success|success-bg|m[1-4]|bar-muted)|shadow-(?:lifted|floating|sm|md|lg|xl|2xl)|rounded(?:-[trblse]{1,2})?-(?:xs|sm|md|lg|xl|2xl|3xl|full))(?![\\w-])`),
    why: 'Token đã khai tử (tên cũ trước design system Leitner). Xem bảng đổi tên trong DESIGN.md.',
  },
  {
    id: 'raw-control',
    re: /<(input|select|textarea)(?=[\s>]|$)/,
    why: 'Ô nhập thô. Dùng Input, Textarea, NativeSelect, Select, Checkbox, Radio, Switch, Slider, FileInput từ @kit.',
  },
  {
    id: 'styled-button',
    re: /<button(?=[\s>]|$)/,
    why: '<button> tự dựng. Dùng Button, IconButton, Chip, CardButton, RowButton, AnswerOption... từ @kit.',
  },
  {
    id: 'custom-dialog',
    re: /role=["']dialog["']|\bfixed inset-0\b/,
    why: 'Tự dựng hộp thoại/lớp phủ. Dùng Dialog, ConfirmDialog, BottomSheet, Drawer, Popover từ @kit.',
  },
  {
    id: 'foreign-ui-import',
    re: /from\s+['"](?:@radix-ui\/|@headlessui\/|@mui\/|antd|react-bootstrap|@chakra-ui\/|[./]+(?:components\/)?ui\/)/,
    why: 'Import component giao diện ngoài cửa @kit.',
  },
  {
    id: 'emoji-icon',
    re: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{23F0}-\u{23FF}]/u,
    why: 'Emoji dùng làm icon. Dùng icon của lucide-react.',
  },
]

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (/\.(tsx|ts|jsx|js)$/.test(entry.name) && !/\.(test|spec)\./.test(entry.name)) out.push(full)
  }
  return out
}

// Bỏ comment (khối và dòng) nhưng giữ số dòng, để không báo nhầm chữ trong ghi chú.
function stripComments(src) {
  let out = ''
  let i = 0
  let quote = null
  while (i < src.length) {
    const c = src[i]
    const n = src[i + 1]
    if (quote) {
      out += c
      if (c === '\\') { out += n ?? ''; i += 2; continue }
      if (c === quote) quote = null
      i++
      continue
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; out += c; i++; continue }
    if (c === '/' && n === '*') {
      const end = src.indexOf('*/', i + 2)
      const chunk = src.slice(i, end === -1 ? src.length : end + 2)
      out += chunk.replace(/[^\n]/g, ' ')
      i += chunk.length
      continue
    }
    if (c === '/' && n === '/' && src[i - 1] !== ':') {
      const end = src.indexOf('\n', i)
      const chunk = src.slice(i, end === -1 ? src.length : end)
      out += ' '.repeat(chunk.length)
      i += chunk.length
      continue
    }
    out += c
    i++
  }
  return out
}

const problems = []
for (const target of targets) {
  const abs = path.resolve(ROOT, target)
  const files = fs.statSync(abs).isDirectory() ? walk(abs) : [abs]
  for (const file of files) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/')
    if (ALLOWED_DIRS.some((d) => rel.startsWith(d))) continue
    const src = fs.readFileSync(file, 'utf8')
    if (/ui-gate-ignore-file:\s*\S+/.test(src)) continue
    const lines = stripComments(src).split('\n')
    lines.forEach((line, index) => {
      for (const rule of RULES) {
        if (!rule.re.test(line)) continue
        if (rule.skipLine?.(line)) continue
        problems.push(`${rel}:${index + 1}  [${rule.id}] ${rule.why}`)
      }
    })
  }
}

if (problems.length) {
  console.error(problems.join('\n'))
  console.error(`\nui-gate: ${problems.length} lỗi. Sửa theo gợi ý, hoặc miễn trừ cả file bằng "// ui-gate-ignore-file: <lý do>".`)
  process.exit(1)
}
console.log('ui-gate: không có lỗi.')
