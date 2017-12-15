const WebSocket = require('ws');
const uuid = require('uuid/v4');

const { serialWrite } = require('./serialPort');
const config = require('../../../config');

const controlsCollors = {
    red: null,
    blue: null
};

const socketServer = new WebSocket.Server({port: config.controlsPort, perMessageDeflate: false});

socketServer.connectionCount = 0;

socketServer.on('connection', (socket, upgradeReq) => {
    socketServer.connectionCount++;

    if (socketServer.connectionCount > 2) {
        console.log('No more WebSocket Controls Connections available');
        const message = {type: 'NO_FREE_CONTROLS'};
        socket.send(JSON.stringify(message));
        socket.terminate();
        socketServer.connectionCount--;
        return;
    }

    console.log(`New WebSocket Controls Connection: ${(upgradeReq || socket.upgradeReq).socket.remoteAddress} ${(upgradeReq || socket.upgradeReq).headers['user-agent']} (${socketServer.connectionCount} total)`);

    socket.isAlive = true;
    socket.controlsConnectionId = uuid();
    socket.controlsColor = getControlsColor(socket.controlsConnectionId);

    const message = {
        type: 'SET_UUID',
        payload: {
            uuid: socket.controlsConnectionId,
            color: socket.controlsColor
        }
    };

    socket.send(JSON.stringify(message));

    socket.on('pong', heartbeat);

    socket.on('message', data => {
        const message = JSON.parse(data);
        console.log(message);
        validateAndSendMessageToBot(message);
    });

    socket.on('close', () => {
        socketServer.connectionCount--;
        releaseControlsColor(socket.controlsColor);
        flushRobot(socket.controlsColor);
        console.log(`Disconnected WebSocket Controls(${socketServer.connectionCount} total)`);
    });

    socket.on('error', () => {
        socketServer.connectionCount--;
        releaseControlsColor(socket.controlsColor);
        flushRobot(socket.controlsColor);
        console.log(`Error WebSocket Controls, closed(${socketServer.connectionCount} total)`);
    });

});

function heartbeat() {
    this.isAlive = true;
}

setInterval(() => {
    socketServer.clients.forEach(socket => {
        if (socket.isAlive === false) {
            return socket.terminate();
        }

        socket.isAlive = false;
        socket.ping('', false, true);
    });
}, config.controlsTimeout);

function getControlsColor (uuid) {
    for (let color in controlsCollors) {
        if (!controlsCollors[color]) {
            controlsCollors[color] = uuid;
            return color;
        }
    }
    return null;
}

function releaseControlsColor (color) {
    if (color in controlsCollors) {
        controlsCollors[color] = null;
    }
}

function validateAndSendMessageToBot( message ) {
    if(message.uuid !== controlsCollors[message.color]) {
        console.log('Bot uuid mismatch!');
        return;
    }
    const command = `${message.color}:${message.command}\n`;
    serialWrite(command);
}

function flushRobot (color) {
    serialWrite(`${color}:stop\n`);
    setTimeout(() => {
        serialWrite(`${color}:steady\n`);
    }, 100);
}
