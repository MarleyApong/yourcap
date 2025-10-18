# Guide d'Import/Export des Dettes - YourCap

## 📋 Vue d'ensemble

Le système d'import/export de YourCap vous permet de :
- **Exporter** vos dettes actuelles au format CSV
- **Importer** des dettes depuis un fichier CSV
- **Sauvegarder** et **restaurer** vos données facilement

## 📤 Exportation

### Comment exporter vos dettes :

1. Allez dans **Paramètres** → **Gestion des Données**
2. Cliquez sur **"Exporter mes dettes"**
3. Le fichier CSV sera généré et partagé via l'application de partage de votre appareil
4. Vous pouvez sauvegarder le fichier ou l'envoyer par email

### Format du fichier exporté :
```csv
contact_name,contact_phone,contact_email,amount,currency,description,loan_date,due_date,repayment_date,status,debt_type
John Doe,+237123456789,john@example.com,50000,XAF,Prêt business,2024-01-15,2024-02-15,,PENDING,OWING
Jane Smith,+237987654321,,25000,XAF,Prêt personnel,2024-01-10,2024-01-25,2024-01-24,PAID,OWED
```

## 📥 Importation

### Prérequis :
- Fichier au format CSV
- Structure de données respectée
- Encodage UTF-8

### Comment importer des dettes :

1. **Préparer votre fichier CSV** :
   - Première ligne = en-têtes des colonnes
   - Lignes suivantes = données de vos dettes
   - Respecter le format de date YYYY-MM-DD

2. **Dans l'application** :
   - Allez dans **Paramètres** → **Gestion des Données**
   - Cliquez sur **"Structure"** pour voir la documentation complète
   - Cliquez sur **"Template"** pour télécharger un exemple
   - Cliquez sur **"Importer des dettes"**
   - Collez le contenu de votre fichier CSV

3. **Validation** :
   - L'application vérifie automatiquement vos données
   - Les erreurs sont signalées avant l'import
   - Vous pouvez choisir d'importer seulement les lignes valides

## 📊 Structure des Données

### Champs Obligatoires :
| Champ | Type | Description | Exemple |
|-------|------|-------------|---------|
| `contact_name` | Texte | Nom du contact | "John Doe" |
| `contact_phone` | Texte | Numéro de téléphone | "+237123456789" |
| `amount` | Nombre | Montant (sans virgules) | 50000 |
| `currency` | Texte | Code devise | "XAF" |
| `loan_date` | Date | Date du prêt (YYYY-MM-DD) | "2024-01-15" |
| `due_date` | Date | Date d'échéance (YYYY-MM-DD) | "2024-02-15" |
| `status` | Texte | Statut de la dette | "PENDING" |
| `debt_type` | Texte | Type de dette | "OWING" |

### Champs Optionnels :
| Champ | Type | Description | Exemple |
|-------|------|-------------|---------|
| `contact_email` | Email | Email du contact | "john@example.com" |
| `description` | Texte | Description du prêt | "Prêt pour business" |
| `repayment_date` | Date | Date de remboursement (YYYY-MM-DD) | "2024-02-10" |

### Valeurs Valides :

**Status (statut)** :
- `PENDING` : En attente de paiement
- `PAID` : Payé/Remboursé  
- `OVERDUE` : En retard

**Debt Type (type de dette)** :
- `OWING` : Quelqu'un vous doit de l'argent
- `OWED` : Vous devez de l'argent à quelqu'un

## 💡 Exemples Pratiques

### Exemple 1 : Import Simple
```csv
contact_name,contact_phone,amount,currency,loan_date,due_date,status,debt_type
Marie Dubois,+237698765432,75000,XAF,2024-01-20,2024-02-20,PENDING,OWING
Paul Martin,+237677889900,30000,XAF,2024-01-18,2024-01-28,OVERDUE,OWED
```

### Exemple 2 : Import Complet
```csv
contact_name,contact_phone,contact_email,amount,currency,description,loan_date,due_date,repayment_date,status,debt_type
Alice Johnson,+237123456789,alice@example.com,100000,XAF,Investissement startup,2024-01-01,2024-03-01,,PENDING,OWING
Bob Wilson,+237987654321,bob@example.com,45000,XAF,Prêt voiture,2024-01-10,2024-01-31,2024-01-30,PAID,OWED
```

## ⚠️ Points Importants

### Formatage :
- **Dates** : Format YYYY-MM-DD obligatoire
- **Montants** : Nombres sans virgules (50000 pas 50,000)
- **Téléphones** : Format international recommandé (+237...)
- **Texte avec virgules** : Entourez de guillemets ("Texte, avec virgule")

### Validation :
- Tous les champs obligatoires doivent être remplis
- Les dates doivent être valides
- Les statuts et types de dette doivent correspondre aux valeurs autorisées
- Les montants doivent être supérieurs à 0

### Sécurité :
- Vos données restent sur votre appareil
- L'import/export se fait localement
- Aucune donnée n'est envoyée vers des serveurs externes

## 🔧 Dépannage

### Problèmes courants :

**"Format CSV invalide"** :
- Vérifiez que la première ligne contient les en-têtes
- Assurez-vous que le séparateur est une virgule

**"Champs obligatoires manquants"** :
- Vérifiez que tous les champs obligatoires sont présents
- Contrôlez l'orthographe des noms de colonnes

**"Format de date invalide"** :
- Utilisez le format YYYY-MM-DD
- Exemple correct : 2024-01-15

**"Aucune donnée trouvée"** :
- Vérifiez qu'il y a des lignes après les en-têtes
- Contrôlez que les données ne sont pas vides

### Conseils :
- Commencez par télécharger le template
- Testez avec quelques lignes d'abord
- Gardez une sauvegarde de vos données originales
- Utilisez la fonction "Structure" pour voir tous les détails

---

*Guide mis à jour le 18 octobre 2025*