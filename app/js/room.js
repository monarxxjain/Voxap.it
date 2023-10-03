// const socket = io("https://video-rbaq.onrender.com");
const socket = io();
const myvideo = document.querySelector("#vd1");
const roomid = params.get("room");
let username;
const chatRoom = document.querySelector(".chat-cont");
const sendButton = document.querySelector(".chat-send");
const messageField = document.querySelector(".chat-input");
const videoContainer = document.querySelector("#vcont");
const overlayContainer = document.querySelector("#overlay");
const continueButt = document.querySelector(".continue-name");
const nameField = document.querySelector("#name-field");
const videoButt = document.querySelector(".novideo");
const audioButt = document.querySelector(".audio");
const screenShareButt = document.querySelector(".screenshare");
const fileInput = document.querySelector("#targetFile");
const previewBackground = document.querySelector(".preview-background");
const closePreviewDiv = document.querySelector("#preview-close");
let remoteSid="";
const closePreview = () => {
	let filePreview = document.querySelector("#filePreview");
	if (filePreview) {
		filePreview.remove();
	}
	previewBackground.classList.add("isHidden");
}
closePreviewDiv.addEventListener("click", () => {
	closePreview();
});

//Mobile select
const flag = document.getElementById("selLangMobile");
const mobileSelect = document.getElementById("languageSelectMobile");
let mobileSelectIsHidden = true;
flag.addEventListener("click", () => {
    if (mobileSelectIsHidden) {
        mobileSelect.classList.remove("hide-select-mobile");
    } else {
        mobileSelect.classList.add("hide-select-mobile");
    }
    mobileSelectIsHidden = !mobileSelectIsHidden;
});

//Keep select changes consistent
const desktopSelect = document.getElementById("languageSelect");
desktopSelect.addEventListener("change", () => {
    mobileSelect.value = desktopSelect.value;
});
mobileSelect.addEventListener("change", () => {
    desktopSelect.value = mobileSelect.value;
});

//whiteboard js start
const whiteboardCont = document.querySelector(".whiteboard-cont");
const canvas = document.querySelector("#whiteboard");
const ctx = canvas.getContext("2d");

let boardVisisble = false;

whiteboardCont.style.visibility = "hidden";

let isDrawing = 0;
let x = 0;
let y = 0;
let color = "black";
let drawsize = 3;
let colorRemote = "black";
let drawsizeRemote = 3;

function fitToContainer(canvas) {
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

fitToContainer(canvas);

//getCanvas call is under join room call
socket.on("getCanvas", (url) => {
    let img = new Image();
    img.onload = start;
    img.src = url;

    function start() {
        ctx.drawImage(img, 0, 0);
    }

    console.log("got canvas", url);
});

function setColor(newcolor) {
    color = newcolor;
    drawsize = 3;
}

function setEraser() {
    color = "white";
    drawsize = 10;
}

//might remove this
function reportWindowSize() {
    fitToContainer(canvas);
}

window.onresize = reportWindowSize;
//

function clearBoard() {
    if (
        window.confirm(
            "Are you sure you want to clear board? This cannot be undone"
        )
    ) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        socket.emit("store canvas", canvas.toDataURL());
        socket.emit("clearBoard");
    } else return;
}

socket.on("clearBoard", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

function draw(newx, newy, oldx, oldy) {
    ctx.strokeStyle = color;
    ctx.lineWidth = drawsize;
    ctx.beginPath();
    ctx.moveTo(oldx, oldy);
    ctx.lineTo(newx, newy);
    ctx.stroke();
    ctx.closePath();

    socket.emit("store canvas", canvas.toDataURL());
}

function drawRemote(newx, newy, oldx, oldy) {
    ctx.strokeStyle = colorRemote;
    ctx.lineWidth = drawsizeRemote;
    ctx.beginPath();
    ctx.moveTo(oldx, oldy);
    ctx.lineTo(newx, newy);
    ctx.stroke();
    ctx.closePath();
}

canvas.addEventListener("mousedown", (e) => {
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = 1;
});

canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
        draw(e.offsetX, e.offsetY, x, y);
        socket.emit("draw", e.offsetX, e.offsetY, x, y, color, drawsize);
        x = e.offsetX;
        y = e.offsetY;
    }
});

