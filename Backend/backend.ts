import express from "express";
import cors from "cors"; // ✅ Add this
import path, { parse } from "path";
import fs from 'fs';
import helmet from "helmet";
import compression from "compression"
import morgan from "morgan";
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai"
import { TSDocParser, DocNode, DocComment, DocPlainText, DocParamBlock } from "@microsoft/tsdoc";
import ts from 'typescript'
// import { correctSpelling } from "../src/utils/spellCheck"


dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
const app = express();
const PORT = 5001;

function getTsDocSummary(docComment: DocComment): string {
  return docComment.summarySection
    .getChildNodes()
    .map((node: DocNode) => (node.kind === 'PlainText' ? (node as DocPlainText).text : ''))
    .join('')
    .trim();
}

function getTsDocParam(docComment: DocComment): string {
  const params = docComment.params.blocks;
  return params.length > 0 ? params[0].content.getChildNodes().map((n) =>
    n.kind === 'PlainText' ? (n as DocPlainText).text : ''
  ).join('').trim() : '';
}

/** Helper: Find TSDoc comment above a node */
// function extractTsDocComment(node: ts.Node): string | undefined {
//   const jsDocs = (node as any).jsDoc;
//   if (jsDocs && jsDocs.length > 0) {
//     return jsDocs[0].getText?.().trim();
//   }
//   return undefined;
// }

/** Unified Hook Usage + TSDoc Analyzer */
function analyzeHookUsageFromFile(fullPath: string) {
  const fileContent = fs.readFileSync(fullPath, "utf-8");
  const sourceFile = ts.createSourceFile(fullPath, fileContent, ts.ScriptTarget.Latest, true);
  const hooks: any[] = [];

  function visit(node: ts.Node) {
    if (ts.isVariableStatement(node)) {
      node.declarationList.declarations.forEach((decl) => {
        if (
          ts.isVariableDeclaration(decl) &&
          decl.initializer &&
          ts.isCallExpression(decl.initializer)
        ) {
          const expr = decl.initializer.expression;

          if (ts.isIdentifier(expr) && expr.text.startsWith("use")) {
            const hookName = expr.text;
            const line = sourceFile.getLineAndCharacterOfPosition(decl.getStart()).line + 1;
            const args = decl.initializer.arguments.map((arg) => arg.getText());
            const firstArg = args.length > 0 ? args[0] : "";

            // 🔍 Look for TSDoc above the hook call itself
            const leadingCommentRanges = ts.getLeadingCommentRanges(fileContent, decl.initializer.pos) || [];
            let tsDocText = "";

            for (const range of leadingCommentRanges) {
              const commentText = fileContent.slice(range.pos, range.end).trim();
              if (commentText.startsWith("/**")) {
                tsDocText = commentText;
                break;
              }
            }

            let description = "";
            let param = "";

            if (tsDocText) {
  // Clean comment markers
  const cleanedLines = tsDocText
    .split('\n')
    .map(line => line.replace(/^\/\*\*?/, '')
                     .replace(/\*\/$/, '')
                     .replace(/^\s*\* ?/, '')
                     .trim())
    .filter(line => line.length > 0);

  // Extract the summary (first non-tag line)
  const summaryLine = cleanedLines.find(line => !line.startsWith('@'));
  description = summaryLine || '';

  // Extract first @param
  const paramLine = cleanedLines.find(line => line.startsWith('@param'));
  param = paramLine?.split('-').slice(1).join('-').trim() || '';

  console.log('TSDoc comment found:', tsDocText);
  console.log('Extracted summary:', description);
  console.log('Extracted first param:', param);
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
        }
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  console.log("Hooks extracted:", hooks);
  return hooks;
}





function listAllTSXFiles(dir: string, basePath = ''): string[] {
  let results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullpath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(listAllTSXFiles(fullpath, relativePath));
    }
    else if (entry.isFile() && entry.name.endsWith('.tsx')) {
      results.push(relativePath);
    }
  }
  return results;
}

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'))





app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/list-files', (req: Request, res: Response) => {
  const fileList = listAllTSXFiles(path.resolve('src'));
  res.json(fileList);
})

app.post('/ai/summary', async (req: Request, res: Response) => {
  const { metrics } = req.body;
  const generatePrompt = `You are a React performance analysis engine.
  You will receive a metrics object describing the runtime behavior of a single React component. Based on the values, analyze the performance and return a short and crisp summary of how the component is performing. Focus on overall behavior and high-level insights.
  Keep your response concise — no more than 3-4 lines — and in plain text only. Do not include headings or formatting. The tone should be professional and developer-friendly.

---

### 📥 Input Format (Example):

{
  "mountTime": 220,
  "lastRenderDuration": 140,
  "totalRenderDuration": 1800,
  "reRenders": 15,
  "propsChanged": {
    "title": {"prev": "A", "next": "B"},
    "count": {"prev": 1, "next": 2}
  },
  "id": "component_123",
  "displayName": "MyHeavyComponent"
}

---

### 📤 Output Format (Example):

MyHeavyComponent is showing performance issues with long mount and render durations and a high number of re-renders. Consider memoization or reducing unnecessary prop changes to optimize performance.



## Input Fields:
METRICS: ${JSON.stringify(metrics, null, 2)}
`;
  console.log('AI summary endpoint hit. About to call Gemini API.');
  console.log(JSON.stringify(metrics));
  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: generatePrompt }] }],
      config: {
        temperature: 0,
        maxOutputTokens: 5000
      }
    });

 
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
  //  console.log(response);
    let chunkCount = 0;

for await (const chunk of response) {
  chunkCount++;
  const text = chunk.text || '';

  

  
  console.log(text);
  
  res.write(text);

  
}
    res.end();

  

  } catch (error) {
    console.log('Gemini API error:', error)
    res.status(500).json({
      error: 'Failed to get AI summary',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

app.post('/analyze', (req: Request, res: Response) => {
  const { relativeFilePath } = req.body as { relativeFilePath?: string };

  if (!relativeFilePath) {
    res.status(400).json({ error: 'Missing relativeFilePath' });
    return;
  }

  const fullPath = path.resolve('src', relativeFilePath);

  if (!fs.existsSync(fullPath)) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  try {
    const result = analyzeHookUsageFromFile(fullPath);
    res.status(200).json(result);
  } catch (error: unknown) {
    res.status(500).json({
      error: 'Failed to analyze file',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});
// TEST ENDPOINT: Minimal Gemini API connectivity check
app.post('/ai/test', async (req, res) => {
  console.log('AI test endpoint hit. About to call Gemini API.');
  try {
    const prompt = 'Say hello world.';
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],

    });
    console.log('Gemini API responded:', response.text);
    res.json({ summary: response.text });
  } catch (err) {
    console.error('Gemini API test error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

const errMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' })
}
app.use(errMiddleware); // Pass the middleware function, not the result of calling it

app.listen(PORT, () => console.log(`Analyzer running at http://localhost:${PORT}`));
