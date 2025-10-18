// Script pour générer les types TypeScript à partir des traductions
import { fr } from './locales/fr';

type FlattenObjectKeys<T extends Record<string, any>, Key = keyof T> = Key extends string
  ? T[Key] extends Record<string, any>
    ? `${Key}.${FlattenObjectKeys<T[Key]>}`
    : Key
  : never;

type TranslationKey = FlattenObjectKeys<typeof fr>;

// Générer l'interface des types
function generateTypesFile() {
  const now = new Date().toLocaleString('fr-FR');
  
  const generateKeysFromObject = (obj: any, prefix = ''): string[] => {
    const keys: string[] = [];
    
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys.push(...generateKeysFromObject(value, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    
    return keys;
  };
  
  const allKeys = generateKeysFromObject(fr);
  
  let content = `// Types générés automatiquement - NE PAS MODIFIER MANUELLEMENT\n`;
  content += `// Généré le ${now}\n\n`;
  content += `export interface TranslationKeys {\n`;
  
  for (const key of allKeys) {
    content += `  '${key}': string;\n`;
  }
  
  content += `}\n\n`;
  content += `export type TranslationKey = keyof TranslationKeys;\n`;
  
  return content;
}

// Si ce fichier est exécuté directement
if (require.main === module) {
  const fs = require('fs');
  const path = require('path');
  
  const typesContent = generateTypesFile();
  const typesPath = path.join(__dirname, 'types.ts');
  
  fs.writeFileSync(typesPath, typesContent);
  console.log('✅ Types générés avec succès dans types.ts');
}

export { generateTypesFile };
