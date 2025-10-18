#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Configuration par défaut
const DEFAULT_CONFIG = {
  srcDir: './app',
  additionalDirs: ['./features', './shared'],
  i18nPath: './shared/i18n',
  localesPath: './shared/i18n/locales',
  supportedLanguages: ['fr', 'en', 'es'], // Langues par défaut
  filePatterns: ['**/*.{ts,tsx,js,jsx}'],
  excludePatterns: ['**/*.d.ts', '**/node_modules/**', '**/.git/**'],
  translationFunction: 't',
  verbose: false,
  sort: false,
  clean: false,
  watch: false
};

class I18nParser {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.foundKeys = new Set();
    this.existingKeys = new Map(); // Map de langue -> clés existantes
    this.scanResults = {
      filesScanned: [],
      keysFound: [],
      keysAdded: [],
      keysRemoved: [],
      errors: []
    };
  }

  log(message, isVerbose = false) {
    if (!isVerbose || this.config.verbose) {
      console.log(message);
    }
  }

  error(message) {
    console.error(`❌ ${message}`);
    this.scanResults.errors.push(message);
  }

  success(message) {
    console.log(`✅ ${message}`);
  }

  warning(message) {
    console.warn(`⚠️  ${message}`);
  }

  // Extraire les clés de traduction d'un fichier
  extractKeysFromFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      // Regex plus précise pour éviter les faux positifs
      // Cherche: t('key') ou t("key") ou t(`key`) avec des espaces optionnels
      const regex = new RegExp(`\\b${this.config.translationFunction}\\s*\\(\\s*["'\`]([a-zA-Z][a-zA-Z0-9._-]*)["'\`]\\s*\\)`, 'g');
      const keys = [];
      let match;

      while ((match = regex.exec(content)) !== null) {
        const key = match[1];
        // Filtrer les clés invalides et s'assurer qu'elles commencent par une lettre
        if (key && key.length > 1 && /^[a-zA-Z]/.test(key) && !key.endsWith('.')) {
          keys.push(key);
          this.foundKeys.add(key);
        }
      }

      if (keys.length > 0) {
        this.scanResults.filesScanned.push({
          file: filePath,
          keys: keys
        });
        this.log(`📄 ${filePath}: ${keys.length} clé(s) trouvée(s)`, true);
        keys.forEach(key => this.log(`   - ${key}`, true));
      }

      return keys;
    } catch (error) {
      this.error(`Erreur lors de la lecture du fichier ${filePath}: ${error.message}`);
      return [];
    }
  }

  // Scanner tous les fichiers
  async scanFiles() {
    const dirsToScan = [this.config.srcDir, ...this.config.additionalDirs];
    const allFiles = [];

    for (const dir of dirsToScan) {
      if (fs.existsSync(dir)) {
        this.log(`📂 Scan du répertoire: ${dir}`, true);
        const patterns = this.config.filePatterns.map(pattern => path.join(dir, pattern));
        for (const pattern of patterns) {
          const files = await glob(pattern, { 
            ignore: this.config.excludePatterns,
            windowsPathsNoEscape: true 
          });
          allFiles.push(...files);
          this.log(`   - Pattern ${pattern}: ${files.length} fichier(s)`, true);
        }
      } else {
        this.log(`⚠️  Répertoire non trouvé: ${dir}`, true);
      }
    }

    this.log(`🔍 Scan de ${allFiles.length} fichier(s)...`);

    for (const file of allFiles) {
      this.extractKeysFromFile(file);
    }

    this.log(`📊 ${this.foundKeys.size} clé(s) unique(s) trouvée(s)`);
    return Array.from(this.foundKeys);
  }

  // Charger les traductions existantes pour une langue
  loadExistingTranslationsForLanguage(language) {
    const langPath = path.join(this.config.localesPath, `${language}.ts`);
    
    if (!fs.existsSync(langPath)) {
      this.log(`📄 Fichier ${language}.ts non trouvé, sera créé`, true);
      return {};
    }

    try {
      const content = fs.readFileSync(langPath, 'utf8');
      
      // Extraire les clés existantes de façon simple
      const keyRegex = /(\w+(?:\.\w+)*)\s*:\s*"[^"]*"/g;
      const keys = new Set();
      let match;

      while ((match = keyRegex.exec(content)) !== null) {
        keys.add(match[1]);
      }

      this.existingKeys.set(language, keys);
      this.log(`📋 ${keys.size} clé(s) existante(s) pour ${language}`, true);
      
      return this.parseExistingTranslations(content);
    } catch (error) {
      this.log(`Erreur lors du chargement ${language}: ${error.message}`, true);
      return {};
    }
  }

  // Parser simple pour extraire les traductions existantes
  parseExistingTranslations(content) {
    try {
      // Extraire l'objet d'export en utilisant une approche plus robuste
      const match = content.match(/export const \w+ = (\{[\s\S]*?\});[\s]*$/m);
      if (match) {
        const objectString = match[1];
        
        // Créer une fonction qui évalue l'objet de façon sécurisée
        const evalFunction = new Function('return ' + objectString);
        const result = evalFunction();
        
        this.log(`✅ Traductions existantes chargées`, true);
        return result;
      }
    } catch (error) {
      this.log(`⚠️  Erreur parsing: ${error.message}`, true);
    }
    
    return {};
  }

  // Utilitaire pour définir une valeur imbriquée
  setNestedValue(obj, path, value) {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
  }

  // Générer l'objet de traductions pour chaque langue
  generateTranslationsObjectForLanguage(keys, language) {
    // Charger les traductions existantes pour cette langue
    const existingTranslations = this.loadExistingTranslationsForLanguage(language);
    const translations = { ...existingTranslations };

    for (const key of keys) {
      const parts = key.split('.');
      let current = translations;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        if (i === parts.length - 1) {
          // C'est la dernière partie, assigner la valeur seulement si elle n'existe pas
          if (!current.hasOwnProperty(part)) {
            current[part] = key; // Valeur par défaut = clé (vous la modifierez ensuite)
            this.scanResults.keysAdded.push(`${language}: ${key}`);
          }
        } else {
          // Vérifier si la propriété existe et gérer les conflits de types
          if (!current.hasOwnProperty(part)) {
            current[part] = {};
          } else if (typeof current[part] === 'string') {
            // Conflit : la propriété existe comme string mais on a besoin d'un objet
            this.warning(`Conflit détecté pour la clé "${parts.slice(0, i + 1).join('.')}" en ${language}: existe comme string mais nécessite un objet pour "${key}"`);
            // Convertir la string existante en objet avec une propriété '_value'
            const existingValue = current[part];
            current[part] = {
              _value: existingValue
            };
          } else if (typeof current[part] !== 'object' || current[part] === null) {
            // Si ce n'est ni un string ni un objet, créer un nouvel objet
            current[part] = {};
          }
          current = current[part];
        }
      }
    }

    return translations;
  }

  // Écrire le fichier de traductions pour une langue
  writeTranslationsFileForLanguage(translations, language) {
    const langPath = path.join(this.config.localesPath, `${language}.ts`);
    
    // Créer le répertoire s'il n'existe pas
    if (!fs.existsSync(this.config.localesPath)) {
      fs.mkdirSync(this.config.localesPath, { recursive: true });
    }

    const languageNames = {
      fr: 'Traductions françaises',
      en: 'English translations',
      es: 'Traducciones en español'
    };

    const content = `// ${languageNames[language] || `${language.toUpperCase()} translations`}
export const ${language} = {
${this.formatTranslationsObject(translations, 1)}};`;

    fs.writeFileSync(langPath, content);
    this.success(`Fichier ${language}.ts mis à jour`);
  }

  // Formater l'objet en TypeScript
  formatTranslationsObject(obj, indent = 0) {
    const spaces = '  '.repeat(indent);
    let result = '';

    const entries = Object.entries(obj);
    if (this.config.sort) {
      entries.sort(([a], [b]) => a.localeCompare(b));
    }

    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      
      if (typeof value === 'object') {
        result += `${spaces}${key}: {\n`;
        result += this.formatTranslationsObject(value, indent + 1);
        result += `${spaces}}${i < entries.length - 1 ? ',' : ''}\n`;
      } else {
        result += `${spaces}${key}: "${value}"${i < entries.length - 1 ? ',' : ''}\n`;
      }
    }

    return result;
  }

  // Nettoyer les clés non utilisées
  cleanUnusedKeys() {
    for (const language of this.config.supportedLanguages) {
      const existingKeys = this.existingKeys.get(language) || new Set();
      const unusedKeys = [];
      
      for (const key of existingKeys) {
        if (!this.foundKeys.has(key)) {
          unusedKeys.push(key);
          this.scanResults.keysRemoved.push(`${language}: ${key}`);
        }
      }

      if (unusedKeys.length > 0) {
        this.log(`🧹 ${unusedKeys.length} clé(s) non utilisée(s) pour ${language}:`);
        unusedKeys.forEach(key => this.log(`   - ${key}`));
      }
    }
  }

  // Écrire le fichier index.ts principal
  writeMainIndexFile() {
    const indexPath = path.join(this.config.localesPath, 'index.ts');
    
    const imports = this.config.supportedLanguages
      .map(lang => `import { ${lang} } from './${lang}';`)
      .join('\n');

    const languageNames = {
      fr: 'Français',
      en: 'English', 
      es: 'Español'
    };

    const flags = {
      fr: '🇫🇷',
      en: '🇺🇸',
      es: '🇪🇸'
    };

    const supportedLanguagesObj = this.config.supportedLanguages
      .map(lang => `  ${lang}: { name: '${languageNames[lang] || lang}', flag: '${flags[lang] || '🏳️'}', translations: ${lang} }`)
      .join(',\n');

    const translationsObj = this.config.supportedLanguages
      .map(lang => `  ${lang}`)
      .join(',\n');

    const content = `${imports}

// Configuration des langues supportées
export const supportedLanguages = {
${supportedLanguagesObj},
} as const;

// Types dérivés
export type SupportedLanguage = keyof typeof supportedLanguages;
export type TranslationStructure = typeof ${this.config.supportedLanguages[0]};

// Export des traductions pour faciliter l'accès
export const translations = {
${translationsObj},
};

// Langue par défaut
export const DEFAULT_LANGUAGE: SupportedLanguage = '${this.config.supportedLanguages[0]}';`;

    fs.writeFileSync(indexPath, content);
    this.success(`Fichier locales/index.ts mis à jour`);
  }

  // Écrire le fichier de traductions
  writeTranslationsFile(translations) {
    const translationsPath = path.join(this.config.i18nPath, 'index.ts');
    
    // Créer le répertoire s'il n'existe pas
    if (!fs.existsSync(this.config.i18nPath)) {
      fs.mkdirSync(this.config.i18nPath, { recursive: true });
    }

    const content = `import type { TranslationKey, TranslationKeys } from './types';

export const translations = {
${this.formatTranslationsObject(translations, 1)}};

// Hook avec type-safety
export const useTranslation = () => {
  const t = (key: TranslationKey): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // En développement, afficher une erreur claire
        if (__DEV__) {
          console.error(\`❌ Translation key not found: "\${key}"\`);
          console.error(\`Available keys starting with "\${keys[0]}":, 
            Object.keys(translations).filter(k => k.startsWith(keys[0])));
        }
        return key; // Return the key if translation doesn't exist
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return { t };
};

// Fonction utilitaire pour vérifier si une clé existe
export const hasTranslation = (key: string): key is TranslationKey => {
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return false;
    }
  }
  
  return typeof value === 'string';
};

// Export des types
export type { TranslationKey, TranslationKeys };
`;

    fs.writeFileSync(translationsPath, content);
    this.success(`Fichier de traductions mis à jour: ${translationsPath}`);
  }

  // Générer les types TypeScript
  generateTypeDefinition(keys) {
    const sortedKeys = this.config.sort ? Array.from(keys).sort() : Array.from(keys);
    
    let typeDefinition = `// Types générés automatiquement - NE PAS MODIFIER MANUELLEMENT
// Généré le ${new Date().toLocaleString('fr-FR')}
export interface TranslationKeys {\n`;

    for (const key of sortedKeys) {
      typeDefinition += `  '${key}': string;\n`;
    }

    typeDefinition += `}\n\nexport type TranslationKey = keyof TranslationKeys;\n`;
    
    return typeDefinition;
  }

  // Écrire le fichier de types
  writeTypesFile(keys) {
    const typesPath = path.join(this.config.i18nPath, 'types.ts');
    const typeDefinition = this.generateTypeDefinition(keys);
    
    fs.writeFileSync(typesPath, typeDefinition);
    this.success(`Fichier de types mis à jour: ${typesPath}`);
  }

  // Générer le rapport
  generateReport() {
    this.log('\n📊 RAPPORT DE SCAN I18N');
    this.log('========================');
    
    this.log(`📁 Fichiers scannés: ${this.scanResults.filesScanned.length}`);
    this.log(`🔑 Clés trouvées: ${this.foundKeys.size}`);
    this.log(`🌍 Langues générées: ${this.config.supportedLanguages.join(', ')}`);
    this.log(`➕ Clés ajoutées: ${this.scanResults.keysAdded.length}`);
    this.log(`➖ Clés supprimées: ${this.scanResults.keysRemoved.length}`);
    this.log(`❌ Erreurs: ${this.scanResults.errors.length}`);

    if (this.config.verbose) {
      this.log('\n📄 DÉTAILS DES FICHIERS:');
      this.scanResults.filesScanned.forEach(({ file, keys }) => {
        this.log(`  ${file}:`);
        keys.forEach(key => this.log(`    - ${key}`));
      });
    }

    if (this.scanResults.keysAdded.length > 0) {
      this.log('\n➕ NOUVELLES CLÉS:');
      const keysByLanguage = {};
      this.scanResults.keysAdded.forEach(entry => {
        if (entry.includes(': ')) {
          const [lang, key] = entry.split(': ');
          if (!keysByLanguage[lang]) keysByLanguage[lang] = [];
          keysByLanguage[lang].push(key);
        }
      });
      
      Object.entries(keysByLanguage).forEach(([lang, keys]) => {
        this.log(`  ${lang}: ${keys.length} nouvelle(s) clé(s)`);
        if (this.config.verbose) {
          keys.forEach(key => this.log(`    - ${key}`));
        }
      });
    }

    if (this.scanResults.keysRemoved.length > 0 && this.config.clean) {
      this.log('\n➖ CLÉS SUPPRIMÉES:');
      this.scanResults.keysRemoved.forEach(entry => this.log(`  - ${entry}`));
    }

    if (this.scanResults.errors.length > 0) {
      this.log('\n❌ ERREURS:');
      this.scanResults.errors.forEach(error => this.log(`  - ${error}`));
    }

    this.log('\n💡 PROCHAINES ÉTAPES:');
    this.log('1. Éditez les fichiers dans shared/i18n/locales/ pour ajouter vos traductions');
    this.log('2. Remplacez les clés par les vraies traductions (ex: "auth.login.email" → "E-mail")');
    this.log('3. Testez votre application avec les nouvelles traductions');

    this.log('\n✨ Scan terminé!');
  }

  // Méthode principale
  async run() {
    try {
      this.log('🌍 Démarrage du scan i18n multi-langues...\n');
      
      // Scanner les fichiers
      const foundKeys = await this.scanFiles();
      
      // Générer les traductions pour chaque langue
      for (const language of this.config.supportedLanguages) {
        this.log(`\n🔄 Traitement de la langue: ${language}`, true);
        const translations = this.generateTranslationsObjectForLanguage(foundKeys, language);
        this.writeTranslationsFileForLanguage(translations, language);
      }
      
      // Écrire le fichier index des locales
      this.writeMainIndexFile();
      
      // Écrire le fichier de types
      this.writeTypesFile(foundKeys);
      
      // Nettoyer si demandé
      if (this.config.clean) {
        this.cleanUnusedKeys();
      }
      
      // Générer le rapport
      this.generateReport();
      
    } catch (error) {
      this.error(`Erreur fatale: ${error.message}`);
      process.exit(1);
    }
  }
}

