import express from "express";
import cors from "cors"; // ✅ Add this
import { analyzeHookUsageFromFile } from "../src/analyzer/hookAnalyzer"; // or wherever your analyzer lives
import path from "path";
import fs from 'fs';
import helmet from "helmet";
import compression from "compression"
import morgan from "morgan";

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


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/list-files',(req,res)=>{
  const fileList=listAllTSXFiles(path.resolve('src'));
  res.json(fileList);
})

app.post('/analyze', (req, res) => {
  const { relativeFilePath } = req.body;
  const fullPath = path.resolve('src', relativeFilePath);

  try {
    const result = analyzeHookUsageFromFile(fullPath);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'failed to analyze file', details: error });
  }
});

const errMiddleware=(err,req,res,next)=>{
  console.error(err);
  res.status(500).json({error:'Internal Server Error'})
}
app.use(errMiddleware); // Pass the middleware function, not the result of calling it

app.listen(PORT, () => console.log(`Analyzer running at http://localhost:${PORT}`));
