
# ReportPortal - Guide de Restauration
# Étape 1 : Préparation du script :
 --- Rendre le script exécutable : 
chmod +x restore-reportportal.sh

# Étape 2 : Lancement de la restauration
 --- Exécuter le script de restauration
./restore-reportportal.sh

# Étape 3 : Processus automatique
Le script va automatiquement :

✅ Détecter votre système d'exploitation
✅ Vérifier la présence de Docker et Docker Compose
✅ Valider les fichiers de sauvegarde
✅ Arrêter les services ReportPortal existants
✅ Nettoyer les volumes existants
✅ Créer de nouveaux volumes propres
✅ Restaurer les données (PostgreSQL, Storage, OpenSearch)
✅ Construire et tester les images Docker
✅ Démarrer ReportPortal

# Étape 4 : Attente et vérification
- Patientez 5 minutes après le démarrage pour que tous les services s'initialisent complètement.

# Accès à ReportPortal
Une fois la restauration terminée, ReportPortal sera accessible à l'adresse :
- URL : http://localhost:8080
- Identifiants par défaut :

Nom d'utilisateur : superadmin
Mot de passe : erebus

#  Exécution des Tests
 --- Lancer tous les tests
Pour exécuter l'ensemble des tests configurés dans le projet :
docker-compose --profile core --profile test up test

⚠️ Attention : Cette commande va ajouter de nouveaux tests aux tests existants dans le dashboard, ce qui peut créer des doublons ou une confusion dans l'analyse des résultats.

🔄 Méthode recommandée : Tests en mode vérification
 -- Pour éviter d'ajouter des tests supplémentaires au dashboard existant, suivez cette procédure :
# Étape 1 : Arrêter les services ReportPortal
- Arrêter les services API, Job et UI de ReportPortal
- Exécuter les tests sans envoi vers ReportPortal :
docker-compose --profile core --profile test up test
- Les résultats des tests sont automatiquement enregistrés dans les fichiers logs. 
