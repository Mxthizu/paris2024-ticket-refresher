document.addEventListener("DOMContentLoaded", function () {
  // Récupère l'URL du webhook Discord du stockage local
  chrome.storage.local.get("discordWebhookUrl", function (result) {
    if (result.discordWebhookUrl) {
      document.getElementById("webhookUrl").value = result.discordWebhookUrl;
    }
  });
});

document.getElementById("saveWebhook").addEventListener("click", function () {
  const webhookUrl = document.getElementById("webhookUrl").value;
  if (webhookUrl) {
    chrome.storage.local.set({ discordWebhookUrl: webhookUrl }, function () {
      document.getElementById("status").innerText = "Webhook URL saved!";
      setTimeout(() => {
        document.getElementById("status").innerText = ""; // Efface le message de confirmation après quelques secondes
      }, 3000);
    });
  }
});
