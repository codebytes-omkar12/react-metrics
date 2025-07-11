import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import ts from "typescript";
import { DocNode, DocPlainText, DocComment } from "@microsoft/tsdoc";

dotenv.config();
const app = express();
const PORT = 5001;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

/** Extract all allowed source files under `src/` recursively */
function listAllCodeFiles(dir: string, basePath = ''): string[] {
  const allowedExts = ['.tsx', '.ts', '.jsx', '.js'];
  let results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    console.log(fullPath, 'llllllllllll');
    
    const relativePath = path.join(basePath, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(listAllCodeFiles(fullPath, relativePath));
    } else if (entry.isFile() && allowedExts.some(ext => entry.name.endsWith(ext))) {
      results.push(fullPath.replace(/\\/g, '/'));
    }
  }
  console.log(results, 'llllllllllllllllllllll');
  
  return results;
}

/** Hook + TSDoc analysis from source file */
function analyzeHookUsageFromFile(fullPath: string) {
  const fileContent = fs.readFileSync(fullPath, "utf-8");
  const sourceFile = ts.createSourceFile(fullPath, fileContent, ts.ScriptTarget.Latest, true);
  const hooks: any[] = [];

  function processHook(hookName: string, callExpr: ts.CallExpression, startPos: number) {
    const line = sourceFile.getLineAndCharacterOfPosition(startPos).line + 1;
    const args = callExpr.arguments.map(arg => arg.getText());
    const firstArg = args.length > 0 ? args[0] : "";

    let tsDocText = "";
    const commentRanges = ts.getLeadingCommentRanges(fileContent, callExpr.pos) || [];

    for (const range of commentRanges) {
      const text = fileContent.slice(range.pos, range.end).trim();
      if (text.startsWith("/**")) {
        tsDocText = text;
        break;
      }
    }

    let description = "";
    let param = "";

    if (tsDocText) {
      const lines = tsDocText.split('\n').map(line =>
        line.replace(/^\/\*\*?/, '').replace(/\*\/$/, '').replace(/^\s*\* ?/, '').trim()
      ).filter(line => line);

      description = lines.find(line => !line.startsWith('@')) || '';
      const paramLine = lines.find(line => line.startsWith('@param'));
      param = paramLine?.split('-').slice(1).join('-').trim() || '';
    }

    hooks.push({
      hook: hookName,
      line,
      source: "react",
      args: args.length,
      firstArg,
      description: description || param || "",
    });
  }

  function visit(node: ts.Node) {
    if (ts.isVariableStatement(node)) {
      node.declarationList.declarations.forEach((decl) => {
        if (ts.isVariableDeclaration(decl) && decl.initializer && ts.isCallExpression(decl.initializer)) {
          const expr = decl.initializer.expression;
          if (ts.isIdentifier(expr) && expr.text.startsWith("use")) {
            processHook(expr.text, decl.initializer, decl.getStart());
          }
        }
      });
    }

    if (ts.isExpressionStatement(node) && ts.isCallExpression(node.expression)) {
      const expr = node.expression.expression;
      if (ts.isIdentifier(expr) && expr.text.startsWith("use")) {
        processHook(expr.text, node.expression, node.getStart());
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return hooks;
}

/** Routes */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/list-files', (req, res) => {
  const files = listAllCodeFiles(path.resolve('src'));
  res.json(files);
});

app.post('/analyze', (req: Request, res: Response) => {
  const { relativeFilePath } = req.body;

  if (!relativeFilePath) {
   res.status(400).json({ error: 'Missing relativeFilePath' });
    return 
  }

  const fullPath = path.resolve('src', relativeFilePath);

  if (!fs.existsSync(fullPath)) {
    res.status(404).json({ error: 'File not found' });
    return 
  }

  try {
    const result = analyzeHookUsageFromFile(fullPath);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to analyze file', details: String(err) });
  }
});
app.post('/ai/score', async (req: Request, res: Response) => {
  const { metrics, relativeFilePath, hookDetails } = req.body;

  if (!metrics || typeof metrics !== 'object') {
    res.status(400).json({ error: 'Missing or invalid metrics' });
    return ;
  }
  if (!relativeFilePath || typeof relativeFilePath !== 'string') {
   res.status(400).json({ error: 'Missing or invalid relativeFilePath' });
    return ;
  }
  if (!hookDetails || !Array.isArray(hookDetails)) {
    res.status(400).json({ error: 'Missing or invalid hookDetails' });
    return ;
  }

  const fullPath = path.resolve('src', relativeFilePath);
  if (!fs.existsSync(fullPath)) {
    res.status(404).json({ error: 'File not found' });
    return ;
  }

  const sourceCode = fs.readFileSync(fullPath, 'utf-8');
  const extension = path.extname(relativeFilePath);
  const isComponent = Object.keys(metrics).length > 0;

 const prompt = `
You are a React code reviewer AI.

Score the code from 0-100 based on:
- Optimization
- Maintainability
- React best practices

🔒 IMPORTANT OUTPUT RULES:
- Respond ONLY with valid **plain JSON**
- Do NOT use markdown formatting
- Do NOT include code fences (like \`\`\`json)
- Do NOT include any explanation, comments, or extra text
- The output must be strictly like: { "file": "Component.tsx", "score": 85 }

--- FILE INFO ---
Extension: ${extension}
Type: ${isComponent ? 'React Component' : 'Utility / Other'}

--- SOURCE CODE ---
${sourceCode}

${isComponent ? `--- METRICS ---\n${JSON.stringify(metrics)}\n` : ''}

--- HOOK USAGE ---
${JSON.stringify(hookDetails)}
`.trim();
;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.2, maxOutputTokens: 4000 },
    });

 const text = response.text || '';
