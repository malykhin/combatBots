const express = require('express');
const path = require('path');

require('./services/videoStreamingServer');
require('./services/controlsServer');

const config = require('../../config');
const app = express();

app.use('/', express.static(path.join(__dirname, '../../dist')));

app.listen(config.serverPort, () => console.log('Server listen to:', config.serverPort));
