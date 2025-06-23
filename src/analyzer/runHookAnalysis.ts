import { analyzeHookUsageFromFile } from './hookAnalyzer'; // Don't forget `.js` if using ESModules
import path from 'path';

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('❌ Usage: node runHookAnalysis.js <path-to-component>');
  process.exit(1);
}

const relativeFilePath = args[0];
const filePath = path.resolve(relativeFilePath);
console.log(`🔍 Analyzing: ${filePath}`);

try {
  const { hooksUsed, hookDetails } = analyzeHookUsageFromFile(filePath);

  if (hookDetails.length === 0) {
    console.log('⚠️  No React-style hooks found.');
  } else {
    console.log(`\n✅ Found ${hookDetails.length} hook${hookDetails.length > 1 ? 's' : ''}:\n`);

    for (const hook of hookDetails) {
      console.log(`🔧 ${hook.name} @ line ${hook.line}`);
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

    console.log(`🧩 Unique hooks used: [${hooksUsed.join(', ')}]`);
  }

} catch (err) {
  console.error('❌ Error analyzing file:');
}
