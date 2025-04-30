const testInfo = {
    "Suppression d'un projet": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des projets.\n3. Clic sur le bouton de suppression\n4. Confirmation de la suppression\n5. Vérification que le projet a été supprimé du tableau",
      expectedResult: "Le projet doit être supprimé de la liste des projets"
    },
    "Création d'un projet": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des projets\n3. Clic sur le bouton 'Ajouter un projet'\n4. Remplissage du formulaire avec les informations du projet\n5. Soumission du formulaire",
      expectedResult: "Le nouveau projet doit apparaître dans la liste des projets"
    },
    "Échec du téléchargement d\'un fichier avec format non autorisé": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des documents\n3. Clic sur le bouton 'Télécharger un nouveau document'\n4. Remplissage du formulaire avec les informations du document\n5. Soumission du formulaire",
      expectedResult: "Le format du document doit être rejeté"
    },
    "Échec de l\'ajout d\'un document  avec un fichier volumineux": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des documents\n3. Clic sur le bouton 'Télécharger un nouveau document'\n4. Remplissage du formulaire avec les informations du document\n5. Soumission du formulaire",
      expectedResult: "Le document doit être rejeté à cause de sa taille"
    },
    "Échec de l\'ajout d\'un document juridique avec format de fichier non autorisé": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des documents\n3. Clic sur le bouton 'Télécharger un nouveau document'\n4. Remplissage du formulaire avec les informations du document\n5. Soumission du formulaire",
      expectedResult: "Le format du document doit être rejeté"
    },
    "Échec de l\'ajout d\'un document juridique avec un fichier volumineux": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des documents\n3. Clic sur le bouton 'Télécharger un nouveau document'\n4. Remplissage du formulaire avec les informations du document\n5. Soumission du formulaire",
      expectedResult: "Le document doit être rejeté à cause de sa taille"
    },
  };
  
  module.exports = testInfo;