window.addEventListener("mouseup", (e) => {
    if (isDrawing) {
        isDrawing = 0;
    }
});

socket.on("draw", (newX, newY, prevX, prevY, color, size) => {
    colorRemote = color;
    drawsizeRemote = size;
    drawRemote(newX, newY, prevX, prevY);
});

//whiteboard js end

let videoAllowed = true;
let audioAllowed = true;

let micInfo = {};
let videoInfo = {};

let videoTrackReceived = {};

let mymuteicon = document.querySelector("#mymuteicon");
mymuteicon.style.visibility = "hidden";

let myvideooff = document.querySelector("#myvideooff");
myvideooff.style.visibility = "hidden";

const configuration = { iceServers: [{ urls: "stun:stun.stunprotocol.org" }] };

const mediaConstraints = { video: true, audio: true };

let connections = {};
let cName = {};
let audioTrackSent = {};
let videoTrackSent = {};
let dataChannels = {};

let mystream, myscreenshare;

document.querySelector(".roomcode").innerHTML = `${window.location.origin}/room.html?room=${roomid}`;

// funzione copia link di cui sopra
function CopyClassText() {
    var textToCopy = document.querySelector(".roomcode");
    var currentRange;
    if (document.getSelection().rangeCount > 0) {
        currentRange = document.getSelection().getRangeAt(0);
        window.getSelection().removeRange(currentRange);
    } else {
        currentRange = false;
    }

    var CopyRange = document.createRange();
    CopyRange.selectNode(textToCopy);
    window.getSelection().addRange(CopyRange);
    document.execCommand("copy");

    window.getSelection().removeRange(CopyRange);

    if (currentRange) {
        window.getSelection().addRange(currentRange);
    }

	// fa apparire la finestra di condivisione
            if (navigator.share) {
                navigator.share({
                    title: 'Link to the virtual room',
                    url: window.location.href // Ottiene l'URL della pagina corrente
                }).then(() => {
                    console.log('Link condiviso con successo!');
                }).catch((error) => {
                    console.error('Errore nella condivisione del link:', error);
                });
            } else {
                console.warn('L\'API di condivisione non è supportata su questo dispositivo.');
            }
	
	// modifica la scritta sul tasto
    document.querySelector(".copycode-button").textContent = "Let's go!";
    setTimeout(() => {
        document.querySelector(".copycode-button").innerHTML = '<i class="fas fa-user-plus"></i> Invite';
    }, 5000);
}


continueButt.addEventListener("click", () => {
    if (nameField.value == "") return;
    username = nameField.value;
    overlayContainer.style.visibility = "hidden";
    document.querySelector("#myname").innerHTML = `${username} (You)`;
    socket.emit("join room", roomid, username);
});

nameField.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        continueButt.click();
    }
});

socket.on("user count", (count) => {
    if (count > 1) {
        videoContainer.className = "video-cont";
    } else {
        videoContainer.className = "video-cont-single";
    }
});

let peerConnection;

function handleGetUserMediaError(e) {
    switch (e.name) {
        case "NotFoundError":
            alert(
                "Unable to open your call because no camera and/or microphone" +
                    "were found."
            );
            break;
        case "SecurityError":
        case "PermissionDeniedError":
            break;
        default:
            alert("Error opening your camera and/or microphone: " + e.message);
            break;
    }
}

function reportError(e) {
    console.log(e);
    return;
}

