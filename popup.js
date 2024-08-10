document.getElementById("start").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    console.log("Envoi du message start au content script");
    chrome.tabs.sendMessage(tabs[0].id, { action: "start" }, (response) => {
      console.log("Réponse du content script:", response);
    });
    document.getElementById("status").innerText = "Started";
  });
});

document.getElementById("stop").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    console.log("Envoi du message stop au content script");
    chrome.tabs.sendMessage(tabs[0].id, { action: "stop" }, (response) => {
      console.log("Réponse du content script:", response);
    });
    document.getElementById("status").innerText = "Stopped";
  });
});

console.log("Script popup.js chargé");
