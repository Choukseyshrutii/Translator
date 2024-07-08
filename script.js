
const fromText = document.querySelector(".from-text"),
toText = document.querySelector(".to-text"),
exchangeIcon = document.querySelector(".exchange"),
selectTag = document.querySelectorAll("select"),
icons = document.querySelectorAll(".row i"),
translateBtn = document.querySelector("button");


selectTag.forEach((tag, id) => {
    for (let country_code in countries) {
        let selected = id == 0 ? country_code == "en-GB" ? "selected" : "" : country_code == "hi-IN" ? "selected" : "";
        let option = `<option ${selected} value="${country_code}">${countries[country_code]}</option>`;
        tag.insertAdjacentHTML("beforeend", option);
    }
});

exchangeIcon.addEventListener("click", () => {
    let tempText = fromText.value,
    tempLang = selectTag[0].value;
    fromText.value = toText.value;
    toText.value = tempText;
    selectTag[0].value = selectTag[1].value;
    selectTag[1].value = tempLang;
});

fromText.addEventListener("keyup", () => {
    if(!fromText.value) {
        toText.value = "";
    }
});

translateBtn.addEventListener("click", () => {
    let text = fromText.value.trim(),
    translateFrom = selectTag[0].value,
    translateTo = selectTag[1].value;
    if(!text) return;
    toText.setAttribute("placeholder", "Translating...");
    let apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=${translateFrom}|${translateTo}`;
    fetch(apiUrl).then(res => res.json()).then(data => {
        toText.value = data.responseData.translatedText;
        data.matches.forEach(data => {
            if(data.id === 0) {
                toText.value = data.translation;
            }
        });
        toText.setAttribute("placeholder", "Translation");
    });
});


icons.forEach(icon => {
    icon.addEventListener("click", ({ target }) => {
        if (!fromText.value.trim() || !toText.value.trim()) return;
        if (target.classList.contains("fa-copy")) {
            // Copy text to clipboard
            let textToCopy = target.id === "from" ? fromText.value : toText.value;
            navigator.clipboard.writeText(textToCopy)
                .then(() => console.log(`Copied ${textToCopy} to clipboard`))
                .catch(err => console.error("Copy failed:", err));
        } else if (target.classList.contains("fa-volume-up")) {
            // Speak text using SpeechSynthesis
            let utterance;
            if (target.id === "from") {
                utterance = new SpeechSynthesisUtterance(fromText.value);
                utterance.lang = selectTag[0].value;
            } else {
                utterance = new SpeechSynthesisUtterance(toText.value);
                utterance.lang = selectTag[1].value;
            }
            let selectedVoice = getVoiceByLang(utterance.lang);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
                speechSynthesis.speak(utterance);
            } else {
                console.warn(`No voice available for language: ${utterance.lang}`);
            }
        }
    });
});

// Function to populate the voice list and select the appropriate voice by language
function getVoiceByLang(lang) {
    const voices = speechSynthesis.getVoices();
    let selectedVoice = voices.find(voice => voice.lang === lang);
    if (!selectedVoice) {
        // Fallback to the base language (e.g., 'en' for 'en-GB')
        selectedVoice = voices.find(voice => voice.lang.startsWith(lang.split('-')[0]));
    }
    return selectedVoice || null;
}

// Ensure the voice list is populated when the page loads
window.addEventListener('DOMContentLoaded', () => {
    // Wait for voices to be loaded before populating the list
    populateVoiceList();
});

// Function to populate the list of available voices
function populateVoiceList() {
    const voices = speechSynthesis.getVoices();
    console.log("Available voices:");
    voices.forEach(voice => {
        console.log(voice.name + ' (' + voice.lang + ')');
    });
}
  
icons.forEach(icon => {
    icon.addEventListener("click", ({target}) => {
        if(!fromText.value || !toText.value) return;
        if(target.classList.contains("fa-copy")) {
            if(target.id == "from") {
                navigator.clipboard.writeText(fromText.value);
            } else {
                navigator.clipboard.writeText(toText.value);
            }
        } else {
            let utterance;
            if(target.id == "from") {
                utterance = new SpeechSynthesisUtterance(fromText.value);
                utterance.lang = selectTag[0].value;
            } else {
                utterance = new SpeechSynthesisUtterance(toText.value);
                utterance.lang = selectTag[1].value;
            }
            speechSynthesis.speak(utterance);
        }
    });
});