const adjustGrid = () => {
    let count = document.getElementsByClassName("video-cont-container").length;
    let gridDiv = document.getElementsByClassName("video-cont")[0];
    if (count < 3) {
        if (window.innerWidth <= 768) {
            gridDiv.style.gridTemplateColumns = "1fr";
            gridDiv.style.gridTemplateRows = "47% 47%";
        } else {
            gridDiv.style.gridTemplateColumns = "1fr 1fr";
            gridDiv.style.gridTemplateRows = "1fr";
        }
        let videoBoxes = document.getElementsByClassName("video-box");
        for (let i = 0; i< videoBoxes.length; i++) {
            videoBoxes[i].style.height = "85%";
        }
        return;
    }
    gridDiv.style.gridTemplateColumns = "47% 47%";
    let division;
    if (count % 2 === 1) {
        division = Math.floor(count / 2) + 1;
    } else {
        division = count / 2;
    }
    const num = 90 / division - 3;
    console.log(division);
    let rows = "";
    for (let i = 0; i < division; i++) {
        rows+= i === division - 1 ? `${num}%` : `${num}% `;
    }
    gridDiv.style.gridTemplateRows = rows;
    let videoBoxes = document.getElementsByClassName("video-box");
    if (count >= 3) {
        for (let i = 0; i< videoBoxes.length; i++) {
            videoBoxes[i].style.height = `${100 - division * 10}%`;
        }
    }
}

function startCall() {
    navigator.mediaDevices
        .getUserMedia(mediaConstraints)
        .then((localStream) => {
            myvideo.srcObject = localStream;
            myvideo.muted = true;

            localStream.getTracks().forEach((track) => {
                for (let key in connections) {
                    connections[key].addTrack(track, localStream);
                    if (track.kind === "audio") audioTrackSent[key] = track;
                    else videoTrackSent[key] = track;
                }
            });
            handleStream(localStream, null);
        })
        .catch(handleGetUserMediaError);
}

let filesStack = {};

const getFileSize = (size) => {
	let unit = "";
	let num = 0;
	if (size < 999) {
		num = size;
		unit = "B";
	} else if (size < 999999) {
		num = size / 1000;
		unit = "KB";
	} else {
		num = size / 1000000;
		unit = "MB";
	}
	return `${num.toFixed(2)}${unit}`;
}

const createPreview = (filetype) => {
	let preview;
	if (filetype.includes("image")) {
		preview = document.createElement("img");
	} else {
		if (filetype.includes("video")) {
			preview = document.createElement("video");	
		} else {
			preview = document.createElement("iframe");
		}
		preview.style.width = "100%";
	}
	preview.id = "filePreview";
	let previewDiv = document.querySelector(".preview");
	previewDiv.append(preview);
	return preview;
};

const createFileMessage = (sid, filename, filesize, sentTime, senderName, filetype, ownUrl) => {
	let message = document.createElement("div");
	let info = document.createElement("div");
	let userNameDiv = document.createElement("div");
	let time = document.createElement("div");
	let content = document.createElement("div");
	let filenameDiv = document.createElement("div");
	let filesizeDiv = document.createElement("div");
	let hiddenInput = document.createElement("input");
    let buttonDiv = document.createElement("div");
    let previewButton = document.createElement("div");
    let downloadButton = document.createElement("a");
	if (sid) {
        const name = `${sid}-${filename}`;
        filesStack[sid] = name;
        hiddenInput.id = `${name}+input`;
        hiddenInput.value = filetype;
		message.classList.add("receiver");
        previewButton.id = name;
        downloadButton.id = `${name}+download`;
	} else {
		message.classList.add("sender");
	}

    previewButton.innerText = "Preview";
    downloadButton.innerText = "Download";
    downloadButton.download = filename;
    if (!sid) {
        downloadButton.href = ownUrl;
        previewButton.addEventListener("click", () => {
            let filePreview = document.getElementById("filePreview");
            if (!filePreview) {
                filePreview = createPreview(filetype);
            }
            filePreview.src = ownUrl;
            previewBackground.classList.remove("isHidden");
        });
    }
	hiddenInput.hidden = true;
	userNameDiv.innerText = senderName;
	const hours = new Date(sentTime).getHours();
	const minutes = new Date(sentTime).getMinutes();
	time.innerText = `${hours > 12 ? hours - 12 : hours >= 10 ? hours : `0${hours}`}:${minutes >= 10 ? minutes : `0${minutes}`} ${hours >= 12 ? "PM" : "AM"}`;
	filenameDiv.innerText = filename;
	filesizeDiv.innerText = getFileSize(filesize);
	
	message.classList.add("message");
	info.classList.add("info");
	userNameDiv.classList.add("username");
	time.classList.add("time");
	content.classList.add("content");
	filesizeDiv.classList.add("size");
    buttonDiv.classList.add("file-options");

    buttonDiv.append(previewButton, downloadButton);
	info.append(userNameDiv, time);
	content.append(filenameDiv, filesizeDiv);
	message.append(info, content, hiddenInput, buttonDiv);
	chatRoom.scrollTop = chatRoom.scrollHeight;
	chatRoom.append(message);
}

