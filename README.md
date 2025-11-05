# Suivi Performance - Application PWA

Application Progressive Web App (PWA) moderne pour suivre vos entraînements sportifs.

## Fonctionnalités

### Types d'entraînements supportés
- **Musculation** : Suivi des exercices, séries, poids et volume total
- **Course à pied / Trail** : Distance, temps, dénivelé, allure
- **CrossFit** : WOD, scores et performances
- **Hyrox** : Sessions complètes, simulations et entraînements spécifiques

### Caractéristiques principales
- Interface moderne et épurée
- Design responsive optimisé pour mobile (6,1" à 6,7")
- Mode hors-ligne complet (PWA)
- Stockage local avec IndexedDB
- Graphiques de progression
- Export des données JSON
- Installation possible comme application mobile

## Installation

### Option 1 : Serveur local simple
```bash
# Avec Python 3
python3 -m http.server 8000

# Ou avec PHP
php -S localhost:8000

# Ou avec Node.js (npx http-server)
npx http-server -p 8000
```

Puis ouvrez `http://localhost:8000` dans votre navigateur.

### Option 2 : Installation PWA
1. Ouvrez l'application dans votre navigateur mobile
2. Cliquez sur "Ajouter à l'écran d'accueil" ou "Installer l'application"
3. L'application sera installée comme une app native

## Utilisation

### Ajouter un entraînement
1. Cliquez sur le bouton "Nouvel entraînement"
2. Sélectionnez le type d'entraînement
3. Remplissez les informations (les champs s'adaptent au type choisi)
4. Enregistrez

### Consulter les statistiques
- Accédez à l'onglet "Statistiques"
- Filtrez par sport et période
- Visualisez votre progression

### Exporter vos données
- Allez dans "Profil"
- Cliquez sur "Exporter les données"
- Téléchargez le fichier JSON

## Structure du projet

```
suivi-perf/
├── index.html              # Page principale
├── styles.css              # Styles (design moderne dark mode)
├── app.js                  # Logique application
├── manifest.json           # Configuration PWA
├── sw.js                   # Service Worker (mode offline)
├── icons/                  # Icônes PWA
│   ├── icon.svg           # Icône vectorielle
│   └── icon-*.png         # Icônes générées
├── screenshots/            # Screenshots pour stores
└── README.md              # Ce fichier
```

## Technologies utilisées

- **HTML5** : Structure sémantique
- **CSS3** : Design moderne avec variables CSS, Flexbox, Grid
- **JavaScript ES6+** : Programmation moderne
- **IndexedDB** : Base de données locale
- **Chart.js** : Graphiques interactifs
- **Service Worker** : Fonctionnement offline
- **Web App Manifest** : Installation PWA

## Design

### Palette de couleurs
- **Primary** : #6366f1 (Indigo)
- **Secondary** : #10b981 (Vert)
- **Background** : #0f172a (Bleu nuit)
- **Text** : #f8fafc (Blanc cassé)

### Typographie
- Système de police native (-apple-system, BlinkMacSystemFont, Segoe UI)
- Tailles adaptatives
- Hiérarchie claire

### Responsive
- Mobile-first design
- Breakpoints: 768px (tablette), 1024px (desktop)
- Support des écrans avec notch (safe-area)
- Optimisé pour écrans 6,1" à 6,7" (standard smartphone)

## Améliorer les icônes

Les icônes actuelles sont des placeholders. Pour créer de vraies icônes :

### Option 1 : Outils en ligne
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)

### Option 2 : Avec Python (Pillow)
```bash
pip install Pillow
python3 generate_icons.py
```

### Option 3 : Avec ImageMagick
```bash
# Installer ImageMagick
# Puis exécuter pour chaque taille
convert icons/icon.svg -resize 192x192 icons/icon-192.png
```

## Déploiement

### GitHub Pages
```bash
git add .
git commit -m "PWA App"
git push origin main
```
Activez GitHub Pages dans les paramètres du repository.

### Netlify / Vercel
1. Connectez votre repository
2. Déployez (aucune configuration nécessaire)

### Serveur web classique
1. Uploadez tous les fichiers
2. Assurez-vous que le HTTPS est activé (requis pour PWA)
3. Configurez le type MIME pour le manifest :
   ```
   AddType application/manifest+json .json
   ```

## Fonctionnalités à venir

- [ ] Synchronisation cloud (Firebase, Supabase)
- [ ] Partage d'entraînements
- [ ] Plans d'entraînement personnalisés
- [ ] Rappels et notifications
- [ ] Mode coach avec élèves
- [ ] Import de données depuis d'autres apps
- [ ] Analyse IA des performances
- [ ] Mode collaboratif / équipes

## Licence

MIT License - Libre d'utilisation et modification

## Support

Pour toute question ou suggestion, créez une issue sur GitHub.

---

**Développé avec** ❤️ **pour les athlètes**
