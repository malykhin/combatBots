const WebSocket = require('ws');

const videoStream = require('./videoStream');

const config = require('../../../config');

const socketServer = new WebSocket.Server({port: config.videoStreamPort, perMessageDeflate: false});

socketServer.connectionCount = 0;

socketServer.on('connection', (socket, upgradeReq) => {
    socketServer.connectionCount++;
    console.log(`New WebSocket VideoStream Connection: ${(upgradeReq || socket.upgradeReq).socket.remoteAddress} ${(upgradeReq || socket.upgradeReq).headers['user-agent']} (${socketServer.connectionCount} total)`);

    socket.on('close', () => {
        socketServer.connectionCount--;
        console.log(`Disconnected VideoStream WebSocket (${socketServer.connectionCount} total)`);
    });
});

socketServer.broadcast = (data) => {
    socketServer.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};

videoStream.on('data' , data => {
    socketServer.broadcast(data);
});