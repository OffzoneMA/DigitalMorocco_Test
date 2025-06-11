const testInfo = {
  //login
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

   //register
    "Test d'inscription et validation d'email":{
      stepsPerformed:"1.Accéder à l application \n2.lCiquer sur créer un compte \n3.Remplir le formulaire pour la création d'un compte\n4.Cocher les conditions\n5.Cliquer sur le bouton s'inscrire",
      expectedResult: "Un email de validation doit être envoyé  "
   },
    "Test du bouton de renvoi d\'email avec vérification de confirmation":{
      stepsPerformed:"1.Accéder à l application \n2.lCiquer sur créer un compte \n3.Remplir le formulaire pour la création d'un compte\n4.Cocher les conditions\n5.Cliquer sur le bouton s'inscrire\n6.Se diriger vers la page vérification d'email\n7.Cliquer sur le bouton renvoyer l'email ",
      expectedResult: "Un email de validation doit être renvoyé "
   },
   "Vérifier que l\'inscription avec un email déjà existant est échoué":{
      stepsPerformed:"1.Accéder à l application \n2.lCiquer sur créer un compte \n3.Remplir le formulaire avec une adresse email déjà existante\n4.Cocher les conditions\n5.Cliquer sur le bouton s'inscrire",
      expectedResult: "Un message d'erreur doit être affiché"
   },
     "Vérifier que l\'inscription échoue si le mot de passe ne respecte pas tous les critères":{
      stepsPerformed:"1.Accéder à l application \n2.lCiquer sur créer un compte \n3.Remplir le formulaire avec un mot de passe qui ne respecte pas tous les critères \n4.Cocher les conditions\n5.Cliquer sur le bouton s'inscrire",
      expectedResult: "Un message d'erreur doit être affiché"
   },

    //projectDetails
      "Modification du projet - Ajouter un nouveau jalon": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des projets\n3. Cliquer sur le projet dans le tableau\n4. Cliquer sur le bouton Ajouter un nouveau jalon\n5. Remplir l'alerte affiché \n6.Cliquer sur le bouton Enregistrer",
      expectedResult: "Un nouveau jalon est ajouté"
    },
       "Échec de création de jalon - Champ nom vide": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des projets\n3. Cliquer sur le projet dans le tableau\n4. Cliquer sur le bouton Ajouter un nouveau jalon\n5. Remplir l'alerte affiché en laissant le champs nom vide\n6.Cliquer sur le bouton Enregistrer",
      expectedResult: "Un message d'erreur est affiché"
    },
     "Échec de création de jalon - Champ date vide": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des projets\n3. Cliquer sur le projet dans le tableau\n4. Cliquer sur le bouton Ajouter un nouveau jalon\n5. Remplir l'alerte affiché en laissant le champs date vide\n6.Cliquer sur le bouton Enregistrer",
      expectedResult: "Un message d'erreur est affiché"
    },
     "Échec de création de jalon - Tous les champs obligatoires vides": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des projets\n3. Cliquer sur le projet dans le tableau\n4. Cliquer sur le bouton Ajouter un nouveau jalon\n5. Laisser les champs obligatoires vides\n6.Cliquer sur le bouton Enregistrer",
      expectedResult: "Un message d'erreur est affiché"
    },
    "Vérification du bouton Annuler dans le formulaire de jalon": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des projets\n3. Cliquer sur le projet dans le tableau\n4. Cliquer sur le bouton Ajouter un nouveau jalon\n5.Cliquer sur le bouton Annuler",
      expectedResult: "L'alerte est fermé "
    },
     
     

   //project
    "Suppression d'un projet": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des projets.\n3. Clic sur le bouton de suppression\n4. Confirmation de la suppression\n5. Vérification que le projet a été supprimé du tableau",
      expectedResult: "Le projet doit être supprimé de la liste des projets"
    },
    "Création d'un nouveau projet": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des projets\n3. Clic sur le bouton 'Ajouter un projet'\n4. Remplissage du formulaire avec les informations du projet\n5. Soumission du formulaire",
      expectedResult: "Le nouveau projet doit apparaître dans la liste des projets"
    },
     "Échec de la création - Champs obligatoires non remplis": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des projets\n3. Clic sur le bouton 'Ajouter un projet'\n4. laisser les champs obligatoires vides \n5. Soumission du formulaire",
      expectedResult: "Un message d'erreur doit affiché"
    },
    "Échec de la création - Les champs numériques doivent être positifs": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des projets\n3. Clic sur le bouton 'Ajouter un projet'\n4. remplir les champs numériques par des numéros négatifs \n5. Soumission du formulaire",
      expectedResult: "les champs doivent acceptés uniquement les numéros positifs"
    },
     "Validation échouée - Email au format incorrect": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des projets\n3. Clic sur le bouton 'Ajouter un projet'\n4.saisir email format incorrect \n5. Soumission du formulaire",
      expectedResult: "le champs ne doit pas accepté un email au format incorrect"
    },

    "Modification d'un projet existant": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des projets\n3. Clic sur l'icone modifier le projet \n4.modification d'un champs du projet \n5. cliquer sur le bouton enregitrer",
      expectedResult: "la modification doit être appliqué au projet "
    },

    "Modification d'un projet avec un champ obligatoire vide": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des projets\n3. Clic sur l'icone modifier le projet \n4.laisser un champs obligatoire vide \n5. cliquer sur le bouton enregitrer",
      expectedResult: "Un message d'erreur doit être affiché "
    },

    "Modification d\'un projet avec des données invalides": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des projets\n3. Clic sur l'icone modifier le projet \n4.remplir les champs avec des données invalides \n5. cliquer sur le bouton enregitrer",
      expectedResult: "Un message d'erreur doit être affiché "
    },
    
    //company
    "Création d\'une entreprise": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page Profilde l'entreprise.\n3. Remplir le formulaire\n4. Cliquer sur le bouton Enregistrer",
      expectedResult: "Les informations doivent être enregistrées "
    },
    "Echec de modification - Champs obligatoires vides": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page Profilde l'entreprise.\n3. Remplir le formulaire en laissant les champs obligatoires vides\n4. Cliquer sur le bouton Enregistrer",
      expectedResult: "Un message d'erreur doit être affiché"
    },
    "Echec de modification - Format Email invalide": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page Profilde l'entreprise.\n3. Remplir le formulaire avec un email invalide\n4. Cliquer sur le bouton Enregistrer",
      expectedResult: "Un message d'erreur doit être affiché"
    },
    "Echec de modification - Numéro d'identification fiscale invalide": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page Profilde l'entreprise.\n3. Remplir le formulaire avec un numéro d'identification fiscale invalide\n4. Cliquer sur le bouton Enregistrer",
      expectedResult: "le champs doit accepté uniquement les nombres"
    },
     "Echec de modification - Numéro d'identification de l'entreprise invalide": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page Profilde l'entreprise.\n3. Remplir le formulaire avec un numéro d'identification de l'entreprise invalide\n4. Cliquer sur le bouton Enregistrer",
      expectedResult: "le champs doit accepté uniquement les nombres"
    },

    //employee
    "Création d'une employé": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des employés.\n3. Cliquer sur le bouton 'Ajouter un nouvel employé'\n4. Remplir le formulaires avec les informations de l'employé\n5.Cliquer sur le bouton 'Enregitrer'",
      expectedResult: "Un nouvel employé doit être ajouté  "
    },
    "Echec de la création d'un employé - champs obligatoires vides": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des employés.\n3. Cliquer sur le bouton 'Ajouter un nouvel employé'\n4. Remplir le formulaires avec les informations en laissant les champs obligatoires vides\n5.Cliquer sur le bouton 'Enregitrer'",
      expectedResult: "Un message d'erreur doit être affiché"
    },
    "Echec de la création d'un employé - Email au format incorrect": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des employés.\n3. Cliquer sur le bouton 'Ajouter un nouvel employé'\n4. Remplir le formulaires avec les informations avec un email invalide\n5.Cliquer sur le bouton 'Enregitrer'",
      expectedResult: "Un message d'erreur doit être affiché"
    },
     "Echec de la création d'un employé - numéro de téléphone invalide": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des employés.\n3. Cliquer sur le bouton 'Ajouter un nouvel employé'\n4. Remplir le formulaires avec les informations avec un numéro de téléphone invalide\n5.Cliquer sur le bouton 'Enregitrer'",
      expectedResult: "Un message d'erreur doit être affiché"
    },
    "Echec de la création d'un employé - numéro de téléphone trop long": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des employés.\n3. Cliquer sur le bouton 'Ajouter un nouvel employé'\n4. Remplir le formulaires avec les informations avec un numéro de téléphone trop long\n5.Cliquer sur le bouton 'Enregitrer'",
      expectedResult: "Un message d'erreur doit être affiché"
    },
     "Echec de la création d'un employé - numéro de téléphone trop court": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des employés.\n3. Cliquer sur le bouton 'Ajouter un nouvel employé'\n4. Remplir le formulaires avec les informations avec un numéro de téléphone trop court\n5.Cliquer sur le bouton 'Enregitrer'",
      expectedResult: "Un message d'erreur doit être affiché"
    },
    "Échec de la création d'un employé - Les champs numériques doivent être positifs": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des employés.\n3. Cliquer sur le bouton 'Ajouter un nouvel employé'\n4. Remplir le formualire en Saisissant des nombres négatifs dans les champs numériques\n5.Cliquer sur le bouton 'Enregitrer'",
      expectedResult: "Un message d'erreur doit être affiché"
    },
    "Modification d'un employé existant": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des employés.\n3. Cliquer sur l'icone modifier \n4. Modifier les informations \n5.Cliquer sur le bouton 'Enregitrer'",
      expectedResult: "Les informations de l'utilisateur doit être modifiés"
    },
     "Modification d'un employé avec un champ obligatoire vide": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des employés.\n3. Cliquer sur l'icone modifier \n4. Modifier les informations en laissant les champs obligatoires vides \n5.Cliquer sur le bouton 'Enregitrer'",
      expectedResult: "Un message d'erreur doit être affiché"
    },
    "Modification d'un employé avec des données invalides": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des employés.\n3. Cliquer sur l'icone modifier \n4. Modifier les informations avec des données invalides \n5.Cliquer sur le bouton 'Enregitrer'",
      expectedResult: "Un message d'erreur doit être affiché"
    },
      "Suppression d'un employé existant": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des employés.\n3. Cliquer sur l'icone Supprimer \n4. Confirmer la suppression ",
      expectedResult: "l'employé doit être supprimé de la liste"
    },
    "Annulation de la suppression d'un employé": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des employés.\n3. Cliquer sur l'icone Supprimer \n4. Annuler la suppression ",
      expectedResult: "l'employé est affiché dans la liste"
    },

    
    
    
    
    
    //document
    "Création d'un document avec vérification dans le tableau": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des documents\n3. Clic sur le bouton 'Télécharger un nouveau document'\n4. Remplissage du formulaire avec les informations du document\n5. Soumission du formulaire",
      expectedResult: "Le document estajouté à la table"
    },
     "Echec de création d'un document - champs obligatoires vides": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des documents\n3. Clic sur le bouton 'Télécharger un nouveau document'\n4. Remplissage du formulaire avec les informations en laissant les champs obligatoires vides \n5. Soumission du formulaire",
      expectedResult: "Un message d'erreur est affiché "
    },
     "Modification du nom d'un document": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des documents\n3. Clic sur l'icon modifier\n4. Modifier le nom du document\n5.Cliquer sur le bouton Modifier le document",
      expectedResult: "Le nom du document est modifié "
    },
     "Mise à jour du fichier d'un document avec vérification": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des documents\n3. Clic sur l'icon modifier\n4. Cliquer sur le bouton mettre à jour le document\n5.Cliquer sur le bouton Modifier le document",
      expectedResult: "Le document est mis à jour "
    },
     "Désélection d'un membre depuis un document existant": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des documents\n3. Clic sur l'icon partager\n4. Déselectionner un membre\n5.Cliquer sur le bouton partager",
      expectedResult: "Le membre doit être déselectionné"
    },
     "Test du bouton Annuler lors de la modification du nom d\'un document": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des documents\n3. Clic sur l'icon modifier\n4. Modifier le nom du document\n5.Cliquer sur le bouton Annuler",
      expectedResult: "Le nom du document n'a pa changé ."
    },
     "Tentative de partage sans sélection de membre": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des documents\n3. Cliquer sur l'icon partager\n4. Cliquer sur le bouton partager le document",
      expectedResult: "Le système n'autorise pas le partage sans séléctionner un membre "
    },
     "Partage de document avec un membre spécifique": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des documents\n3. Cliquer sur l'icon partager\n4.Séléctionner un membre\n5. Cliquer sur le bouton partager le document",
      expectedResult: "Le document est partagé avec le membre "
    },
     "Annulation de la Suppression d'un document": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des documents\n3. Cliquer sur l'icon supprimer\n4.Cliquer sur le bouton annuler",
      expectedResult: "La suppression du document est annulé"
    },
     "Suppression d'un document": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des documents\n3. Cliquer sur l'icon supprimer\n4.Confirmer la suppression",
      expectedResult: "Le document est supprimé de la liste."
    },


    "Échec du téléchargement d'un fichier avec format non autorisé": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des documents\n3. Clic sur le bouton 'Télécharger un nouveau document'\n4. Remplissage du formulaire avec les informations du document\n5. Soumission du formulaire",
      expectedResult: "Le format du document doit être rejeté"
    },
    "Échec de l'ajout d'un document  avec un fichier volumineux": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des documents\n3. Clic sur le bouton 'Télécharger un nouveau document'\n4. Remplissage du formulaire avec les informations du document\n5. Soumission du formulaire",
      expectedResult: "Le document doit être rejeté à cause de sa taille"
    },

    //juridique

    "Création d\'un document juridique avec vérification dans le tableau": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des documents\n3. Clic sur le bouton 'Télécharger un nouveau document'\n4. Remplissage du formulaire avec les informations du document\n5.Cliquer sur Ajouter un document",
      expectedResult: "Le document doit être ajouté à la table ."
    },
     "Echec de création d'un document juridique - champs obligatoires vides": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des documents\n3. Clic sur le bouton 'Télécharger un nouveau document'\n4. Remplissage du formulaire avec les informations en laissant les champs obligatoires vides\n5.Cliquer sur ajouter un document",
      expectedResult: "Un message d'erreur doit être affiché"
    },
     "Modification du nom d'un document juridique avec vérification dans le tableau": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des documents\n3. Clic sur l'icon modifier\n4. Modifier les informations\n5.Cliquer sur le bouton Modifier le document",
      expectedResult: "La modification doit être appliqué au document"
    },
    "Mise à jour du fichier d'un document juridique avec vérification": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des documents\n3. Clic sur l'icon modifier\n4. Cliquer sur le bouton mettre à jour votre document\n5.Cliquer sur le bouton Modifier le document",
      expectedResult: "Le document doit être mise à jour"
    },
     "Test du bouton Annuler lors de la modification du nom d'un document juridique": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des documents\n3. Clic sur l'icon modifier\n4. Cliquer sur le bouton Annuler",
      expectedResult: "La modification doit être annulé"
    },
     "Téléchargement d'un document juridique": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des documents\n3. Clic sur l'icon Télécharger",
      expectedResult: "Le document doit être téléchargé"
    },
     "Annulation de la Suppression d\'un document juridique": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des documents\n3. Clic sur l'icon supprimer\n4. Cliquer sur le bouton Annuler",
      expectedResult: "Le document doit être affiché dans la table"
    },
      "Suppression d\'un document juridique": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des documents\n3. Clic sur l'icon supprimer\n4. Confirmer la suppression",
      expectedResult: "Le document doit supprimé de la la table"
    },

    "Échec de l\'ajout d\'un document juridique avec format de fichier non autorisé": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des documents\n3. Clic sur le bouton 'Télécharger un nouveau document'\n4. Remplissage du formulaire avec les informations du document\n5. Soumission du formulaire",
      expectedResult: "Le format du document doit être rejeté"
    },
    "Échec de l\'ajout d\'un document juridique avec un fichier volumineux": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page des documents\n3. Clic sur le bouton 'Télécharger un nouveau document'\n4. Remplissage du formulaire avec les informations du document\n5. Soumission du formulaire",
      expectedResult: "Le document doit être rejeté à cause de sa taille"
    },

    //profile
    "Affichage des informations du profil": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page de profil",
      expectedResult: "Les informations sur le profil est affiché correctement"
    },
     "Modification des informations personnelles dans le profil": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page de profil\n3.Modifier les informations\n4.Cliquer sur le bouton Sauvegarder",
      expectedResult: "Les informations doivent être mises à jour"
    },
     "Modification du mot de passe dans le profil": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page de profil\n3.Remplir les  champs du mot de passe en saissisant un nouveau mot de passe\n4.Cliquer sur le bouton Sauvegarder",
      expectedResult: "Le mot de passe doit être mise à jour"
    },
     "Validation des critères de mot de passe non conforme": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page de profil\n3.Remplir les  champs du mot de passe en saissisant un mot de passe qui ne respecte pas les critères\n4.Cliquer sur le bouton Sauvegarder",
      expectedResult: "Un message d'erreur doit être affiché."
    },
      "Échec de correspondance entre le nouveau mot de passe et sa confirmation": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page de profil\n3Remplir les champs du mot de passe avec deux mots de passe différents\n4.Cliquer sur le bouton Sauvegarder",
      expectedResult: "Un message d'erreur doit être affiché."
    },
     "Validation des champs obligatoires dans le profil": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page de profil\nLaisser les champs obligatoires vides\n4.Cliquer sur le bouton Sauvegarder",
      expectedResult: "Un message d'erreur doit être affiché."
    },
      "Validation du format email dans le profil": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page de profil\nSaisir un email format invalide\n4.Cliquer sur le bouton Sauvegarder",
      expectedResult: "Un message d'erreur doit être affiché."
    },
     "Téléchargement de photo de profil": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page de profil\nCliquer sur télécharger une photo de profil\n4.Choisir une photo",
      expectedResult: "La photo de profil est bien affiché."
    },
    "Changement de photo de profil": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page de profil\nCliquer sur changer la photo de profil\n4.Choisir une autre photo",
      expectedResult: "La photo de profil est bien changé."
    },
    "Suppression de photo de profil": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page de profil\nCliquer sur supprimer la photo de profil",
      expectedResult: "La photo de profil est bien supprimé."
    },
     "Refus de téléchargement de photo avec format non autorisé": {
     stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page de profil\nCliquer sur télécharger une photo de profil\n4.Choisir une photo format non autorisé",
      expectedResult: "Le format est refusé ."
    },
      "Affichage initial des sélections de langue": {
     stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page de profil",
      expectedResult: "Affichage initial des sélections de langue est bien vérifié"
    },
      "Changement de langue et de région avec vérification": {
     stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page de profil\n3.Changer la langue et la région\n4.Cliquer sur le bouton Sauvegarder",
      expectedResult: "La langue et la région sont changés."
    },

    //credit
      "Test d\'affichage du total des crédits": {
     stepsPerformed: "1. Connexion à l'application\n2.Cliquer sur le bouton gérer",
      expectedResult: "Le total de crédit est bien affiché ."
    },
      "Test complet du menu déroulant avec recherche et sélection": {
     stepsPerformed: "1. Connexion à l'application\n2.Cliquer sur le bouton gérer\n3.Cliquer sur le menu déroulent pour choisir une valeur de crédit",
      expectedResult: "La valeur de crédit est bien séléctionné."
    },
    "Finaliser commande sans accepter les conditions d\'utilisation": {
     stepsPerformed: "1. Connexion à l'application\n2.Cliquer sur le bouton gérer\n3.Cliquer sur le menu déroulent pour choisir une valeur de crédit\n4.Cliquer sur le bouton Finaliser",
      expectedResult: "Un message d'erreur s'affiche ."
    },
     "Finaliser commande sans sélection de crédits": {
     stepsPerformed: "1. Connexion à l'application\n2.Cliquer sur le bouton gérer\n3.Cliquer sur le bouton Finaliser",
      expectedResult: "Un message d'erreur s'affiche ."
    },
    
    //InvestorComapny
     "Création réussie du profil entreprise investisseur": {
     stepsPerformed: "1. Connexion à l'application\n2.Naviguer vers la page profil entreprise\n3.Remplir le formulaire\n4.Cliquer sur le bouton Sauvegarder",
    expectedResult: "Les informations du profil entreprise sont bien enregistrés."
    },
      "Vérification de la validation des champs obligatoires": {
     stepsPerformed: "1. Connexion à l'application\n2.Naviguer vers la page profil entreprise\n3.Remplir le formulaire en laissant les chaps obligatoires vides\n4.Cliquer sur le bouton Sauvegarder",
    expectedResult: "Un message d'erreur est affiché."
    },
      "Echec de modification - Numéro d'identification fiscale invalide": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page Profilde l'entreprise.\n3. Remplir le formulaire avec un numéro d'identification fiscale invalide\n4. Cliquer sur le bouton Enregistrer",
      expectedResult: "le champs doit accepté uniquement les nombres"
    },
     "Echec de modification - Numéro d'identification de l'entreprise invalide": {
      stepsPerformed: "1. Connexion à l'application\n2. Navigation vers la page Profilde l'entreprise.\n3. Remplir le formulaire avec un numéro d'identification de l'entreprise invalide\n4. Cliquer sur le bouton Enregistrer",
      expectedResult: "le champs doit accepté uniquement les nombres"
    },
     "Test de changement du logo d\'entreprise": {
     stepsPerformed: "1. Connexion à l'application\n2.Naviguer vers la page profil entreprise\n3.Cliquer sur changer le logo \n4.choisir un autre logo \n5.Cliquer sur le bouton Sauvegarder",
    expectedResult: "Le logo est bien changé."
    },
     "Test de changement du logo d\'entreprise": {
     stepsPerformed: "1. Connexion à l'application\n2.Naviguer vers la page profil entreprise\n3.Cliquer sur supprimer le logo  \n4.Cliquer sur le bouton Sauvegarder",
    expectedResult: "Le logo est bien supprimé."
    },
     "Test d\'échec de téléchargement de logo - format non autorisé": {
     stepsPerformed: "1. Connexion à l'application\n2.Naviguer vers la page profil entreprise\n3.Cliquer sur télécharger un logo\n4.choisir un logo format non autorisé  \n5.Cliquer sur le bouton Sauvegarder",
    expectedResult: "Le logo est bien refusé."
    },
     "Validation du format email dans le profil": {
     stepsPerformed: "1. Connexion à l'application\n2.Naviguer vers la page profil entreprise\n3.Saisir un format email invalide\n4Cliquer sur le bouton Sauvegarder",
    expectedResult: "Le format email est refusé."
    },
     "Validation du format URL dans le profil": {
     stepsPerformed: "1. Connexion à l'application\n2.Naviguer vers la page profil entreprise\n3.Saisir un format URL invalide\n4Cliquer sur le bouton Sauvegarder",
    expectedResult: "Le format URL est refusé."
    },

    //investorProfile
     "Remplissage et soumission du formulaire investisseur": {
     stepsPerformed: "1. Connexion à l'application\n2.Naviguer vers la page profil investisseur\n3.Remplir le formulaire\n4.Cliquer sur le bouton Sauvegarder",
    expectedResult: "Les informations du profil entreprise sont bien enregistrés."
    },
     "Vérification des champs obligatoires du formulaire investisseur": {
     stepsPerformed: "1. Connexion à l'application\n2.Naviguer vers la page profil investisseur\n3.Remplir le formulaire en laissant les champs obligatoires vides\n4.Cliquer sur le bouton Sauvegarder",
    expectedResult: "Un message d'erreur est affiché ."
    },
       "Validation du format numéro de téléphone dans le profil": {
     stepsPerformed: "1. Connexion à l'application\n2.Naviguer vers la page profil investisseur\n3.Saisir un numéro de téléphone invalide\n4.Cliquer sur le bouton Sauvegarder",
    expectedResult: "Un message d'erreur est affiché ."
    },
     "Modification des champs du profil investisseur": {
     stepsPerformed: "1. Connexion à l'application\n2.Naviguer vers la page profil investisseur\n3.Modifier les informations du profil investisseur\n4.Cliquer sur le bouton Sauvegarder",
    expectedResult: "les informations sont mis à jour ."
    },
     "Validation du champ capacité d\'investissement - accepte uniquement des nombres": {
     stepsPerformed: "1. Connexion à l'application\n2.Naviguer vers la page profil investisseur\n3.Saisir des caractères dans le champs capacité d'investissemnt\n4.Cliquer sur le bouton Sauvegarder",
    expectedResult: "le champs doit refusé les cacactères "
    },
     "Validation du champ nombre d\'investissements - accepte uniquement des nombres entiers": {
     stepsPerformed: "1. Connexion à l'application\n2.Naviguer vers la page profil investisseur\n3.Saisir des caractères dans le champs nombre d'investissemnt\n4.Cliquer sur le bouton Sauvegarder",
    expectedResult: "le champs doit refusé les cacactères "
    },
     "Validation du champ nombre de sorties - accepte uniquement des nombres entiers": {
     stepsPerformed: "1. Connexion à l'application\n2.Naviguer vers la page profil investisseur\n3.Saisir des caractères dans le champs nombre de sorties\n4.Cliquer sur le bouton Sauvegarder",
    expectedResult: "le champs doit refusé les cacactères "
    },
      "Validation du champ nombre de fonds - accepte uniquement des nombres entiers": {
     stepsPerformed: "1. Connexion à l'application\n2.Naviguer vers la page profil investisseur\n3.Saisir des caractères dans le champs nombre de fonds\n4.Cliquer sur le bouton Sauvegarder",
    expectedResult: "le champs doit refusé les cacactères "
    },
      "Validation du champ nombre d\'acquisitions - accepte uniquement des nombres entiers": {
     stepsPerformed: "1. Connexion à l'application\n2.Naviguer vers la page profil investisseur\n3.Saisir des caractères dans le champs nombre d'acquisitions\n4.Cliquer sur le bouton Sauvegarder",
    expectedResult: "le champs doit refusé les cacactères "
    },
    //notification
     "Clic sur l\'icône de notification et navigation vers la page": {
     stepsPerformed: "1. Connexion à l'application\n2.Cliquer dur l'icon de notification",
    expectedResult: "l'utilisateur est dirigé vers la page de notifications "
    },









    




   

  };
  
  module.exports = testInfo;