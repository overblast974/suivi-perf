# Comment tester l'application

## ✅ Le serveur est démarré !

L'application est accessible sur : **http://localhost:8000**

---

## 🖥️ Sur votre ordinateur

1. Ouvrez votre navigateur (Chrome, Firefox, Safari, Edge)
2. Allez sur : **http://localhost:8000**
3. L'application devrait s'afficher immédiatement

---

## 📱 Sur votre téléphone (même réseau WiFi)

### Étape 1 : Trouvez votre adresse IP

**Sur Windows :**
```bash
ipconfig
```
Cherchez "Adresse IPv4" (ex: 192.168.1.45)

**Sur Mac/Linux :**
```bash
ifconfig | grep inet
# ou
ip addr show
```
Cherchez une adresse comme 192.168.x.x

### Étape 2 : Accédez depuis votre téléphone

1. Connectez votre téléphone au **même réseau WiFi**
2. Ouvrez le navigateur de votre téléphone
3. Tapez : **http://VOTRE_IP:8000**
   - Exemple : http://192.168.1.45:8000

### Étape 3 : Installez l'application (PWA)

Sur mobile, le navigateur proposera d'installer l'app :
- **Chrome Android** : Menu > "Ajouter à l'écran d'accueil"
- **Safari iOS** : Bouton partage > "Sur l'écran d'accueil"

---

## 🚀 Démarrage rapide

Pour redémarrer le serveur plus tard :

```bash
cd /home/user/suivi-perf
./start.sh
```

Ou manuellement :
```bash
python3 -m http.server 8000
```

---

## 🛠️ En cas de problème

### Le port 8000 est déjà utilisé ?
```bash
# Utilisez un autre port
python3 -m http.server 8080
```

### Vous voyez une page blanche ?
1. Ouvrez la console du navigateur (F12)
2. Regardez l'onglet "Console" pour les erreurs
3. Vérifiez que vous êtes bien sur http://localhost:8000

### Le serveur ne démarre pas ?
```bash
# Vérifiez que Python est installé
python3 --version

# Alternative avec Node.js
npx http-server -p 8000
```

---

## 📖 Utilisation de l'application

Une fois l'application ouverte :

1. **Tableau de bord** : Voir vos stats mensuelles
2. **Cliquez sur "Nouvel entraînement"** pour ajouter une séance
3. **Sélectionnez le type** : Musculation, Course, CrossFit ou Hyrox
4. **Remplissez les champs** (ils s'adaptent au type choisi)
5. **Enregistrez** et voyez vos données s'afficher !

Les données sont stockées **localement** dans votre navigateur (pas besoin d'internet après la première visite).

---

**Besoin d'aide ?** Vérifiez la console du navigateur ou consultez le README.md
