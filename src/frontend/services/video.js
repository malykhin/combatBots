import config from '../../../config';

const canvas = document.getElementById('video-canvas');
const videoUrl = `ws://${document.location.hostname}:${config.videoStreamPort}/`;
const player = new JSMpeg.Player(videoUrl, {canvas: canvas});
