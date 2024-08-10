let intervalId;
let notificationSent = false;
let offersCheckIntervalId;
let productInfo = ""; // Variable pour stocker les informations du produit
let offersList = []; // Stocke les offres récupérées
let currentOfferIndex = 0; // Garde la trace de l'offre actuelle
const pageLoadDelay = 3000; // Délai pour laisser la page se charger complètement
const botProtectionCheckInterval = 5000; // Intervalle pour appuyer sur le bouton de protection bot

function checkForBotProtection() {
  // Ne pas vérifier la protection bot sur la page de paiement
  if (window.location.href.includes("checkout.html")) {
    return false;
  }

  const botProtectionModal = document.querySelector(".js-BotProtectionModal");
  if (botProtectionModal && !botProtectionModal.classList.contains("hidden")) {
    console.log(
      "Protection contre les robots détectée, appui automatique sur le bouton de rafraîchissement..."
    );

    // Trouver le bouton de rafraîchissement et cliquer dessus toutes les 5 secondes
    const refreshButton = document.querySelector(
      ".js-BotProtectionModalButtonTrigger"
    );
    if (refreshButton) {
      setInterval(() => {
        console.log("Appui sur le bouton de rafraîchissement...");
        refreshButton.click();
      }, botProtectionCheckInterval);
    }
    return true; // Indique que la protection bot a été détectée
  }
  return false;
}

// Appeler la vérification de protection contre les robots en tout premier
if (checkForBotProtection()) {
  console.log(
    "Protection contre les robots en place, arrêt des autres actions."
  );
} else {
  startCheckingOffers();
}

function getOfferApiUrl() {
  const currentUrl = window.location.href;
  const urlParts = currentUrl.split("/");
  const offerIdPart = urlParts[urlParts.length - 1];
  const timestamp = Date.now();
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
        productInfo = data.offers[0].cleanedEventName; // Récupère le nom du produit
        offersList = data.offers; // Stocke les offres récupérées
        currentOfferIndex = 0; // Réinitialise l'index des offres

        // Sauvegarder les offres et l'index actuel dans le stockage local
        chrome.storage.local.set({ offersList, currentOfferIndex }, () => {
          console.log("Offres sauvegardées dans le stockage local.");
          handleOffers(); // Commence à traiter les offres
        });
      } else {
        console.log("Aucune offre disponible.");
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des offres:", error);
    });
}

function handleOffers() {
  if (currentOfferIndex >= offersList.length) {
    console.log(
      "Toutes les offres ont été vérifiées, aucune n'est disponible."
    );
    return;
  }

  const offer = offersList[currentOfferIndex];
  if (offer) {
    const offerId = offer.id;
    const currentAmount = offer.currentAmount;
    if (offerId && currentAmount) {
      console.log(
        `Modification de l'URL avec offerId=${offerId} et ptc=${currentAmount}`
      );
      const newUrl = `${window.location.origin}${window.location.pathname}?offerId=${offerId}&ptc=${currentAmount}`;
      console.log(`Redirection vers : ${newUrl}`); // Log de l'URL modifiée

      // Rediriger vers la nouvelle URL pour charger la page
      window.location.href = newUrl;
    }
  } else {
    console.error(
      "Offre non définie pour l'index actuel. Passage à l'offre suivante."
    );
    currentOfferIndex++; // Incrémente l'index pour passer à l'offre suivante
    handleOffers(); // Passe à l'offre suivante
  }
}

