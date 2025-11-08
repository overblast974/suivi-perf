# Déploiement sur GitHub Pages

L'application est configurée pour se déployer automatiquement sur GitHub Pages.

## 🚀 Activation

Pour activer GitHub Pages, suivez ces étapes **une seule fois** :

### Option 1 : Via l'interface GitHub (RECOMMANDÉ)

1. Allez sur **https://github.com/overblast974/suivi-perf**
2. Cliquez sur **Settings** (Paramètres)
3. Dans le menu latéral, cliquez sur **Pages**
4. Sous "Build and deployment" :
   - **Source** : Sélectionnez "GitHub Actions"
5. Cliquez sur **Save**

### Option 2 : Automatique

Le workflow GitHub Actions est déjà configuré. Dès que vous activerez Pages dans les paramètres, le déploiement se fera automatiquement à chaque push.

## 📍 URL de l'application

Une fois déployée, votre application sera accessible sur :

**https://overblast974.github.io/suivi-perf/**

## 🔄 Mise à jour

L'application se met à jour automatiquement à chaque fois que vous :
- Poussez des changements sur la branche `claude/create-pwa-app-011CUpVWxAL7ZEvcD2WUnZMb`
- Ou sur la branche `main`

Le déploiement prend environ 1-2 minutes.

## 🛠️ Workflow GitHub Actions

Le fichier `.github/workflows/deploy.yml` contient la configuration du déploiement automatique.

## ✅ Vérifier le déploiement

1. Allez sur l'onglet **Actions** de votre repository
2. Vous verrez les workflows de déploiement
3. Cliquez sur le dernier pour voir les détails
4. Une fois terminé avec succès ✅, votre site est en ligne !

## 📱 Installation PWA

Une fois sur GitHub Pages, vous pourrez :
- Installer l'application sur votre mobile
- L'utiliser hors ligne
- La partager avec d'autres personnes

## 🔧 Dépannage

Si le déploiement échoue :
1. Vérifiez l'onglet **Actions** pour voir l'erreur
2. Assurez-vous que Pages est activé dans Settings
3. Vérifiez que les permissions sont correctes (Settings > Actions > General > Workflow permissions)

## 📝 Note importante

Le fichier `.nojekyll` à la racine empêche GitHub de traiter le site comme un site Jekyll,
ce qui est nécessaire pour que l'application fonctionne correctement.
