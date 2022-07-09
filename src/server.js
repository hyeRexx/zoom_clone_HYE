import express from "express";
import WebSocket from "ws";
import http from "http";
import SocketIO from "socket.io";

const app = express(); // app = express instance

// app set?
app.set("view engine", "pug"); // set views
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home")); // rendering
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
// app.listen(3000, handleListen); // 시작하는 방법을 변경, ws사용

// http 위에 wss를 얹어서 같은 서버 안에서 웹소켓까지 처리할 수 있게 됨
// app.Listen과 다른 점?
// 변화의 요점 : http에 access
const server = http.createServer(app); // create server하려면 request Listner 경로가 있어야 함. 당연.

/*
const wss = new WebSocket.Server({server}); // http와 websocket 모두 작동시키기 (같은 포트에서)

// fake db
const sockets = [];

function bindMsg(type, nickname, payload) {
    const msg = {type, nickname, payload};
    return JSON.stringify(msg);
}

// connection event. connection이 이루어지면 cb, function을 실행. socket이 필요
wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anon";
    console.log("Connected to Browser 😁");
    socket.on("close", () => console.log("Disconnected from Browser.")); // 브라우저를 끄면 발생
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);

        switch (message.type) {
            case "new_message" :
                sockets.forEach((aSocket) => {
                    aSocket.send(bindMsg(message.type, aSocket.nickname, message.payload));
                });
                // sockets.forEach((aSocket) => aSocket.send(msg));
                break;
            case "nickname" :
                socket["nickname"] = message.payload;
                break;
        }
    });
});
*/

// const wsServer = SocketIO(server);


server.listen(3000, handleListen);