# 📘 Guide Utilisateur - Don Bosco Connect v1.1.0

## 🎯 Introduction

Don Bosco Connect est une plateforme éducative intelligente propulsée par l'IA (Ollama). Elle offre une expérience d'apprentissage adaptatif multilingue (FR/EN/AR).

---

## 🔐 Connexion et Rôles

### Accès à la plateforme
- **Web** : http://localhost:3000 (ou votre domaine déployé)
- **Mobile** : Application React Native (via Expo Go ou build natif)

### Comptes de démonstration
| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@donbosco-connect.tn | admin123 |
| Professeur | prof@donbosco-connect.tn | prof123 |
| Élève | eleve@donbosco-connect.tn | eleve123 |
| Parent | parent@donbosco-connect.tn | parent123 |

---

## 👨‍💼 Interface Admin

### Fonctionnalités principales
1. **Gestion des utilisateurs**
   - Créer/modifier/supprimer des comptes
   - Assigner les rôles (Admin/Prof/Élève/Parent)
   - Lier les élèves à leurs parents

2. **Gestion des cours**
   - Créer des cours avec modules et leçons
   - Uploader des ressources (PDF, vidéos)
   - Définir les prérequis

3. **Statistiques**
   - Tableau de bord avec graphiques
   - Suivi des performances par classe
   - Rapports d'activité

4. **Configuration IA**
   - Choisir le modèle Ollama (qwen2.5:3b recommandé)
   - Ajuster la formule d'adaptive learning
   - Voir les logs de l'IA

---

## 👨‍🏫 Interface Professeur

### Tableau de bord
- Vue d'ensemble de vos cours
- Élèves inscrits et leur progression
- Quiz et devoirs à corriger

### Créer un cours
1. Allez dans "Mes Cours" → "Nouveau Cours"
2. Remplissez : Titre, Description, Niveau
3. Ajoutez des modules et leçons
4. Publiez quand c'est prêt

### Créer un quiz
1. Sélectionnez un cours → "Quiz"
2. Ajoutez des questions (QCM, Vrai/Faux, Texte libre)
3. Définissez le score de passage (par défaut 70%)
4. Le système ajuste automatiquement la difficulté selon les résultats

### Suivi des élèves
- **Progression** : Voir la courbe d'apprentissage
- **Niveau IA** : Calculé automatiquement : `Niveau = (Score_Quiz × 0.6) + (Vitesse_Réponse × 0.4)`
- **Alertes** : Élèves en difficulté mis en évidence

---

## 👨‍🎓 Interface Élève

### Tableau de bord
- Cours disponibles et inscriptions
- Progression personnelle
- Score IA actuel (niveau adaptatif)

### Apprentissage adaptatif
1. **Quiz intelligent** : Le système ajuste la difficulté en temps réel
2. **Mentor IA** : Posez des questions sur le cours
3. **Parcours personnalisé** : Basé sur vos performances

### Utiliser le Mentor IA
1. Allez dans "IA Mentor" (icône 🤖)
2. Posez une question sur le cours actuel
3. L'IA vous répond instantanément via Ollama
4. Les réponses sont sauvegardées pour suivi

### Soumettre un devoir
1. Allez dans "Devoirs" → Sélectionnez le devoir
2. Uploader votre fichier (PDF, DOC, ZIP)
3. Ajoutez un commentaire si nécessaire
4. Soumettez avant la date limite

---

## 👪 Interface Parent

### Suivi des enfants
- Liste de vos enfants inscrits
- Progression par cours
- Scores IA et moyennes

### Alertes et notifications
- Retards et absences
- Notes importantes
- Messages des professeurs

### Communication
- Messagerie avec les profs
- Calendrier des devoirs à venir
- Rapports mensuels automatiques

---

## 🌍 Multilingue

### Changer de langue
1. Cliquez sur l'icône 🌐 en haut à droite
2. Choisissez : Français | English | العربية
3. L'interface change instantanément
4. L'arabe (RTL) est supporté nativement

---

## 📱 Version Mobile

### Installation
- **Android/iOS** : Scannez le QR code avec l'app Expo Go
- **Build natif** : Utilisez `npm run build` dans le dossier `mobile/`

### Fonctionnalités mobiles
- Toutes les fonctionnalités web disponibles
- Notifications push (à venir)
- Mode hors-ligne limité (caching)

---

## ❓ Support et Dépannage

### Problèmes courants

**Je ne peux pas me connecter**
- Vérifiez votre email et mot de passe
- Utilisez "Mot de passe oublié" si besoin
- Contactez l'admin si le compte est bloqué

**L'IA ne répond pas**
- Vérifiez qu'Ollama est lancé : `curl http://localhost:11434/api/tags`
- Le modèle doit être téléchargé : `ollama pull qwen2.5:3b`
- Vérifiez les logs : `docker-compose logs backend`

**Les quiz ne s'affichent pas**
- Rafraîchissez la page (F5)
- Videz le cache du navigateur
- Vérifiez votre connexion internet

**La page est vide / blanche**
- JavaScript doit être activé
- Essayez un autre navigateur (Chrome, Firefox recommandés)
- Vérifiez la console (F12) pour les erreurs

### Contacter le support
- **Email** : support@donbosco-connect.tn
- **GitHub Issues** : https://github.com/HiTechTN/don-bosco-connect/issues
- **Documentation** : https://github.com/HiTechTN/don-bosco-connect/wiki

---

## 📊 Glossaire

| Terme | Définition |
|-------|-------------|
| Score IA | Niveau calculé par la formule adaptative |
| Quiz adaptatif | Questions dont la difficulté change selon vos réponses |
| Ollama | Moteur d'IA locale (LLM) |
| Mentor IA | Assistant virtuel pour répondre aux questions |
| Niveau | Débutant (1-3) / Intermédiaire (4-7) / Avancé (8-10) |

---

**Version** : 1.1.0  
**Dernière mise à jour** : Mai 2026  
**Licence** : MIT  
**Auteur** : HiTech TN