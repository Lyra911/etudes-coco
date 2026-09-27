// ==========================================
// CONFIGURATION DU TUTEUR INTELLIGENT (VERSION CHAT INTERACTIF)
// ==========================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxiYjUFiKCnT_Vmm8Ptzuh1Lw8WzyrlTBZ1Hm0dvPYYsAEXzEfge_a9UNJ6nNpa4gnO2g/exec";

// Historique de la conversation pour que le tuteur se souvienne des échanges
let historiqueConversation = [];

async function envoyerAuTuteur(promptTexte) {
  const parentEmails = localStorage.getItem('etudes_parent_emails') || '';

  const payload = {
    prompt: promptTexte,
    emails: parentEmails
  };

  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (data.response) {
      return data.response;
    } else if (data.error) {
      console.error("Erreur du tuteur :", data.error);
      return "Oups ! Le tuteur rencontre un petit problème technique. Réessaie dans un moment !";
    } else {
      return typeof data === 'string' ? data : "Réponse reçue du tuteur.";
    }
  } catch (error) {
    console.error("Erreur de connexion :", error);
    return "Impossible de contacter le tuteur. Vérifie ta connexion Internet.";
  }
}

// Fonction pour initialiser l'interface de discussion du tuteur (Chat sous la réponse)
function initialiserTuteurUI(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div style="background: #ffffff; border: 2px solid #cbd5e1; border-radius: 12px; margin-top: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); display: flex; flex-direction: column; overflow: hidden; max-width: 100%;">
      <div style="background: #f8fafc; padding: 12px 16px; border-bottom: 1px solid #e2e8f0;">
        <h3 style="color: #0f172a; margin-bottom: 2px; font-size: 1.1rem;">🦉 Tuteur Intelligent</h3>
        <p style="font-size: 0.85rem; color: #64748b;">Pose tes questions ou réponds aux exercices du tuteur ici !</p>
      </div>

      <!-- Zone où les messages défilent -->
      <div id="tuteur-messages" style="padding: 16px; max-height: 350px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: #ffffff;">
        <div style="background: #f1f5f9; padding: 10px 14px; border-radius: 8px; color: #1e293b; font-size: 0.95rem; align-self: flex-start; max-width: 85%;">
          🦉 Bonjour ! Je suis ton tuteur. Comment puis-je t'aider aujourd'hui ? (Tu peux me coller un exercice ou me poser une question).
        </div>
      </div>

      <!-- Zone de saisie TOUJOURS EN DESSOUS -->
      <div style="display: flex; padding: 12px; background: #f8fafc; border-top: 1px solid #e2e8f0; gap: 8px;">
        <input type="text" id="tuteur-input" placeholder="Écris ta réponse ou ta question ici..." style="flex: 1; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; outline: none;" onkeydown="if(event.key === 'KeyA' && event.ctrlKey) {} else if(event.key === 'Enter') poserQuestionTuteur();" />
        <button onclick="poserQuestionTuteur()" style="background: #0284c7; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: background 0.2s;">Envoyer ➔</button>
      </div>
    </div>
  `;
}

async function poserQuestionTuteur() {
  const input = document.getElementById('tuteur-input');
  const messagesContainer = document.getElementById('tuteur-messages');
  const texte = input.value.trim();

  if (!texte) return;

  // 1. Afficher le message de l'utilisateur dans le chat
  const userBubble = document.createElement('div');
  userBubble.style.cssText = "background: #dbeafe; padding: 10px 14px; border-radius: 8px; color: #1e293b; font-size: 0.95rem; align-self: flex-end; max-width: 85%; word-break: break-word;";
  userBubble.innerText = texte;
  messagesContainer.appendChild(userBubble);

  input.value = ""; // Vider le champ
  messagesContainer.scrollTop = messagesContainer.scrollHeight; // Descendre en bas

  // 2. Afficher un indicateur "Le tuteur réfléchit..."
  const loadingBubble = document.createElement('div');
  loadingBubble.id = "tuteur-loading";
  loadingBubble.style.cssText = "background: #f1f5f9; padding: 10px 14px; border-radius: 8px; color: #64748b; font-size: 0.95rem; align-self: flex-start; font-style: italic;";
  loadingBubble.innerHTML = "🦉 <em>Le tuteur réfléchit...</em>";
  messagesContainer.appendChild(loadingBubble);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // 3. Envoyer au tuteur (en combinant l'historique si besoin)
  historiqueConversation.push("Élève : " + texte);
  const promptGlobal = historiqueConversation.join("\n");

  const reponseAI = await envoyerAuTuteur(promptGlobal);
  
  // Supprimer l'indicateur de chargement
  const loadingElem = document.getElementById('tuteur-loading');
  if (loadingElem) loadingElem.remove();

  historiqueConversation.push("Tuteur : " + reponseAI);

  // 4. Afficher la réponse du tuteur dans le chat en dessous
  const aiBubble = document.createElement('div');
  aiBubble.style.cssText = "background: #f1f5f9; padding: 10px 14px; border-radius: 8px; color: #1e293b; font-size: 0.95rem; align-self: flex-start; max-width: 85%; word-break: break-word; line-height: 1.4;";
  aiBubble.innerHTML = "<strong>🦉 Tuteur :</strong><br>" + reponseAI.replace(/\n/g, '<br>');
  messagesContainer.appendChild(aiBubble);

  // Faire défiler vers le bas automatiquement
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
