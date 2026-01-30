# Dakar Events Pro - Nouvelle Génération

Cette application est une version modernisée et modulaire de DakarLive, optimisée pour la performance et le design premium.

## 🚀 Fonctionnalités
- **Architecture Modulaire** : Logique séparée (Data, UI, Map).
- **Design Système** : Thème sombre (Dark Mode) avec Glassmorphism et typographie Outfit.
- **Filtrage Dynamique** : Système de "Pills" interactives pour les genres et quartiers.
- **Cartographie Avancée** : Intégration Leaflet avec Dark Tiles (CartoDB).
- **Navigation GPS** : Calcul d'itinéraire intégré.

## 🛠️ Configuration des Types
Pour modifier les genres ou quartiers, éditez simplement les constantes au début du fichier `app.js` :

```javascript
const genres = [
    { id: 'mbalax', label: 'Mbalax', color: '#FF8C00' },
    // Ajoutez vos types ici...
];
```

## 📦 Structure
- `index.html` : Structure sémantique.
- `style.css` : Design système et animations.
- `app.js` : Logique applicative.
