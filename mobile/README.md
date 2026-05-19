# Don Bosco Connect — Mobile

<p align="center">
  <img src="https://img.shields.io/badge/Expo-51-000020?style=flat-square&logo=expo&logoColor=white" alt="Expo"/>
  <img src="https://img.shields.io/badge/React_Native-0.76-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React Native"/>
  <img src="https://img.shields.io/badge/iOS-Android-c96442?style=flat-square" alt="iOS + Android"/>
</p>

Application mobile de **Don Bosco Connect** — développée avec React Native / Expo.

## 🚀 Démarrer

```bash
npm install
npx expo start
```

Scannez le QR code avec **Expo Go** (Android/iOS) ou ouvrez dans un émulateur.

## 📱 Fonctionnalités

- Dashboard élève, enseignant, parent, admin
- Notifications push temps réel
- Mentor IA (chat RAG)
- Quiz adaptatif
- Gamification (XP, badges, streaks)
- Messagerie chiffrée
- Mode hors-ligne
- Biométrie (empreinte / Face ID)
- Support RTL (Arabe)

## 🏗️ Structure

```
src/
├── screens/       # 22 écrans (auth, dashboard, courses, etc.)
├── components/    # UI réutilisable
├── navigation/    # React Navigation (stack + tabs)
├── services/      # API client, WebSocket, push
├── hooks/         # Custom hooks
└── i18n/          # FR / EN / AR
```

## 📦 Build natif

```bash
# Android APK
eas build -p android --profile production

# iOS IPA (macOS requis)
eas build -p ios --profile production
```

## 🔗 Liens

- [README principal](../README.md)
- [Guide utilisateur](../USER_GUIDE.md)
- [Démo](https://hitechtn.github.io/don-bosco-connect)
