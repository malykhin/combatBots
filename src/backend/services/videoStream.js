const { spawn } = require('child_process');
const config = require('../../../config');

const videoStream = spawn(
    'ffmpeg', [
        '-f', 'v4l2',
	'-framerate', '25',
	'-video_size', '800x600',
//	'-vcodec', 'mjpeg',
	'-input_format', 'mjpeg',
	'-i', config.videoDevice,
	'-f', 'mpegts',
	'-codec:v', 'mpeg1video',
	'-s', '800x600',
	'-b:v', '800k',
//        '-bf', '0',
        'pipe:1'
	],
    { stdio: 'pipe' }
);

videoStream.stderr.on('data', data => {
   console.log(data.toString());
});

videoStream.stderr.on('error', error => {
    console.log(error);
});

module.exports = videoStream.stdout;
