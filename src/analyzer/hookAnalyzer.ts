import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import { default as traverse, NodePath } from '@babel/traverse';
import * as t from '@babel/types';

interface HookDetail {
  name: string;
  line: number;
  importedFrom: string;
  description?: string;
  numArgs: number;
  firstArgSummary?: string;
}


export function analyzeHooksInFile(code: string): {
  hooksUsed: string[];
  hookDetails: HookDetail[];
} {
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    attachComment: true,
  });

  const hooksUsed = new Set<string>();
  const hookDetails: HookDetail[] = [];
  const importMap = new Map<string, string>();

  // 1. Record all imported identifiers
  traverse(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value;
      for (const specifier of path.node.specifiers) {
        if (
          specifier.type === 'ImportSpecifier' ||
          specifier.type === 'ImportDefaultSpecifier'
        ) {
          const localName = specifier.local.name;
          importMap.set(localName, source);
        }
      }
    },
  });

  // 2. Analyze hook usage
  traverse(ast, {
    CallExpression(path: NodePath<t.CallExpression>) {
      const callee = path.node.callee;

      if (callee.type === 'Identifier' && /^use[A-Z]/.test(callee.name)) {
        hooksUsed.add(callee.name);

        const line = path.node.loc?.start.line ?? 0;
        const importedFrom = importMap.get(callee.name) ?? 'Unknown';

        // Get possible leading comment from current or parent node
        const comments = path.node.leadingComments || path.parentPath.node.leadingComments || [];
        let description: string | undefined;
        if (comments.length > 0) {
          description = comments[comments.length - 1].value.trim();
        }

        const numArgs = path.node.arguments.length;

        // Simplify first argument if possible
        let firstArgSummary: string | undefined;
        const firstArg = path.node.arguments[0];
        if (firstArg) {
          if (t.isStringLiteral(firstArg)) {
            firstArgSummary = `"${firstArg.value}"`;
          } else if (t.isNumericLiteral(firstArg)) {
            firstArgSummary = String(firstArg.value);
          } else if (t.isIdentifier(firstArg)) {
            firstArgSummary = firstArg.name;
          } else {
            firstArgSummary = code.slice(firstArg.start!, firstArg.end!);
            if (firstArgSummary.length > 80) {
              firstArgSummary = firstArgSummary.slice(0, 77) + '...';
            }
          }
        }

        hookDetails.push({
          name: callee.name,
          line,
          description,
          importedFrom,
          numArgs,
          firstArgSummary,
        });
      }
    },
  });

  return {
    hooksUsed: Array.from(hooksUsed),
    hookDetails,
  };
}

export function analyzeHookUsageFromFile(filePath: string) {
  const absolutePath = path.resolve(filePath);
  const code = fs.readFileSync(absolutePath, 'utf-8');
  return analyzeHooksInFile(code);
}
