const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;

const config = require('../../../config');
const { flushRobot } = require('./controlsServer');

SerialPort.list().then(data => console.log('Available ports:', data));

const port = new SerialPort(config.serialPort, {
    baudRate: config.serialBaudRate,
    autoOpen: true
});
const parser = new Readline();

let commandIsProcessing = false;
let commandTimeOutTimer;

const COMMAND_TIMEOUT = 100;

port.pipe(parser);

port.on('error', error => {
    console.log('Serial port error: ', error);
});

port.on('open', () => {
    console.log('Serial port opened');
});

parser.on('data', data => {
    console.log('Serial response: ', data);
    if(data.indexOf('OK') > -1) {
        commandIsProcessing = false;
        clearTimeout(commandTimeOutTimer);
    } else if (data.indexOf('ERROR') > -1) {
        commandIsProcessing = false;
        clearTimeout(commandTimeOutTimer);
        const id = data.split(' ')[1];
        flushRobot(id);
    }

});

function serialWrite (message) {
    commandIsProcessing = true;
    commandTimeOutTimer = setTimeout(() => {
        console.log('command timeout');
        commandIsProcessing = false
    }, COMMAND_TIMEOUT);
    port.write(message);
}

function isPortBusy () {
    return commandIsProcessing;
}

module.exports = {
    serialWrite,
    isPortBusy
};