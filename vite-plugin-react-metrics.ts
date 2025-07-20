import { type PluginOption } from 'vite';
import * as babel from '@babel/core';
import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';

interface MetricsPluginOptions {
  exclude?: string[];
}

export function metricsPlugin(options: MetricsPluginOptions = {}): PluginOption {
  const exclude = options.exclude || [];

  return {
    name: 'vite-plugin-react-metrics',
    enforce: 'post',
    
    async transform(code, id) {
      if (!id.includes('/src/') || !/\.(tsx|jsx)$/.test(id)) {
        return;
      }
      
      if (exclude.some(pattern => id.includes(pattern))) {
        return;
      }

      if (id.includes('withPerformanceMonitor') || id.includes('ComponentViewer')) {
        return;
      }

      const componentName = id.split('/').pop()?.replace(/\.(tsx|jsx)$/, '');
      if (!componentName) return;

      let hasDefaultExport = false;
      
      const result = await babel.transformAsync(code, {
        presets: [
            ['@babel/preset-typescript', { allExtensions: true, isTSX: true }],
            ['@babel/preset-react']
        ],
        plugins: [
          function() {
            return {
              visitor: {
                ExportDefaultDeclaration(path: NodePath<t.ExportDefaultDeclaration>) {
                  hasDefaultExport = true;
                  const declaration = path.node.declaration;

                  let wrappedExport;

                  if (t.isFunctionDeclaration(declaration)) {
                    // ✅ Handles `export default function MyComponent() {}`
                    const componentId = declaration.id;
                    if (componentId) {
                      path.insertBefore(declaration); // Hoist the function declaration
                      wrappedExport = t.callExpression(
                        t.identifier('withPerformanceMonitor'),
                        [
                          componentId, // Wrap the function's name
                          t.objectExpression([
                            t.objectProperty(t.identifier('id'), t.stringLiteral(componentName))
                          ])
                        ]
                      );
                      path.node.declaration = wrappedExport;
                    }
                  } else if (t.isExpression(declaration)) {
                    // ✅ Handles `export default () => {}`, `export default React.memo(...)`, etc.
                    wrappedExport = t.callExpression(
                      t.identifier('withPerformanceMonitor'),
                      [
                        declaration, // Wrap the expression directly
                        t.objectExpression([
                          t.objectProperty(t.identifier('id'), t.stringLiteral(componentName))
                        ])
                      ]
                    );
                    path.node.declaration = wrappedExport;
                  }
                }
              }
            };
          }
        ]
      });

      if (!hasDefaultExport || !result || !result.code) {
        return;
      }

      const importStatement = `import withPerformanceMonitor from '/src/HOC/withPerformanceMonitor.tsx';\n`;
      
      return {
        code: importStatement + result.code,
        map: result.map,
      };
    }
  };
}