let sizes = {};
let slices = {};
let receivedSize = {};

const createChannel = (peer, sid) => {
	const channel = peer.createDataChannel(roomid, {
		negotiated: true,
		id: 5
	});
    channel.binaryType = "arraybuffer";
	channel.onopen = () => {
		console.log("Channel is opened");
	}
	channel.onmessage = (event) => {
        try {
            if (typeof event.data === "string") {
                const { senderName, filename, time, filesize, filetype } = JSON.parse(event.data);
                sizes[sid] = filesize;
                slices[sid] = [];
                receivedSize[sid] = 0;
			    createFileMessage(sid, filename, filesize, time, senderName, filetype, null);
            } else {
                receivedSize[sid]+= event.data.byteLength;
                slices[sid].push(event.data);
                if (receivedSize[sid] === sizes[sid]) {
                    const data = new Blob(slices[sid]);
                    const blobUrl = URL.createObjectURL(data);
                    const ele = document.getElementById(filesStack[sid]);
                    const eleInput = document.getElementById(filesStack[sid] + "+input");
                    const downloadButton = document.getElementById(filesStack[sid] + "+download");
                    downloadButton.href = blobUrl;
                    ele.addEventListener("click", () => {
                        let filePreview = document.getElementById("filePreview");
                        if (!filePreview) {
                            filePreview = createPreview(eleInput.value);
                        }
                        filePreview.src = blobUrl;
                        previewBackground.classList.remove("isHidden");
                    });
                    filesStack[sid] = null;
                    receivedSize[sid] = 0;
                    slices[sid] = [];
                    sizes[sid] = 0;
                }
                /* console.log("Reaches here");
                const data = new Blob([event.data]);
                const blobUrl = URL.createObjectURL(data);
                const ele = document.getElementById(filesStack[sid]);
                const eleInput = document.getElementById(filesStack[sid] + "+input");
                const downloadButton = document.getElementById(filesStack[sid] + "+download");
                downloadButton.href = blobUrl;
                ele.addEventListener("click", () => {
                    let filePreview = document.getElementById("filePreview");
                    if (!filePreview) {
                        filePreview = createPreview(eleInput.value);
                    }
                    filePreview.src = blobUrl;
                    previewBackground.classList.remove("isHidden");
                });
                filesStack[sid] = null; */
            }
        }
        catch (e) {
            console.log(e);
        }
	}
    console.log(sid);
	dataChannels[sid] = channel;
}