// Interface CLI
function parseArgs() {
  const args = process.argv.slice(2);
  const config = { ...DEFAULT_CONFIG };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--verbose':
      case '-v':
        config.verbose = true;
        break;
      case '--sort':
      case '-s':
        config.sort = true;
        break;
      case '--clean':
      case '-c':
        config.clean = true;
        break;
      case '--watch':
      case '-w':
        config.watch = true;
        break;
      case '--src':
        config.srcDir = args[++i];
        break;
      case '--i18n':
        config.i18nPath = args[++i];
        break;
      case '--help':
      case '-h':
        console.log(`
Usage: npm run parse [options]

Options:
  -v, --verbose     Mode verbeux (afficher plus de détails)
  -s, --sort        Trier les clés par ordre alphabétique
  -c, --clean       Supprimer les clés non utilisées
  -w, --watch       Mode watch (scan continu)
  --src <dir>       Répertoire source (défaut: ./app)
  --i18n <dir>      Répertoire i18n (défaut: ./shared/i18n)
  -h, --help        Afficher cette aide

Exemples:
  npm run parse                    # Scan basique
  npm run parse -- --verbose      # Scan avec détails
  npm run parse -- --sort --clean # Trier et nettoyer
        `);
        process.exit(0);
    }
  }
  
  return config;
}

// Point d'entrée
if (require.main === module) {
  const config = parseArgs();
  const parser = new I18nParser(config);
  
  if (config.watch) {
    console.log('🔄 Mode watch activé - scan continu...');
    // Implémentation du watch pourrait être ajoutée ici
    parser.run();
  } else {
    parser.run();
  }
}

module.exports = I18nParser;