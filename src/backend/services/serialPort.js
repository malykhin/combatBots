const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;

const config = require('../../../config');

const port = new SerialPort(config.serialPort, {
    baudRate: config.serialBaudRate,
    autoOpen: true
});
const parser = new Readline();
port.pipe(parser);

port.on('error', error => {
    console.log('Serial port error: ', error);
});

port.on('open', data => {
    console.log('Serial port opened');
    port.write('Connected\n');
});

parser.on('data', data => {
    console.log(data);
});

function serialWrite (message) {
    port.write(message);
}

module.exports = {
    serialWrite
};