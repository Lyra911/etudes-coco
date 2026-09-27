// ==========================================
// CONFIGURATION DU TUTEUR INTELLIGENT
// ==========================================
// Remplacez l'URL ci-dessous par l'URL de votre déploiement Web Google Apps Script
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxiYjUFiKCnT_Vmm8Ptzuh1Lw8WzyrlTBZ1Hm0dvPYYsAEXzEfge_a9UNJ6nNpa4gnO2g/exec";

// Fonction principale pour envoyer un message au tuteur
async function envoyerAuTuteur(promptTexte) {
  // Récupérer les courriels des parents enregistrés dans le navigateur (Espace Parent)
  const parentEmails = localStorage.getItem('etudes_parent_emails') || '';

  const payload = {
    prompt: promptTexte,
    emails: parentEmails
  };

  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      contentType: "application/json",
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (data.status === "success") {
      return data.response;
    } else {
      console.error("Erreur du tuteur :", data.message);
      return "Oups ! Le tuteur rencontre un petit problème technique. Réessaie dans un moment !";
    }
  } catch (error) {
    console.error("Erreur de connexion :", error);
    return "Impossible de contacter le tuteur. Vérifie ta connexion Internet.";
  }
}

// Fonction pour initialiser l'interface de discussion du tuteur sur vos pages de jeux
function initialiserTuteurUI(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div style="background: #ffffff; border: 2px solid #cbd5e1; border-radius: 12px; padding: 16px; margin-top: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <h3 style="color: #0f172a; margin-bottom: 8px; font-size: 1.1rem;">🦉 Pose ta question au Tuteur</h3>
      <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 12px;">Bloquée sur une notion ou un exercice ? Demande de l'aide ici !</p>
      <textarea id="tuteur-input" placeholder="Écris ta question ou colle ton problème ici..." style="width: 100%; height: 80px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; resize: vertical; box-sizing: border-box;"></textarea>
      <button onclick="poserQuestionTuteur()" style="background: #0284c7; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 8px;">Envoyer au tuteur ➔</button>
      <div id="tuteur-reponse" style="margin-top: 12px; font-size: 0.95rem; line-height: 1.4; color: #1e293b; background: #f8fafc; padding: 10px; border-radius: 8px; display: none;"></div>
    </div>
  `;
}

// Action déclenchée au clic sur le bouton d'envoi
async function poserQuestionTuteur() {
  const input = document.getElementById('tuteur-input');
  const reponseBox = document.getElementById('tuteur-reponse');
  const texte = input.value.trim();

  if (!texte) {
    alert("Écris d'abord une question !");
    return;
  }

  reponseBox.style.display = "block";
  reponseBox.innerHTML = "🦉 <em>Le tuteur réfléchit...</em>";

  const reponseAI = await envoyerAuTuteur(texte);
  
  reponseBox.innerHTML = "<strong>🦉 Tuteur :</strong><br>" + reponseAI.replace(/\n/g, '<br>');
}
