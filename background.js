const webhookURL =
  "https://discord.com/api/webhooks/1270012955391430777/-fnYEubdvqU0V-5sSuX7PaKe3sTJqg11ymHxBQn3agYnQKHSqWTN517jI9oc9dxykjH2";

function sendDiscordNotification(message) {
  console.log("Envoi d'une notification à Discord...");
  fetch(webhookURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: message }),
  })
    .then((response) => console.log("Notification envoyée avec succès"))
    .catch((error) =>
      console.error("Erreur lors de l'envoi de la notification:", error)
    );
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "notify") {
    console.log("Notification reçue pour envoi à Discord");
    sendDiscordNotification("Produit ajouté au panier sur Paris 2024 !");
  }
});