const createConnection = (connections, sid, isHandleVideoOffer) => {
    try {
        connections[sid] = new RTCPeerConnection(configuration);

        connections[sid].onicecandidate = function (event) {
            if (event.candidate) {
                console.log("icecandidate fired");
                socket.emit("new icecandidate", event.candidate, sid);
            }
        };

        connections[sid].ontrack = function (event) {
            if (!document.getElementById(sid)) {
                console.log("track event fired");
                let vidCont = document.createElement("div");
                let newvideo = document.createElement("video");
                let name = document.createElement("div");
                let muteIcon = document.createElement("div");
                let videoOff = document.createElement("div");
                let vidContContainer = document.createElement("div");
                let captionsDiv = document.createElement("div");
                let originalSpeech = document.createElement("div");
                let translatedSpeech = document.createElement("div");
                captionsDiv.classList.add("video-captions");
                originalSpeech.id = `originalSpeech-${sid}`;
                originalSpeech.classList.add("custom-style-1");
                translatedSpeech.id = `translatedSpeech-${sid}`;
                translatedSpeech.classList.add("custom-style-2");
                videoOff.classList.add("video-off");
                muteIcon.classList.add("mute-icon");
                name.classList.add("nametag");
                name.innerHTML = `${cName[sid]}`;
                vidContContainer.id = sid;
                remoteSid=sid;
                console.log(remoteSid)
                muteIcon.id = `mute${sid}`;
                videoOff.id = `vidoff${sid}`;
                muteIcon.innerHTML = `<i class="fas fa-microphone-slash"></i>`;
                videoOff.innerHTML = "Video Off";
                vidCont.classList.add("video-box");
                newvideo.classList.add("video-frame");
                vidContContainer.classList.add("video-cont-container");
                newvideo.autoplay = true;
                newvideo.playsInline = true;
                newvideo.id = `video${sid}`;
                newvideo.srcObject = event.streams[0];

                if (micInfo[sid] == "on") muteIcon.style.visibility = "hidden";
                else muteIcon.style.visibility = "visible";

                if (videoInfo[sid] == "on")
                    videoOff.style.visibility = "hidden";
                else videoOff.style.visibility = "visible";

                vidCont.appendChild(newvideo);
                vidCont.appendChild(name);
                vidCont.appendChild(muteIcon);
                vidCont.appendChild(videoOff);

                captionsDiv.appendChild(originalSpeech);
                captionsDiv.appendChild(translatedSpeech);

                vidContContainer.appendChild(vidCont);
                vidContContainer.appendChild(captionsDiv);

                videoContainer.appendChild(vidContContainer);

                adjustGrid();

                handleStream(event.streams[0], sid);
            }
        };

        connections[sid].onremovetrack = function (event) {
            if (document.getElementById(sid)) {
                document.getElementById(sid).remove();
                delete dataChannels[sid];
                console.log("removed a track");
            }
        };

        connections[sid].onnegotiationneeded = function () {
			createChannel(connections[sid], sid);
            connections[sid]
                .createOffer()
                .then(function (offer) {
                    return connections[sid].setLocalDescription(offer);
                })
                .then(function () {
                    socket.emit(
                        "video-offer",
                        connections[sid].localDescription,
                        sid
                    );
                })
                .catch(reportError);
        };

        if (isHandleVideoOffer) {
            let desc = new RTCSessionDescription(isHandleVideoOffer);

            connections[sid]
                .setRemoteDescription(desc)
                .then(() => {
                    return navigator.mediaDevices.getUserMedia(
                        mediaConstraints
                    );
                })
                .then((localStream) => {
                    localStream.getTracks().forEach((track) => {
                        connections[sid].addTrack(track, localStream);
                        console.log("added local stream to peer");
                        if (track.kind === "audio") {
                            audioTrackSent[sid] = track;
                            if (!audioAllowed)
                                audioTrackSent[sid].enabled = false;
                        } else {
                            videoTrackSent[sid] = track;
                            if (!videoAllowed)
                                videoTrackSent[sid].enabled = false;
                        }
                    });
                })
                .then(() => {
					createChannel(connections[sid], sid);
                    return connections[sid].createAnswer();
                })
                .then((answer) => {
                    return connections[sid].setLocalDescription(answer);
                })
                .then(() => {
                    socket.emit(
                        "video-answer",
                        connections[sid].localDescription,
                        sid
                    );
                })
                .catch(handleGetUserMediaError);
        }
    } catch (e) {
        console.log(e);
    }
};

