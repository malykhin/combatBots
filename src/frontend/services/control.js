import config from '../../../config';
import _ from 'lodash';
import { keyCodes, colors } from './constants';

const botSettings = {
    uuid: null,
    color: null
};

const messageProcessingServices = {
    'NO_FREE_CONTROLS': () => {
        botSettings.uuid = null;
        botSettings.color = null;

        console.log('No free controls');

        setMode('view only');
    },
    'SET_UUID': (message) => {
        botSettings.uuid = message.payload.uuid;
        botSettings.color = message.payload.color;

        console.log('Bot controls settings:', botSettings);

        setMode('control mode', botSettings.color)
    }
};

const pressedKeys = {};

const controlsUrl = `ws://${document.location.hostname}:${config.controlsPort}/`;

const controlsWs = new WebSocket(controlsUrl);

controlsWs.onmessage = event => {
    const message = JSON.parse(event.data);

    if (message.type in messageProcessingServices) {
        const service = messageProcessingServices[message.type];
        service(message);
    }
};

controlsWs.onopen = () => {
    console.log('Control connection opened');

    window.onkeydown = event => {
        const key = keyCodes[event.keyCode];
        if (key) {
            if (key in pressedKeys) {
                return;
            }
            pressedKeys[key] = true;
            processControlCommand(controlsWs, botSettings.uuid, botSettings.color, key);
        }
    };

    window.onkeyup = event => {
        const key = keyCodes[event.keyCode];
        if (key) {
            delete pressedKeys[key];
            if (key === 'fire') {
                processControlCommand(controlsWs, botSettings.uuid, botSettings.color, 'steady');
                return;
            }
            if (_.isEmpty(pressedKeys)) {
                processControlCommand(controlsWs, botSettings.uuid, botSettings.color, 'stop');
            }
        }
    };

};

controlsWs.onerror = () => {
    window.onkeydown = null;
    window.onkeyup = null;
};

controlsWs.onclose = () => {
    window.onkeydown = null;
    window.onkeyup = null;
};

function processControlCommand (connection, uuid, color, command) {
    const data = {
        uuid,
        color,
        command
    };
    console.log('Controls data sent:', data);
    connection.send(JSON.stringify(data));
}

function setMode (modeType, color) {
    const botStatus = document.getElementById('status');
    const botColor = document.getElementById('color');

    botStatus.innerHTML = modeType;

    if (modeType === 'control mode') {
        botColor.innerHTML = color;
        botColor.style.color = colors[color];
        botColor.parentElement.removeAttribute('hidden')
    } else {
        botColor.parentElement.setAttribute('hidden', 'hidden')
    }
}