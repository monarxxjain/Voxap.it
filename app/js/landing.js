const createButton = document.querySelector("#createroom");
const videoCont = document.querySelector(".video-self");
const codeCont = document.querySelector("#roomcode");
const joinBut = document.querySelector("#joinroom");
const mic = document.querySelector("#mic");
const cam = document.querySelector("#webcam");
const originalSpeech = document.querySelector("#localTranscript");
const translatedSpeech = document.querySelector("#localTranslation");

let micAllowed = true;
let camAllowed = true;

let mediaConstraints = { video: true, audio: true };
let speechRecognizerPointer;

const translateText = (text, base) => {
    const apiKey = "0ebadbdadd4e41f2b4810888cfa9f26f";
    const fromLanguage = base.substring(0, 2);
    const toLanguageSelect = document.getElementById("languageSelect");
    const toLanguage = toLanguageSelect.value;
    const translationEndpoint = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${fromLanguage}&to=${toLanguage}`;

    fetch(translationEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": apiKey,
            "Ocp-Apim-Subscription-Region": "francecentral", // Esempio: 'westeurope'
        },
        body: JSON.stringify([{ text }]),
    })
        .then((response) => response.json())
        .then((translations) => {
            const translation = translations[0].translations[0].text;
            translatedSpeech.innerText = translation;
        })
        .catch((error) => {
            console.error(
                "Si è verificato un errore durante la traduzione:",
                error
            );
        });
};

const languageSelect = document.getElementById("languageSelect");
    const outputDiv = document.getElementById("output");
    const parolaCorrenteDiv = document.getElementById("parolaCorrente");
    let fraseCorrente = "";
    let isTranslating = false;

    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        let recognition = new (window.webkitSpeechRecognition ||
            window.SpeechRecognition)();
        let selectedLanguage = languageSelect.value;
        languageSelect.addEventListener("click", function () {
            selectedLanguage = languageSelect.value;
            // switch (selectedLanguage) {
            //     case 'en':
            //         recognition.lang = 'en-US'
            //         break;
            //     case 'fr':
            //         recognition.lang = 'fr-FR'
            //         break;
            //     case 'de':
            //         recognition.lang = 'de-DE'
            //         break;
            //     case 'es':
            //         recognition.lang = 'es-ES'
            //         break;
            //     case 'hi':
            //         recognition.lang = 'en-US'
            //         break;
            //     case 'it':
            //         recognition.lang = 'it-IT'
            //         break;
            //     default:
            //         recognition.lang = 'it-IT'
            //         break;
            // }
            // recognition.lang = 'it-IT'
        });
        recognition.lang = "it-IT";
        recognition.interimResults = true;

        recognition.onresult = async (event) => {
            let transcript = "";
            for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript + " ";
            }
            parolaCorrenteDiv.textContent = transcript;

            const translationResponse = await fetch(
                `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${selectedLanguage}&dt=t&q=${encodeURIComponent(
                    transcript
                )}`
            );
            const translationData = await translationResponse.json();
            const translation = translationData[0][0][0];

            fraseCorrente = translation;
            isTranslating = true;

            outputDiv.textContent = `${fraseCorrente}`;
            socket.emit("send_message", fraseCorrente);
        };

        recognition.onend = () => {
            // if (isTranslating) {
            recognition.start();
            // } else {
            //   outputDiv.innerHTML = '...';
            // }
        };

        recognition.onerror = (event) => {
            console.error("Errore di riconoscimento vocale: ", event.error);
        };

        recognition.start();
    } else {
        console.error("Il browser non supporta la Web Speech API.");
    }

const handleStream = (stream) => {
    const audioConfig = SpeechSDK.AudioConfig.fromStreamInput(stream);
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
        "e47aade917b2431faec9fe85ca34adf4",
        "francecentral"
    );
    const autoDetectSourceLanguageConfig =
        SpeechSDK.AutoDetectSourceLanguageConfig.fromLanguages([
            "en-US",
            "it-IT",
            "zh-CN",
        ]);
    let speechRecognizer = new SpeechSDK.SpeechRecognizer.FromConfig(
        speechConfig,
        autoDetectSourceLanguageConfig,
        audioConfig
    );
    speechRecognizer.recognizing = (s, e) => {
        translateText(e.result.text, e.result.language);
        originalSpeech.innerText = e.result.text;
    };
    speechRecognizer.recognized = (s, e) => {
        if (e.result.reason == SpeechSDK.ResultReason.RecognizedSpeech) {
            translateText(e.result.text, e.result.language);
            originalSpeech.innerText = e.result.text;
        }
    };

    speechRecognizer.canceled = (s, e) => {
        console.log(`CANCELED: Reason=${e.reason}`);

        if (e.reason == SpeechSDK.CancellationReason.Error) {
            console.log(`"CANCELED: ErrorCode=${e.errorCode}`);
            console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`);
            console.log(
                "CANCELED: Did you set the speech resource key and region values?"
            );
        }
        speechRecognizer.stopContinuousRecognitionAsync();
    };

    speechRecognizer.sessionStopped = () => {
        console.log("\n    Session stopped event.");
        speechRecognizer.stopContinuousRecognitionAsync();
    };
    speechRecognizerPointer = speechRecognizer;
    speechRecognizer.startContinuousRecognitionAsync();
};

navigator.mediaDevices.getUserMedia(mediaConstraints).then((localstream) => {
    videoCont.srcObject = localstream;
    handleStream(localstream);
});

function uuidv4() {
    return "xxyxyxxyx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

const createroomtext = "Creating Room...";

createButton.addEventListener("click", (e) => {
    e.preventDefault();
    createButton.disabled = true;
    createButton.innerHTML = "Creating Room";
    createButton.classList = "createroom-clicked";

    setInterval(() => {
        if (createButton.innerHTML < createroomtext) {
            createButton.innerHTML = createroomtext.substring(
                0,
                createButton.innerHTML.length + 1
            );
        } else {
            createButton.innerHTML = createroomtext.substring(
                0,
                createButton.innerHTML.length - 3
            );
        }
    }, 500);

    //const name = nameField.value;
    location.href = `room.html?room=${uuidv4()}`;
});

joinBut.addEventListener("click", (e) => {
    e.preventDefault();
    if (codeCont.value.trim() == "") {
        codeCont.classList.add("roomcode-error");
        return;
    }
    const code = codeCont.value;
    location.href = `room.html?room=${code}`;
});

codeCont.addEventListener("change", (e) => {
    e.preventDefault();
    if (codeCont.value.trim() !== "") {
        codeCont.classList.remove("roomcode-error");
        return;
    }
});

cam.addEventListener("click", () => {
    if (camAllowed) {
        mediaConstraints = { video: false, audio: micAllowed ? true : false };
        navigator.mediaDevices
            .getUserMedia(mediaConstraints)
            .then((localstream) => {
                videoCont.srcObject = localstream;
            });

        cam.classList = "nodevice";
        cam.innerHTML = `<i class="fas fa-video-slash"></i>`;
    } else {
        mediaConstraints = { video: true, audio: micAllowed ? true : false };
        navigator.mediaDevices
            .getUserMedia(mediaConstraints)
            .then((localstream) => {
                videoCont.srcObject = localstream;
            });

        cam.classList = "device";
        cam.innerHTML = `<i class="fas fa-video"></i>`;
    }
    camAllowed = !camAllowed;
});

mic.addEventListener("click", () => {
    if (micAllowed) {
        speechRecognizerPointer.stopContinuousRecognitionAsync(
            () => {
                mediaConstraints = {
                    video: camAllowed ? true : false,
                    audio: false,
                };
                navigator.mediaDevices
                    .getUserMedia(mediaConstraints)
                    .then((localstream) => {
                        videoCont.srcObject = localstream;
                    });

                mic.classList = "nodevice";
                mic.innerHTML = `<i class="fas fa-microphone-slash"></i>`;
                originalSpeech.style.display = "none";
                translatedSpeech.style.display = "none";
            },
            (e) => {
                console.log(e);
            }
        );
    } else {
        mediaConstraints = { video: camAllowed ? true : false, audio: true };
        navigator.mediaDevices
            .getUserMedia(mediaConstraints)
            .then((localstream) => {
                videoCont.srcObject = localstream;
                mic.innerHTML = `<i class="fas fa-microphone"></i>`;
                mic.classList = "device";
                originalSpeech.style.display = "block";
                translatedSpeech.style.display = "block";
                handleStream(localstream);
            });
    }
    micAllowed = !micAllowed;
});

setTimeout(() => {
    
}, 1000);
