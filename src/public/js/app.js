const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
const nameform = welcome.querySelector("#name");
const roomNameInfo = welcome.querySelector("#roomname");
// 연결이 끊기면 계속해서 재시도 하는 모습을 볼 수 있음 (프론트 콘솔)
// handle Room Submit

room.hidden = true;

let roomName;

nameform.addEventListener("submit", handleNicknameSubmit);
roomNameInfo.addEventListener("submit", handleRoomName);


function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}


function handleRoomName(event) {
    event.preventDefault();
    // js object를 보낼 수 있음 (msg 아님!), emit의 마지막 argument가 function일때 : back button어쩌구
    const input = welcome.querySelector("#roomname input");
    socket.emit("enter_room", input.value, showRoom); 
    roomName = input.value;
    input.value = "";
}


function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", value, roomName, () => {
        addMessage(`You : ${value}`);
    });
    input.value = ""; // aSync
}

function handleNicknameSubmit(event) {
    event.preventDefault();
    const input = welcome.querySelector("#name input");
    const value = input.value;
    socket.emit("nickname", value);
    input.value = ""; // aSync
}

function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    
    const msgform = room.querySelector("#msg");
    msgform.addEventListener("submit", handleMessageSubmit);
}


room.addEventListener("submit", (event) => {
    event.preventDefault();
})

socket.on("welcome", (user, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user} arrived!`);
});

socket.on("bye", (left, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${left} just left T.T`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    if (rooms.length === 0) {
        return;
    }
    rooms.forEach((room) => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
});
// socket.on("roon_change", (msg) => console.log(msg))와 같음