function checkAndClickPaymentButton() {
  // Vérifier si un message d'erreur est présent
  if (
    currentOfferIndex >= offersList.length ||
    !offersList[currentOfferIndex]
  ) {
    console.error("Offre non définie ou index invalide. Arrêt.");
    return;
  }

  const offerId = offersList[currentOfferIndex].id;
  const errorMessage = document.querySelector(
    ".ErrorMessage.js-checkBarcodesForAutomatedReprintErrorMessage"
  );
  if (
    errorMessage &&
    errorMessage.textContent.includes(
      "Cette offre n'est pas disponible pour le moment"
    )
  ) {
    console.log(`Offre ${offerId} non disponible, passage à l'offre suivante`);
    currentOfferIndex++; // Incrémente l'index pour passer à l'offre suivante

    // Sauvegarder l'index actuel dans le stockage local
    chrome.storage.local.set({ currentOfferIndex }, () => {
      console.log(`Index actuel sauvegardé : ${currentOfferIndex}`);
      handleOffers(); // Passe à l'offre suivante
    });
    return;
  }

  const paymentButton = document.querySelector("button.p24-detailC-Button");
  if (paymentButton) {
    console.log(
      `Clique sur le bouton "Aller au paiement" pour l'offre ${offerId}`
    );
    paymentButton.click();
    stopCheckingOffers(); // Arrêter de vérifier les offres si le bouton est trouvé et cliqué
  } else {
    console.log(
      `Bouton "Aller au paiement" non trouvé ou non fonctionnel pour l'offre ${offerId}, passage à l'offre suivante`
    );
    currentOfferIndex++; // Incrémente l'index pour passer à l'offre suivante

    // Sauvegarder l'index actuel dans le stockage local
    chrome.storage.local.set({ currentOfferIndex }, () => {
      console.log(`Index actuel sauvegardé : ${currentOfferIndex}`);
      handleOffers(); // Passe à l'offre suivante
    });
  }
}

function extractProductDetails() {
  const productDetails = {};

  // Sélection des éléments dans le DOM
  productDetails.eventName = document
    .querySelector('[data-qa="event-title"]')
    .textContent.trim();
  productDetails.price = document
    .querySelector('[data-qa="event-price"]')
    .textContent.trim();
  productDetails.date = document
    .querySelector('[data-qa="event-date"]')
    .textContent.trim();
  productDetails.venue = document
    .querySelector('[data-qa="venue-address"]')
    .textContent.trim();
  productDetails.category = document
    .querySelector('[data-qa="price-category"]')
    .textContent.trim();
  productDetails.seatInfo = document
    .querySelector('[data-qa="seat-information"]')
    .textContent.trim();
  productDetails.imageUrl = document.querySelector(".square-image img").src;

  return productDetails;
}

function sendMessageToBackground(productDetails) {
  const message = {
    action: "notify",
    productDetails: productDetails,
  };
  chrome.runtime.sendMessage(message, function (response) {
    console.log("Message envoyé à background.js");
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

    // Extraire les détails du produit et envoyer la notification
    const productDetails = extractProductDetails();
    sendMessageToBackground(productDetails);

    notificationSent = true;
    stopCheckingOffers();
  } else if (window.location.href.includes("offerId")) {
    console.log(
      "Sur une page avec offerId, vérification du bouton de paiement..."
    );

    // Vérifier la protection contre les robots après redirection
    if (!checkForBotProtection()) {
      setTimeout(() => {
        checkAndClickPaymentButton();
      }, pageLoadDelay); // Délai pour laisser la page se charger complètement
    }
  }
}

function startCheckingOffers() {
  console.log("Démarrage de la vérification des offres...");

  // Charger les offres et l'index actuel à partir du stockage local
  chrome.storage.local.get(["offersList", "currentOfferIndex"], (result) => {
    if (result.offersList && result.currentOfferIndex !== undefined) {
      offersList = result.offersList;
      currentOfferIndex = result.currentOfferIndex;
      console.log(
        "Offres et index actuel restaurés à partir du stockage local."
      );
    }
  });

  intervalId = setInterval(() => {
    checkIfOnCheckoutPage();
  }, 1000);

  if (!window.location.href.includes("checkout.html")) {
    offersCheckIntervalId = setInterval(() => {
      console.log("Vérification des offres via l'API...");
      fetchOffers();
    }, 7000);
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
