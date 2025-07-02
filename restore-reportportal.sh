#!/bin/bash
# Script de restauration ReportPortal - Version améliorée
# Compatible : Linux, macOS, Windows (Git Bash/WSL)

echo "-----------------------------------------------"
echo "  RESTAURATION REPORTPORTAL - VERSION AMELIOREE"
echo "-----------------------------------------------"
echo

# Fonction pour détecter l'OS
detect_os() {
    case "$(uname -s)" in
        Linux*)     OS="Linux";;
        Darwin*)    OS="macOS";;
        CYGWIN*|MINGW*|MSYS*) OS="Windows";;
        *)          OS="Unknown";;
    esac
    echo "Système détecté : $OS"
}

# Fonction pour vérifier Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "ERREUR: Docker n'est pas installé"
        case $OS in
            "Linux")
                echo "Installez Docker : https://docs.docker.com/engine/install/"
                ;;
            "macOS")
                echo "Installez Docker Desktop : https://docs.docker.com/desktop/mac/"
                ;;
            "Windows")
                echo "Installez Docker Desktop : https://docs.docker.com/desktop/windows/"
                ;;
        esac
        exit 1
    fi
}

# Fonction pour vérifier docker-compose
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo "ERREUR: docker-compose n'est pas installé"
        echo "Installez docker-compose ou utilisez Docker Desktop"
        exit 1
    fi
    
    # Détecter la commande à utiliser
    if command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE="docker-compose"
    else
        DOCKER_COMPOSE="docker compose"
    fi
}

# Fonction pour obtenir le chemin de sauvegarde selon l'OS
get_backup_path() {
    case $OS in
        "Windows")
            # Pour Git Bash/MSYS2 sur Windows
            if [[ -n "$MSYSTEM" ]]; then
                BACKUP_DIR="$(cygpath -w "$(pwd)")\\reportportal-backup"
            else
                BACKUP_DIR="$(pwd)/reportportal-backup"
            fi
            ;;
        *)
            BACKUP_DIR="$(pwd)/reportportal-backup"
            ;;
    esac
}

# Fonction pour nettoyer les volumes existants
cleanup_volumes() {
    echo "Nettoyage des volumes existants..."
    
    # Récupérer le nom du projet Docker Compose
    PROJECT_NAME=$(basename "$(pwd)" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]//g')
    
    # Lister tous les volumes potentiels
    VOLUMES_TO_REMOVE=(
        "reportportal_postgres"
        "reportportal_storage" 
        "reportportal_opensearch"
        "${PROJECT_NAME}_reportportal_postgres"
        "${PROJECT_NAME}_reportportal_storage"
        "${PROJECT_NAME}_reportportal_opensearch"
    )
    
    for volume in "${VOLUMES_TO_REMOVE[@]}"; do
        if docker volume ls -q | grep -q "^${volume}$"; then
            echo "Suppression du volume: $volume"
            docker volume rm "$volume" 2>/dev/null || true
        fi
    done
    
    echo "Nettoyage terminé"
}

main() {
    # Étape 1 : Détection de l'OS
    detect_os
    echo

    # Étape 2 : Vérifications
    echo "[1/8] Vérification de Docker..."
    check_docker
    echo "Docker... OK"
    
    echo "[2/8] Vérification de docker-compose..."
    check_docker_compose
    echo "Docker-compose... OK ($DOCKER_COMPOSE)"
    echo

    # Étape 3 : Vérification du dossier de sauvegarde
    echo "[3/8] Vérification du dossier de sauvegarde..."
    if [ ! -d "reportportal-backup" ]; then
        echo "ERREUR: Dossier reportportal-backup introuvable"
        echo "Assurez-vous que les fichiers de sauvegarde sont présents"
        exit 1
    fi
    echo "Dossier de sauvegarde... OK"

    # Étape 4 : Vérification des fichiers de sauvegarde
    echo "[4/8] Vérification des fichiers de sauvegarde..."
    files=("postgres.tar.gz" "storage.tar.gz" "opensearch.tar.gz")
    for file in "${files[@]}"; do
        if [ ! -f "reportportal-backup/$file" ]; then
            echo "ERREUR: Fichier reportportal-backup/$file introuvable"
            exit 1
        fi
        # Afficher la taille du fichier
        size=$(ls -lh "reportportal-backup/$file" | awk '{print $5}')
        echo "✓ $file ($size)"
    done
    echo "Fichiers de sauvegarde... OK"
    echo

    # Étape 5 : Arrêt de ReportPortal
    echo "[5/8] Arrêt de ReportPortal (si en cours)..."
    $DOCKER_COMPOSE down -v 2>/dev/null || true
    echo "ReportPortal arrêté... OK"
    echo

    # Étape 6 : Nettoyage complet des volumes
    echo "[6/8] Nettoyage des volumes existants..."
    cleanup_volumes
    echo "Volumes nettoyés... OK"
    echo

    # Étape 7 : Création des volumes avec les bons noms
    echo "[7/8] Création des nouveaux volumes..."
    docker volume create reportportal_postgres
    docker volume create reportportal_storage
    docker volume create reportportal_opensearch
    echo "Volumes créés... OK"
    echo

    # Étape 8 : Restauration des données
    echo "[8/8] Restauration des données..."
    get_backup_path
    
    echo "Restauration de la base de données PostgreSQL..."
    docker run --rm -v reportportal_postgres:/data -v "$BACKUP_DIR":/backup alpine sh -c "cd /data && tar xzf /backup/postgres.tar.gz"
    if [ $? -ne 0 ]; then
        echo "ERREUR lors de la restauration PostgreSQL"
        exit 1
    fi
    echo "✓ PostgreSQL restauré"

    echo "Restauration du stockage (projets, dashboards)..."
    docker run --rm -v reportportal_storage:/data -v "$BACKUP_DIR":/backup alpine sh -c "cd /data && tar xzf /backup/storage.tar.gz"
    if [ $? -ne 0 ]; then
        echo "ERREUR lors de la restauration du stockage"
        exit 1
    fi
    echo "✓ Stockage restauré"

    echo "Restauration des index OpenSearch..."
    docker run --rm -v reportportal_opensearch:/data -v "$BACKUP_DIR":/backup alpine sh -c "cd /data && tar xzf /backup/opensearch.tar.gz"
    if [ $? -ne 0 ]; then
        echo "ERREUR lors de la restauration OpenSearch"
        exit 1
    fi
    echo "✓ OpenSearch restauré"
    echo

    # Démarrage de ReportPortal
    echo "Démarrage de ReportPortal..."
    $DOCKER_COMPOSE --profile core up -d
    if [ $? -ne 0 ]; then
        echo "ERREUR lors du démarrage de ReportPortal"
        exit 1
    fi
    echo "ReportPortal démarré... OK"
    echo

    # Vérification des volumes
    echo "Vérification des volumes créés :"
    docker volume ls | grep reportportal
    echo

    # Message final
    echo "---------------------------------------------"
    echo "        RESTAURATION TERMINÉE !"
    echo "---------------------------------------------"
    echo
    echo "ReportPortal est maintenant accessible sur :"
    echo "http://localhost:8080"
    echo
    echo "Connexion par défaut :"
    echo "Username: superadmin"
    echo "Password: erebus"
    echo
    echo "Attendez 3-5 minutes que tous les services démarrent complètement."
    echo
    echo "Pour voir les logs :"
    echo "$DOCKER_COMPOSE logs -f"
    echo
    echo "Pour vérifier l'état des services :"
    echo "$DOCKER_COMPOSE ps"
    echo
}

# Lancer le script principal
main "$@"