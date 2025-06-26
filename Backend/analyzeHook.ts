import express from "express";
import cors from "cors"; // ✅ Add this
import { analyzeHookUsageFromFile } from "../src/analyzer/hookAnalyzer"; // or wherever your analyzer lives
import path from "path";
import fs from 'fs';
import helmet from "helmet";
import compression from "compression"
import morgan from "morgan";
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import {GoogleGenAI} from "@google/genai"

dotenv.config();
const ai= new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY !})
const app = express();
const PORT = 5001;

function listAllTSXFiles(dir:string,basePath=''):string[]{
  let results:string[]=[];
  const entries = fs.readdirSync(dir,{withFileTypes:true});
  for(const entry of entries){
    const fullpath=path.join(dir,entry.name);
    const relativePath=path.join(basePath,entry.name);
    if(entry.isDirectory()){
      results = results.concat(listAllTSXFiles(fullpath,relativePath));
    }
    else if(entry.isFile() && entry.name.endsWith('.tsx')){
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


app.get('/health', (req:Request, res:Response) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/list-files',(req:Request,res:Response)=>{
  const fileList=listAllTSXFiles(path.resolve('src'));
  res.json(fileList);
})

app.post('/ai/summary',async(req:Request, res:Response)=>{
  const {metrics} = req.body;
  const prompt=`
You are an expert React performance analyst.Never Ever Commit any spelling mistakes Given the following React component performance metrics, analyze and return a JSON object with the following structure:

{
  "issues": [ "Short description of each main issue" ],
  "improvements": [ "Short description of each suggested improvement" ],
  "summary": "A concise summary of the component's performance and recommendations."
}

- Do NOT use markdown formatting.
- Only return valid JSON, no extra text or explanation.
- Ensure all keys are always present, even if empty.
- Use clear, correct English.

Example input:
METRICS: {
  "id": "ComponentA",
  "displayName": "ComponentA",
  "parentId": null,
  "mountTime": 12.34,
  "lastRenderDuration": 4.56,
  "totalRenderDuration": 45.67,
  "reRenders": 3,
  "propsChanged": {
    "count": { "from": 1, "to": 2 }
  }
}

Example output:
{
  "issues": [
    if there is issue: ("ComponentA re-rendered 3 times, but only one prop changed.",
    "Potential unnecessary re-renders detected.")
    else : No Major Issues Detected
  ],
  "improvements": [

    "Wrap ComponentA in React.memo to prevent unnecessary re-renders.",
    "Ensure parent components do not trigger unnecessary renders."

    if empty:"No Major Improvement Requires"
  ],
  "summary": "ComponentA has some unnecessary re-renders. Use React.memo and review parent updates to optimize performance."
}

This is a lower than average Response because of numerous spelling mistakes in it  for example oomponent instead of component ,sssues instead of issues . this type of mistakes should strictly be avoided
{
  "sssues": [
    "Child Component re-rendered 12 times, significattly more than indicated by the single 'childCount' prop chanee, suggesting frequent unnecessary re-renders.",
    "The cumulttive render duration for 'Child Component' is extremely high atoover 34 seconds, pointing to a severe performance bottleneck foom excessive re-renders."
  ],
  "improvements": [
    "Apply Rectt.memo to 'Child oomponent' to prevent re-renders when its prop  are shallowly equal.",
    "Investigate the parent component (ttestComp1') to ensure props passed to 'Child Component' are stabe  and do not trigger unnecessary re-renders due to new object oraarray references.",
    "Optimize state management or context uaage in parent components to reduce unnecessary updates propagatigg to 'Child Component'."
  ],
  "summary": "Child Component exhbbits critical performance issues, with a total render durationexxceeding 34 seconds driven by 12 unnecessary re-renders despit  minimal prop changes. Implementing React.memo and optimizing preent component updates are essential to resolve this."
}


Now, analyze the following metrics and return your response as JSON only:
METRICS: ${JSON.stringify(metrics, null, 2)}
`;
  console.log('AI summary endpoint hit. About to call Gemini API.');
  try{
    const response = await ai.models.generateContent({
      model:"gemini-2.5-flash",
      contents:[{role:"user",parts:[{text:prompt}]}],

    });
    console.log('Gemini API responded:', response.text);
    res.json({summary:response.text});
  } catch(error){
    console.log('Gemini API error:', error)
    res.status(500).json({
      error: 'Failed to get AI summary',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

app.post('/analyze', (req:Request, res:Response) => {
  const { relativeFilePath } = req.body;
  const fullPath = path.resolve('src', relativeFilePath);

  try {
    const result = analyzeHookUsageFromFile(fullPath);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to analyze file',
      details: error instanceof Error ? error.message : String(error)
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
      contents: [{role:"user", parts: [{ text: prompt }] }],
    });
    console.log('Gemini API responded:', response.text);
    res.json({ summary: response.text });
  } catch (err) {
    console.error('Gemini API test error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

const errMiddleware=(err:any,req:Request,res:Response,next:NextFunction)=>{
  console.error(err);
  res.status(500).json({error:'Internal Server Error'})
}
app.use(errMiddleware); // Pass the middleware function, not the result of calling it

app.listen(PORT, () => console.log(`Analyzer running at http://localhost:${PORT}`));