function handleVideoOffer(offer, sid, cname, micinf, vidinf) {
    cName[sid] = cname;
    console.log("video offered recevied");
    micInfo[sid] = micinf;
    videoInfo[sid] = vidinf;

    createConnection(connections, sid, offer);
}

function handleNewIceCandidate(candidate, sid) {
    console.log("new candidate recieved");
    var newcandidate = new RTCIceCandidate(candidate);

    connections[sid].addIceCandidate(newcandidate).catch(reportError);
}

function handleVideoAnswer(answer, sid) {
    console.log("answered the offer");
    const ans = new RTCSessionDescription(answer);
    connections[sid].setRemoteDescription(ans);
}

//Thanks to (https://github.com/miroslavpejic85) for ScreenShare Code

let screenshareEnabled = false;
function screenShareToggle() {
    let screenMediaPromise;
    if (!screenshareEnabled) {
        if (navigator.getDisplayMedia) {
            screenMediaPromise = navigator.getDisplayMedia({ video: true });
        } else if (navigator.mediaDevices.getDisplayMedia) {
            screenMediaPromise = navigator.mediaDevices.getDisplayMedia({
                video: true,
            });
        } else {
            screenMediaPromise = navigator.mediaDevices.getUserMedia({
                video: { mediaSource: "screen" },
            });
        }
    } else {
        screenMediaPromise = navigator.mediaDevices.getUserMedia({
            video: true,
        });
    }
    screenMediaPromise
        .then((myscreenshare) => {
            screenshareEnabled = !screenshareEnabled;
            for (let key in connections) {
                const sender = connections[key]
                    .getSenders()
                    .find((s) => (s.track ? s.track.kind === "video" : false));
                sender.replaceTrack(myscreenshare.getVideoTracks()[0]);
            }
            myscreenshare.getVideoTracks()[0].enabled = true;
            const newStream = new MediaStream([
                myscreenshare.getVideoTracks()[0],
            ]);
            myvideo.srcObject = newStream;
            myvideo.muted = true;
            mystream = newStream;
            screenShareButt.innerHTML = screenshareEnabled
                ? `<i class="fas fa-desktop"></i><span class="tooltiptext">Stop Share Screen</span>`
                : `<i class="fas fa-desktop"></i><span class="tooltiptext">Share Screen</span>`;
            myscreenshare.getVideoTracks()[0].onended = function () {
                if (screenshareEnabled) screenShareToggle();
            };
        })
        .catch((e) => {
            alert("Unable to share screen:" + e.message);
            console.error(e);
        });
}

socket.on("video-offer", handleVideoOffer);

socket.on("new icecandidate", handleNewIceCandidate);

socket.on("video-answer", handleVideoAnswer);

socket.on("join room", async (conc, cnames, micinfo, videoinfo) => {
    socket.emit("getCanvas");
    if (cnames) cName = cnames;

    if (micinfo) micInfo = micinfo;

    if (videoinfo) videoInfo = videoinfo;

    if (conc) {
        await conc.forEach((sid) => {
            createConnection(connections, sid, null);
        });

        console.log("added all sockets to connections");
        startCall();
    } else {
        console.log("waiting for someone to join");
        navigator.mediaDevices
            .getUserMedia(mediaConstraints)
            .then((localStream) => {
                myvideo.srcObject = localStream;
                myvideo.muted = true;
                handleStream(localStream, null);
            })
            .catch(handleGetUserMediaError);
    }
});

socket.on("remove peer", (sid) => {
    if (document.getElementById(sid)) {
        document.getElementById(sid).remove();
        delete dataChannels[sid];
    }
    adjustGrid();
    delete connections[sid];
});

sendButton.addEventListener("click", () => {
    const msg = messageField.value;
    messageField.value = "";
    socket.emit("message", msg, username, roomid);
});

