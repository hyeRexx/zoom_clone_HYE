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

const httpServer = http.createServer(app); // create server하려면 request Listner 경로가 있어야 함. 당연.
const wsServer = SocketIO(httpServer);

wsServer.on("connection", socket => {
    socket.on("join_room", (roomName => {
        socket.join(roomName);
    }))
})

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);