console.log('🔍 Gemini raw response:', text);

try {
  // Strip markdown fences
  const cleaned = text
    .replace(/```json/i, '')
    .replace(/```/, '')
    .trim();

  // Optional: validate that it looks like JSON
  if (!cleaned.startsWith('{') || !cleaned.endsWith('}')) {
    throw new Error('Invalid JSON format');
  }

  const parsed = JSON.parse(cleaned);

  const score = typeof parsed.score === 'number' ? parsed.score : null;
  if (score === null) {
    throw new Error('Score missing or invalid');
  }

  res.json({ score });
} catch (err) {
  console.error('Invalid AI response:', err, '\nRaw Text:', text);
  res.status(500).json({
    error: 'AI returned invalid or incomplete JSON',
    raw: text,
    details: err instanceof Error ? err.message : String(err),
  });
}


  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({
      error: 'Failed to get AI Score',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

app.post('/ai/summary', async (req: Request, res: Response) => {
  const { metrics, relativeFilePath, hookDetails } = req.body;

 console.log('📩 Incoming payload:');
console.log('metrics:', metrics);
console.log('relativeFilePath:', relativeFilePath);
console.log('hookDetails:', hookDetails);

  if (!relativeFilePath) {
   res.status(400).json({ error: 'Missing metrics, file path, or hook details' });
    return 
  }

  const fullPath = path.resolve('src', relativeFilePath);
  if (!fs.existsSync(fullPath)) {
     res.status(404).json({ error: 'File not found' });
     return
  }

  const sourceCode = fs.readFileSync(fullPath, 'utf-8');
  const extension = path.extname(relativeFilePath);
  const isComponent = Object.keys(metrics).length > 0;

  const prompt = `
You are a React and frontend code reviewer AI.

Analyze the following file and return:
- A clear 3-4 line health summary
- 2-3 actionable suggestions for improvements

--- FILE INFO ---
Extension: ${extension}
Type: ${isComponent ? 'React Component' : 'Utility / Hook / Other'}

--- SOURCE CODE ---
\`\`\`${extension.replace('.', '')}
${sourceCode}
\`\`\`

${isComponent ? `--- METRICS ---\n${JSON.stringify(metrics, null, 2)}\n` : ''}

--- HOOK USAGE ---
${JSON.stringify(hookDetails, null, 2)}

Your response must stream as plain text only. Follow this format:

[summary]
SUGGESTIONS:
- [tip 1]
- [tip 2]
- [tip 3]
`;

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.2, maxOutputTokens: 3000 },
    });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of response) {
      const text = chunk.text || '';
      res.write(text);
      process.stdout.write(text);
    }

    res.end();
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({
      error: 'Failed to get AI summary',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

app.post('/ai/test', async (req, res) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: "Say hello world." }] }],
    });
    res.json({ summary: response.text });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

/** Global Error Middleware */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`✅ Analyzer running at http://localhost:${PORT}`);
});
