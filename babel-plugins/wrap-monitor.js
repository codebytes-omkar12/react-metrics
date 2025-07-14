const path = require("path");

module.exports = function wrapWithPerformanceMonitor({ types: t }) {
  return {
    visitor: {
      ExportDefaultDeclaration(pathNode, state) {
        const declaration = pathNode.node.declaration;
        const currentFile = state.file.opts.filename;

        // 🛑 Skip if wrapped in React.memo or React.forwardRef
        if (
          t.isCallExpression(declaration) &&
          t.isMemberExpression(declaration.callee) &&
          declaration.callee.object.name === "React" &&
          (declaration.callee.property.name === "memo" ||
            declaration.callee.property.name === "forwardRef")
        ) {
          console.log(`⏭️  Skipping HOC-wrapped: ${currentFile}`);
          return;
        }

        // ✅ Handle valid component declarations
        let componentName = "MonitoredComponent";

        if (t.isFunctionDeclaration(declaration) && declaration.id) {
          componentName = declaration.id.name;
          pathNode.insertBefore(declaration);
          pathNode.node.declaration = t.callExpression(
            t.identifier("withPerformanceMonitor"),
            [
              t.identifier(componentName),
              t.objectExpression([
                t.objectProperty(t.identifier("id"), t.stringLiteral(componentName)),
              ]),
            ]
          );
        } else if (
          t.isArrowFunctionExpression(declaration) ||
          t.isIdentifier(declaration)
        ) {
          componentName = declaration.id?.name || declaration.name || componentName;

          pathNode.node.declaration = t.callExpression(
            t.identifier("withPerformanceMonitor"),
            [
              t.isIdentifier(declaration)
                ? t.identifier(declaration.name)
                : declaration,
              t.objectExpression([
                t.objectProperty(t.identifier("id"), t.stringLiteral(componentName)),
              ]),
            ]
          );
        } else {
          console.log(`⏭️  Skipping unknown export in: ${currentFile}`);
          return;
        }

        // 📦 Resolve import path for HOC
        const fromDir = path.dirname(currentFile);
        const hocFile = path.resolve(__dirname, "../src/HOC/withPerformanceMonitor.tsx");

        let importPath = path.relative(fromDir, hocFile).replace(/\\/g, "/");
        importPath = importPath.replace(/\.tsx?$/, "");
        if (!importPath.startsWith(".")) {
          importPath = "./" + importPath;
        }

        // ✅ Prevent duplicate imports
        const alreadyImported = pathNode.hub.file.ast.program.body.some(
          (n) =>
            t.isImportDeclaration(n) && n.source.value === importPath
        );

        if (!alreadyImported) {
          pathNode.hub.file.ast.program.body.unshift(
            t.importDeclaration(
              [t.importDefaultSpecifier(t.identifier("withPerformanceMonitor"))],
              t.stringLiteral(importPath)
            )
          );
        }

        console.log(`✅ Babel wrapped: ${componentName} in ${currentFile}`);
      },
    },
  };
};
