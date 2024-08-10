let intervalId;
let notificationSent = false; // Indicateur pour s'assurer que la notification n'est envoyée qu'une seule fois
let offersCheckIntervalId;

function getOfferApiUrl() {
  const currentUrl = window.location.href;
  const urlParts = currentUrl.split("/");
  const offerIdPart = urlParts[urlParts.length - 1]; // Récupère la dernière partie de l'URL
  const timestamp = Date.now(); // Obtient l'horodatage actuel
  return `https://ticket-resale.paris2024.org/json/offers/${offerIdPart}?_=${timestamp}`;
}

function getSpecificCookie(name) {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (cookieName === name) {
      return `${cookieName}=${cookieValue}`;
    }
  }
  return null;
}

function fetchOffers() {
  const url = getOfferApiUrl();
  const queueCookie = getSpecificCookie(
    "QueueITAccepted-SDFrts345E-V3_p24web180424"
  );

  if (!queueCookie) {
    console.error("Cookie requis non trouvé");
    return;
  }

  console.log(`Appel API à : ${url}`);
  return fetch(url, {
    headers: {
      accept: "application/json, text/javascript, */*; q=0.01",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
      cookie: queueCookie,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data && data.offers && data.offers.length > 0) {
        console.log("Des offres sont disponibles.");
        handleOffers(data.offers);
      } else {
        console.log("Aucune offre disponible.");
        // Ne fait rien si aucune offre n'est disponible, attend simplement le prochain cycle de vérification
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des offres:", error);
    });
}

function handleOffers(offers, index = 0) {
  if (index >= offers.length) {
    console.log(
      "Toutes les offres ont été vérifiées, aucune n'est disponible."
    );
    return; // Arrête la vérification si toutes les offres ont été vérifiées
  }

  const offer = offers[index];
  const offerId = offer.id;
  const currentAmount = offer.currentAmount;
  if (offerId && currentAmount) {
    console.log(
      `Redirection vers la page avec offerId=${offerId} et ptc=${currentAmount}`
    );
    const newUrl = `${window.location.origin}${window.location.pathname}?offerId=${offerId}&ptc=${currentAmount}`;
    window.location.href = newUrl;

    setTimeout(() => {
      checkOfferAvailability(offers, index);
    }, 2000); // Vérifie l'offre après 2 secondes
  }
}

function checkOfferAvailability(offers, index) {
  const errorMessage = document.querySelector(".p24-detailC-ErrorMessage"); // Assurez-vous que ce sélecteur correspond à l'élément de message d'erreur
  if (
    errorMessage &&
    errorMessage.textContent.includes(
      "Cette offre n'est pas disponible pour le moment"
    )
  ) {
    console.log(
      `Offre ${index + 1} non disponible. Vérification de l'offre suivante.`
    );
    handleOffers(offers, index + 1);
  } else {
    console.log(`Offre ${index + 1} disponible. Tentative d'achat.`);
    checkAndClickPaymentButton();
  }
}

function checkAndClickPaymentButton() {
  const urlParams = new URLSearchParams(window.location.search);
  const offerId = urlParams.get("offerId");
  if (offerId) {
    const paymentButton = document.querySelector("button.p24-detailC-Button");
    if (paymentButton) {
      console.log('Clique sur le bouton "Aller au paiement"');
      paymentButton.click();
    } else {
      console.log(
        'Bouton "Aller au paiement" non trouvé, réessayer dans 2 secondes'
      );
      setTimeout(checkAndClickPaymentButton, 2000);
    }
  }
}

function sendDiscordNotification() {
  const webhookUrl =
    "https://discord.com/api/webhooks/1270012955391430777/-fnYEubdvqU0V-5sSuX7PaKe3sTJqg11ymHxBQn3agYnQKHSqWTN517jI9oc9dxykjH2";
  const payload = {
    content: `Produit ajouté au panier. Lien de la page de paiement: ${window.location.href}`,
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
    .catch((error) => {
      console.error(
        "Erreur lors de l'envoi de la notification Discord:",
        error
      );
    });
}

function checkIfOnCheckoutPage() {
  if (
    window.location.href.includes(
      "https://tickets.paris2024.org/checkout.html"
    ) &&
    !notificationSent
  ) {
    console.log("Sur la page de paiement");
    sendDiscordNotification(); // Envoie la notification seulement sur la page de paiement
    notificationSent = true; // Met à jour l'indicateur pour éviter les notifications en boucle
    stopCheckingOffers(); // Arrête la vérification des offres
  }
}

function startCheckingOffers() {
  console.log("Démarrage de la vérification des offres...");

  // Vérifie régulièrement si nous sommes sur la page de checkout
  intervalId = setInterval(() => {
    checkIfOnCheckoutPage();
  }, 1000);

  // Lancer la vérification des offres uniquement si on n'est pas sur la page de checkout
  if (!window.location.href.includes("checkout.html")) {
    offersCheckIntervalId = setInterval(() => {
      console.log("Vérification des offres via l'API...");
      fetchOffers();
    }, 13000);
  }
}

function stopCheckingOffers() {
  console.log("Arrêt de la vérification des offres...");
  clearInterval(offersCheckIntervalId);
  clearInterval(intervalId);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message reçu:", message);
  if (message.action === "start") {
    console.log("Démarrage de la vérification des offres.");
    startCheckingOffers();
  } else if (message.action === "stop") {
    console.log("Arrêt de la vérification des offres.");
    stopCheckingOffers();
  }
});

console.log("Script content.js chargé");

// Lancer la vérification des offres et du bouton de paiement si nécessaire
startCheckingOffers();
