const testInfo = {
    "Connexion réussie avec des identifiants valides":{
      stepsPerformed:"1.Acceder à l application \n2.saisir l' email \n3.saisir le mot de passe\n4.Clic sur le bouton connexion",
      expectedResult: "L'utilisateur est dirigé vers la page Dashboard"
   },
   "Connexion échouée avec un email incorrect":{
      stepsPerformed:"1.Acceder à l application \n2.Saisir un email incorret\n3.Saisir le  mot de passe\n4.Clic sur le bouton connexion",
      expectedResult: "Un message d'erreur s'affiche indiquant les informations saisies sont incorrectes"
   },
    "Connexion échouée avec un mot de passe incorrect":{
      stepsPerformed:"1.Acceder à l application \n2.Saisir un email \n3.Saisir  mot de passe incorrect\n4.Clic sur le bouton connexion",
      expectedResult: "Un message d'erreur s'affiche indiquant les informations saisies sont incorrectes"
   },
   "Réinitialisation du mot de passe":{
      stepsPerformed:"1.Acceder à l application \n2.Cliquer sur Mot de passe oublié \n3.diriger vers la page Mot de passe oublié\n4.Saisir l'email\n5.cliquer sur le bouton Réinitialiser le mot de passe",
      expectedResult: "Un email va être envoyé"
   },

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