messageField.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        sendButton.click();
    }
});

socket.on("message", (msg, sendername, time) => {
    chatRoom.scrollTop = chatRoom.scrollHeight;
    chatRoom.innerHTML += `<div class="message ${sendername === username ? "sender" : "receiver"}">
    <div class="info">
        <div class="username">${sendername}</div>
        <div class="time">${time}</div>
    </div>
    <div class="content">
        ${msg}
    </div>
</div>`;
});

let videoButtons = document.getElementsByClassName("videoButton");
for (let i = 0; i < videoButtons.length; i++) {
    let ele = videoButtons[i];
    ele.addEventListener("click", () => {
        videoFunction(ele);
    });
}

function videoFunction(ele) {
    if (videoAllowed) {
        for (let key in videoTrackSent) {
            videoTrackSent[key].enabled = false;
        }
        ele.innerHTML = `<i class="fas fa-video-slash"></i>`;
        ele.style.backgroundColor = "#b12c2c";
        navigator.mediaDevices
            .getUserMedia({ video: false, audio: audioAllowed })
            .then((media) => {
                myvideo.srcObject = media;
                myvideooff.style.visibility = "visible";
                socket.emit("action", "videooff");
            });
    } else {
        for (let key in videoTrackSent) {
            videoTrackSent[key].enabled = true;
        }
        ele.innerHTML = `<i class="fas fa-video"></i>`;
        ele.style.backgroundColor = "#4ECCA3";
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: audioAllowed })
            .then((media) => {
                myvideo.srcObject = media;
                myvideooff.style.visibility = "hidden";
                socket.emit("action", "videoon");
            });
    }
    videoAllowed = !videoAllowed;
}

function audioFunction(ele) {
    let items = document.getElementsByClassName("userAudioTranscript");
    if (audioAllowed) {
        for (let key in audioTrackSent) {
            audioTrackSent[key].enabled = false;
        }
        ele.innerHTML = `<i class="fas fa-microphone-slash"></i>`;
        ele.style.backgroundColor = "#b12c2c";
		mymuteicon.style.visibility = "visible";
    } else {
        for (let key in audioTrackSent) {
            audioTrackSent[key].enabled = true;
        }
        ele.innerHTML = `<i class="fas fa-microphone"></i>`;
        ele.style.backgroundColor = "#4ECCA3";
        navigator.mediaDevices
            .getUserMedia({ audio: true, video: videoAllowed })
            .then(async (media) => {
                myvideo.srcObject = media;
                mymuteicon.style.visibility = "hidden";
                for (let i = 0; i < items.length; i++) {
                    items[i].style.display = "block";
                }
                socket.emit("action", "unmute");
                handleStream(media, null);
            });
    }
    audioAllowed = !audioAllowed;
}

let audios = document.getElementsByClassName("audioButton");
for (let i = 0; i < audios.length; i++) {
    let ele = audios[i];
    ele.addEventListener("click", () => {
        audioFunction(ele);
    });
}

socket.on("answer_message",async (msg)=>{
    if(remoteSid!==""){
        let selectedLanguage = languageSelect.value;
        const translationResponse = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${selectedLanguage}&dt=t&q=${encodeURIComponent(msg)}`);
        const translationData = await translationResponse.json();
        const translation = translationData[0][0][0]
        document.querySelector(`#${remoteSid} .custom-style-1`).textContent=msg
        document.querySelector(`#${remoteSid} .custom-style-2`).textContent=translation
    }
})

