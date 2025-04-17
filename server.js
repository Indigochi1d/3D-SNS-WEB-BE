const { Server } = require("socket.io");
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
  socket.on(
    "initialize",
    ({ tmpNickname, tmpJobPosition, selectedGLBIndex }) => {
      const newPlayer = {
        id: socket.id,
        position: [0, 0, 0],
        nickname: tmpNickname,
        jobPosition: tmpJobPosition,
        selectedGLBIndex: selectedGLBIndex,
        myRoom: {
          objects: [],
        },
      };

      players.push(newPlayer);

      socket.emit(
        "initialize",
        players.find((player) => player.id === socket.id)
      );

      io.emit("enter", {
        id: socket.id,
        nickname: newPlayer.nickname,
        jobPosition: newPlayer.jobPosition,
      });
      io.emit("players", players);
    }
  );

  socket.on("move", (position) => {
    console.log("players", players);
    console.log("---------------------------------------------");
    const player = players.find((player) => player.id === socket.id);
    if (player) {
      player.position = position;
      io.emit("players", players);
    }
  });

  socket.on("newText", (text) => {
    const sender = players.find((player) => player.id === socket.id);
    if (sender) {
      const { id, nickname, jobPosition } = sender;
      console.log("sender", sender);
      if (nickname && jobPosition) {
        console.log("---------------------");
        const now = new Date();
        io.emit("newText", {
          senderId: id,
          senderNickname: nickname,
          senderJobPosition: jobPosition,
          text: text,
          timeStamp: now,
        });
      }
    }
  });

  socket.on("myRoomChange", (myRoom, otherPlayerId) => {
    console.log("방이 바뀌었나요?");
    const id = otherPlayerId || socket.id; //방에 자신이 변화를 주었는지 or 남이 변화를 주었는지
    const player = players.find((player) => player.id === id);
    player.myRoom = myRoom;
    io.emit("players", players);
  });

  socket.on("disconnecting", () => {
    console.log("연결이 끊어지는 중");
    const player = players.find((player) => player.id === socket.id);
    if (player) {
      io.emit("exit", {
        id: socket.id,
        nickname: player.nickname,
        jobPosition: player.jobPosition,
      });
    }
  });

  socket.on("disconnect", (message) => {
    console.log("연결이 끊어짐");
    players.splice(
      players.findIndex((player) => player.id === socket.id),
      1
    );
    io.emit("players", players);
  });
});
