const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camSelect = document.getElementById("cameras");
const welcome = document.getElementById("welcome");
const call = document.getElementById("call");
const welcomeForm = welcome.querySelector("form");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let myPeerConnection;

async function getCamera() {
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        const currCam = myStream.getVideoTracks()[0];
        cameras.forEach((camera) => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if (currCam == camera.label) {
                option.selected = true;
            }
            camSelect.appendChild(option);
        })
    } catch(e) {
        console.log(e);
    }
}

async function getMedia(deviceId) {
    const initialConstrains = {
        audio : true,
        video : {facingMode : "user"},
    }
    const cameraConstrains = {
        audio : true,
        video : {deviceId : {exact : deviceId}},
    }
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstrains : initialConstrains
        );                     
        myFace.srcObject = myStream;
        if (!deviceId) {
            await getCamera();
        }
    } catch (e) {
        console.log(e);
    }
}

function handleMuteClick() {
    myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    if(!muted) {
        muteBtn.innerText = "Unmute";
        muted = true;
    } else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
}

function handleCameraClick() {
    myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    if (cameraOff) {
        cameraBtn.innerText = "Camera Off";
        cameraOff = false;
    } else {
        cameraBtn.innerText = "Camera On";
        cameraOff = true;
    }
}

async function handleCamSelect() {
    await getMedia(camSelect.value);
    if (myPeerConnection) {
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection
          .getSenders()
          .find((sender) => sender.track.kind === "video");
        videoSender.replaceTrack(videoTrack);
    }
}

async function initCall() {
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

async function handleWelcomeSubmit(event) {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();
    socket.emit("join_room", input.value);
    roomName = input.value;
    input.value = "";
} 


// getMedia();


muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camSelect.addEventListener("input", handleCamSelect); // camerasChange
welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// socket code
// for host : give an offer
socket.on("welcome", async () => { // other join
    const offer = await myPeerConnection.createOffer(); // this is me
    myPeerConnection.setLocalDescription(offer); // make description
    console.log("sent the offer");
    socket.emit("offer", offer, roomName);
})

// for guest : receive an offer
socket.on("offer", async (offer) => {
    console.log("receive the offer")
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer); // make description
    socket.emit("answer", answer, roomName);
    console.log("sent the answer")
});

// for host : receive guest's local description and set it for remote.
socket.on("answer", (answer) => {
    console.log("received the answer")
    myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", ice => {
    console.log("received candidate")
    myPeerConnection.addIceCandidate(ice);
    // console.log("for debug : ", myPeerConnection);
});

// RTC code
function makeConnection() {
    myPeerConnection = new RTCPeerConnection({
        // iceServers: [
        //   {
        //     urls: [
        //         "stun:stun.l.google.com:19302",
        //         "stun:stun1.l.google.com:19302",
        //         "stun:stun2.l.google.com:19302",
        //         "stun:stun3.l.google.com:19302",
        //         "stun:stun4.l.google.com:19302",
        //     ],
        //   },
        // ],

        iceServers: [{   urls: [ "stun:ntk-turn-1.xirsys.com" ]}, {   username: "YJEDdsmzoOSRvd8zdN70TJHSlfeM6OMiPMYmkg68J2v0bIuFN0J1nbgfoAk0x234AAAAAGLLfAhoeWVSZXh4",   credential: "58b473dc-00b8-11ed-a9bd-0242ac120004",   urls: [       "turn:ntk-turn-1.xirsys.com:80?transport=udp",       "turn:ntk-turn-1.xirsys.com:3478?transport=udp",       "turn:ntk-turn-1.xirsys.com:80?transport=tcp",       "turn:ntk-turn-1.xirsys.com:3478?transport=tcp",       "turns:ntk-turn-1.xirsys.com:443?transport=tcp",       "turns:ntk-turn-1.xirsys.com:5349?transport=tcp"   ]}]
      });
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddStream);
    // myPeerConnection.addEventListener("track", handleTrack);
    myStream.getTracks().forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
    console.log("sent candidate")
    socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data){
    const peerFace = document.getElementById("peerFace");
    peerFace.srcObject = data.stream;
}

// function handleTrack(data) {
//     console.log("handle track")
//     const peerFace = document.querySelector("#peerFace")
//     peerFace.srcObject = data.streams[0]
// }