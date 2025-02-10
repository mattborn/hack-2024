import WaveSurfer from 'https://cdn.jsdelivr.net/npm/wavesurfer.js@7/dist/wavesurfer.esm.js'
import RecordPlugin from 'https://cdn.jsdelivr.net/npm/wavesurfer.js@7/dist/plugins/record.esm.js'

const wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: '#4a9eff',
    progressColor: '#1e6abc',
    height: 24,
    width: 96,
    barWidth: 4,
    barGap: 2,
    barRadius: 1,
    barCount: 12
});

let isRecording = false;
const recordButton = document.getElementById('recordButton');

const record = wavesurfer.registerPlugin(RecordPlugin.create());

async function toggleRecording() {
    if (!isRecording) {
        try {
            await record.startRecording();
            isRecording = true;
            recordButton.textContent = 'Stop Recording';
        } catch (err) {
            console.error('Error accessing microphone:', err);
        }
    } else {
        record.stopRecording();
        isRecording = false;
        recordButton.textContent = 'Start Recording';
    }
}

recordButton.addEventListener('click', toggleRecording);
