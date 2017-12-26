const WebSocket = require('ws');
const uuid = require('uuid/v4');

const { serialWrite, isPortBusy } = require('./serialPort');
const config = require('../../../config');

const controlsColors = {
    red: null,
    blue: null
};

const commandsBuffer = [];

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
    for (let color in controlsColors) {
        if (!controlsColors[color]) {
            controlsColors[color] = uuid;
            return color;
        }
    }
    return null;
}

function releaseControlsColor (color) {
    if (color in controlsColors) {
        controlsColors[color] = null;
    }
}

function validateAndSendMessageToBot( message ) {
    if(message.uuid !== controlsColors[message.color]) {
        console.log('Bot uuid mismatch!');
        return;
    }
    const command = `${message.color}:${message.command}\n`;

    if ( isPortBusy() ) {
        console.log('Serial port is busy');
        commandsBuffer.push(command);
        scheduleCommand();
    } else {
        serialWrite(command);
    }
}

function scheduleCommand () {
    if ( commandsBuffer.length ) {
        if (!isPortBusy()) {
            const command = commandsBuffer.shift();
            serialWrite(command);
        } else {
            setImmediate( () => {
                scheduleCommand()
            });
        }
    }
}

function flushRobot (color) {
    if (!isPortBusy()) {
        serialWrite(`${color}:stop\n`);
        setTimeout(() => {
            serialWrite(`${color}:steady\n`);
        }, 100);
    } else {
        setImmediate( () => {
            flushRobot (color);
        });
    }
}

module.exports = { flushRobot};