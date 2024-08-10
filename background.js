function sendDiscordNotification(productDetails, webhookUrl) {
  console.log("Envoi d'une notification à Discord...");

  // Message classique
  const message = "Produit ajouté au panier";

  // Embed avec les détails du produit, avec le titre redirigeant directement vers la page de checkout
  const embed = {
    title: productDetails.eventName, // Titre de l'événement
    url: "https://tickets.paris2024.org/checkout.html", // URL vers laquelle le titre redirige
    description:
      `**Prix :** ${productDetails.price}\n\n` +
      `**Date :** ${productDetails.date}\n\n` +
      `**Lieu :** ${productDetails.venue}\n\n` +
      `**Catégorie :** ${productDetails.category}\n\n` +
      `**Siège :** ${productDetails.seatInfo}`,
    color: 3066993, // Couleur de l'embed
    thumbnail: {
      url: productDetails.imageUrl,
    },
  };

  const payload = {
    content: message, // Message classique
    embeds: [embed], // Embed avec le lien du panier dans le titre
  };

  fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (response.ok) {
        console.log("Notification Discord envoyée avec succès");
      } else {
        console.error("Erreur lors de l'envoi de la notification Discord");
      }
    })
    .catch((error) =>
      console.error("Erreur lors de l'envoi de la notification:", error)
    );
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "notify") {
    console.log("Notification reçue pour envoi à Discord");

    chrome.storage.local.get("discordWebhookUrl", function (result) {
      const webhookUrl = result.discordWebhookUrl;
      if (webhookUrl) {
        sendDiscordNotification(message.productDetails, webhookUrl);
      } else {
        console.error("Webhook Discord non configuré.");
      }
    });
  }
});
