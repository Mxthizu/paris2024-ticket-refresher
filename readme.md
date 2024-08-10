# Paris 2024 Ticket Refresher

## Description

**Paris 2024 Ticket Refresher** est une extension Chrome conçue pour automatiser la recherche de billets pour les événements des Jeux Olympiques de Paris 2024. Cette extension permet de vérifier automatiquement les offres disponibles sur le site de revente de billets, d'ajouter automatiquement les billets au panier, et d'envoyer une notification Discord avec le lien de la page de paiement lorsqu'un billet a été ajouté au panier.

## Fonctionnalités

- **Vérification automatique des offres** : L'extension recherche les offres disponibles toutes les 7 secondes.
- **Ajout automatique au panier** : Si une offre est disponible, elle est automatiquement ajoutée au panier.
- **Notification Discord** : Une notification est envoyée à votre serveur Discord une fois que les billets sont ajoutés au panier et que vous êtes redirigé vers la page de paiement.
- **Arrêt automatique** : La vérification des offres s'arrête automatiquement lorsque vous atteignez la page de checkout.

## Installation

### Pré-requis

- Google Chrome ou un navigateur compatible avec les extensions Chrome.
- Accès au site de revente de billets des Jeux Olympiques de Paris 2024.
- Un serveur Discord avec un webhook configuré pour recevoir les notifications.

### Étapes d'installation

1. **Clonez ou téléchargez ce dépôt :**

   ```bash
   git clone https://github.com/mxthizu/paris2024-ticket-refresher.git
   ```

   Si vous préférez, vous pouvez également télécharger le projet en tant qu'archive ZIP depuis la page GitHub et extraire le contenu sur votre ordinateur.

2. **Ouvrez Google Chrome :**

   - Allez à `chrome://extensions/`.
   - Activez le mode développeur en haut à droite de la page.

3. **Chargez l'extension :**

   - Cliquez sur le bouton "Charger l'extension décompressée".
   - Sélectionnez le dossier du projet `paris2024-ticket-refresher` que vous venez de cloner ou d'extraire.

4. **Configuration :**

   - Ouvrez le fichier `content.js` dans un éditeur de texte.
   - Remplacez la chaîne `YOUR_DISCORD_WEBHOOK_URL` par l'URL de votre webhook Discord.

5. **Utilisation :**

   - L'extension démarrera automatiquement la vérification des offres une fois que vous accédez à la page de revente des billets.
   - Une notification sera envoyée à votre serveur Discord lorsque vous atteignez la page de paiement.

## Licence

Ce projet est sous licence MIT. Consultez le fichier `LICENSE` pour plus d'informations.
