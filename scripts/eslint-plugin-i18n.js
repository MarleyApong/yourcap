const fs = require('fs');
const path = require('path');

// Plugin ESLint pour vérifier les clés de traduction
module.exports = {
  rules: {
    'translation-key-exists': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Vérifier que les clés de traduction existent',
          category: 'Possible Errors',
          recommended: true,
        },
        schema: [
          {
            type: 'object',
            properties: {
              translationsPath: {
                type: 'string'
              },
              functionName: {
                type: 'string'
              }
            },
            additionalProperties: false
          }
        ]
      },
      create(context) {
        const options = context.options[0] || {};
        const translationsPath = options.translationsPath || './shared/i18n/types.ts';
        const functionName = options.functionName || 't';
        
        let validKeys = new Set();
        
        // Charger les clés valides depuis le fichier de types
        const loadValidKeys = () => {
          try {
            const fullPath = path.resolve(translationsPath);
            if (fs.existsSync(fullPath)) {
              const content = fs.readFileSync(fullPath, 'utf8');
              const keyMatches = content.match(/'([^']+)':\s*string;/g);
              
              if (keyMatches) {
                keyMatches.forEach(match => {
                  const key = match.match(/'([^']+)':/)[1];
                  validKeys.add(key);
                });
              }
            }
          } catch (error) {
            // Ignorer les erreurs de lecture du fichier
          }
        };
        
        loadValidKeys();
        
        return {
          CallExpression(node) {
            // Vérifier les appels à la fonction de traduction
            if (
              node.callee.name === functionName &&
              node.arguments.length > 0 &&
              node.arguments[0].type === 'Literal' &&
              typeof node.arguments[0].value === 'string'
            ) {
              const key = node.arguments[0].value;
              
              if (!validKeys.has(key)) {
                context.report({
                  node: node.arguments[0],
                  message: `Clé de traduction inexistante: "${key}". Utilisez 'npm run parse' pour générer les traductions manquantes.`,
                  data: { key }
                });
              }
            }
          }
        };
      }
    }
  }
};