socket.on("action", (msg, sid) => {
    switch (msg) {
        case "mute":
            console.log(sid + " muted themself");
            document.querySelector(`#mute${sid}`).style.visibility = "visible";
            document.querySelector(`#originalSpeech-${sid}`).style.display =
                "none";
            document.querySelector(`#translatedSpeech-${sid}`).style.display =
                "none";
            micInfo[sid] = "off";
            break;
        case "unmute":
            console.log(sid + " unmuted themself");
            document.querySelector(`#mute${sid}`).style.visibility = "hidden";
            document.querySelector(`#originalSpeech-${sid}`).style.display =
                "block";
            document.querySelector(`#translatedSpeech-${sid}`).style.display =
                "block";
            micInfo[sid] = "on";
            break;
        case "videooff":
            console.log(sid + "turned video off");
            document.querySelector(`#vidoff${sid}`).style.visibility =
                "visible";
            videoInfo[sid] = "off";
            break;
        case "videoon":
            console.log(sid + "turned video on");
            document.querySelector(`#vidoff${sid}`).style.visibility = "hidden";
            videoInfo[sid] = "on";
            break;
    }
});

function whiteboardButton() {
    if (boardVisisble) {
        whiteboardCont.style.visibility = "hidden";
        boardVisisble = false;
    } else {
        whiteboardCont.style.visibility = "visible";
        boardVisisble = true;
    }
}

function leaveRoom() {
    location.href = "/";
}

function handleStream(audioStream, sid) {

}

const sendSlice = (offset, file, channel) => {
    const chunkSize = 16384;
    const fileReader = new FileReader();
    fileReader.addEventListener("load", e => {
        channel.send(e.target.result);
        offset+= e.target.result.byteLength;
        if (offset < file.size) {
            sendSlice(offset, file, channel);
        }
    });
    fileReader.addEventListener("error", (err) => {
        console.log(err);
    });
    fileReader.readAsArrayBuffer(file.slice(offset, offset + chunkSize));
}

fileInput.addEventListener("change", (e) => {
	const files = e.target.files;
	if (files && files.length > 0) {
		const keys = Object.keys(dataChannels);
		for (let j = 0; j < files.length; j++) {
			const file = files[j];
			const sentTime = Date.now();
            console.log(dataChannels, keys);
            for (let i = 0; i < keys.length; i++) {
                dataChannels[keys[i]].send(JSON.stringify({
                    senderName: username,
                    filename: file.name,
                    time: sentTime,
                    filesize: file.size,
                    filetype: file.type
                }));
                sendSlice(0, file, dataChannels[keys[i]]);
            }
            const fileReader = new FileReader();
            fileReader.onload = () => {
                createFileMessage(null, file.name, file.size, sentTime, username, file.type, URL.createObjectURL(new Blob([fileReader.result])));
            }
            fileReader.readAsArrayBuffer(file);
		}	
	}
});

setTimeout(() => {
    
let siteWidth = window.innerWidth;
console.log(siteWidth)
let languageSelect;
if(siteWidth>954){
    languageSelect = document.getElementById('languageSelect');
}
else{
    languageSelect = document.getElementById('languageSelectMobile');
}
const outputDiv = document.getElementById('output');
const parolaCorrenteDiv = document.getElementById('parolaCorrente');
let fraseCorrente = '';
let isTranslating = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  let recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
  let selectedLanguage = languageSelect.value;
  languageSelect.addEventListener("click", function() {
    selectedLanguage = languageSelect.value
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
  })
  recognition.lang = 'it-IT';
  recognition.interimResults = true;

  recognition.onresult = async (event) => {
    let transcript = '';
    for (let i = 0; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript + ' ';
    }
    parolaCorrenteDiv.textContent = transcript;


    const translationResponse = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${selectedLanguage}&dt=t&q=${encodeURIComponent(transcript)}`);
    const translationData = await translationResponse.json();
    const translation = translationData[0][0][0];

    fraseCorrente = translation;
    isTranslating = true;

    outputDiv.textContent = `${fraseCorrente}`;
    socket.emit("send_message",fraseCorrente)
  };

  recognition.onend = () => {
      recognition.start();
  };

  recognition.onerror = (event) => {
    console.error('Errore di riconoscimento vocale: ', event.error);
  };

  recognition.start();
} else {
  console.error('Il browser non supporta la Web Speech API.');
}
}, 7000);