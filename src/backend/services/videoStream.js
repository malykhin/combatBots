const { spawn } = require('child_process');
const config = require('../../../config');

const videoStream = spawn(
    'ffmpeg', [
        '-f', 'avfoundation',
        '-framerate', '30',
        '-i', config.videoDevice,
        '-f', 'mpegts',
        '-codec:v', 'mpeg1video',
        '-s', '800x600',
        '-b:v', '1000k',
        '-bf', '0',
        'pipe:1'],
    { stdio: 'pipe' }
);

videoStream.stderr.on('data', data => {

});

videoStream.stderr.on('error', error => {
    console.log(error);
});

module.exports = videoStream.stdout;