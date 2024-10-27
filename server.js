const {Server} = require('socket.io');
const io = new Server({
    cors:{
        origin: "*",
    },
});

io.listen(4000);

io.on('connection', (socket) => {
    console.log('Connected to server');

    socket.on('disconnecting', () => {
       console.log("연결이 끊어지는 중");
    });

    socket.on('disconnect', (message) => {
        console.log("연결이 끊어짐");
    });
})
