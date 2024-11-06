const {Server} = require("socket.io");
const io = new Server({
    cors: {
        origin: "*",
    },
});

io.listen(4000);

/* 입장해 있는 유저들 : 클라이언트의 Socket ID, 캐릭터의 위치좌표, 닉네임, 직군정보, 캐릭터 모델 인덱스, myRoom 배치정보, 메모 정보 */
const players = [];

io.on("connection", (socket) => {
    console.log("Connected to server");

    io.emit("players", players);
    socket.on("initialize", ({tmpNickname, tmpJobPosition, selectedCharacterGlbNameIndex}) => {
        const newPlayer = {
            id: socket.id,
            position: [0, 0, 0],
            nickname: tmpNickname,
            jobPosition: tmpJobPosition,
            selectedCharacterGlbNameIndex: selectedCharacterGlbNameIndex,
            myRoom: {
                objects: []
            }
        };

        players.push(newPlayer);

        socket.emit("initialize", players.find(player => player.id === socket.id));

        io.emit("enter", {
            id: socket.id,
            nickname: newPlayer.nickname,
            jobPosition: newPlayer.jobPosition,
        });
        io.emit("players", players);
    });

    socket.on("disconnecting", () => {
        console.log("연결이 끊어지는 중");
    });

    socket.on("disconnect", (message) => {
        console.log("연결이 끊어짐");
    });
});
