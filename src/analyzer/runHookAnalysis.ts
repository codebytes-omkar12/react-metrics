// runHookAnalysis.ts

import { analyzeHookUsageFromFile } from './hookAnalyzer'; // NO `.js` here if running with ts-node
import path from 'path';

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('❌ Usage: ts-node runHookAnalysis.ts <relative-path-to-component>');
  process.exit(1);
}

const relativeFilePath = args[0];
const filePath = path.resolve(relativeFilePath);
console.log(`🔍 Analyzing: ${filePath}`);

try {
  const { hooksUsed, hookDetails } = analyzeHookUsageFromFile(filePath);

  if (hookDetails.length === 0) {
    console.log('  No React-style hooks found.');
  } else {
    console.log(`\n Found ${hookDetails.length} hook${hookDetails.length > 1 ? 's' : ''}:\n`);
    for (const hook of hookDetails) {
      console.log(` ${hook.name} @ line ${hook.line}`);
      console.log(`   • Source: ${hook.importedFrom}`);
      console.log(`   • Args: ${hook.numArgs}`);
      if (hook.firstArgSummary) {
        console.log(`   • First Arg: ${hook.firstArgSummary}`);
      }
      if (hook.description) {
        console.log(`   • Comment: ${hook.description}`);
      }
      console.log();
    }
    console.log(` Unique hooks used: [${hooksUsed.join(', ')}]`);
  }
} catch (err) {
  console.error('Error analyzing file:', err);
}
