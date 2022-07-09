const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nickForm = document.querySelector("#nickname");
const socket = new WebSocket(`ws://${window.location.host}`)

function makeMessage(type, payload) {
    const msg = {nickname, type, payload};
    return JSON.stringify(msg);
}

socket.addEventListener("open", () => {
    console.log("Connected to Sever 😁")
});

socket.addEventListener("message", (msg) => {
    const message = JSON.parse(msg.data);
    switch (message.type) {
        case "new_message" :
            const li = document.createElement("li");
            li.innerText = `${message.nickname} : ${message.payload}`
            messageList.append(li);
            break;
    }
});

// 서버 죽었을 때
socket.addEventListener("close", () => {
    console.log("Connected from Server X");
});

messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    // const li = document.createElement("li");
    // li.innerText = `You : ${input.value}`; // 내가 쓴 메시지는 서버에서 오는게 아니라 내 프론트에서 그림
    // messageList.append(li);
    input.value = "";
});

nickForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
    input.value = "";
});