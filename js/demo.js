import MessageBox from './classes/messagebox_class.js';
import Timer from './classes/timer_class.js';

const msgBox = new MessageBox('../msgbox.css'),
      tmrDemo = new Timer(12,0,0,'divClock');

const chkAlert = document.getElementById('chkAlert'),
      chkTimeout = document.getElementById('chkTimeout'),
      pInfo = document.getElementById('pInfo');

runApp();

function runApp() {
    document.getElementById('btnStartTimer').addEventListener('click', startDemo);
    document.addEventListener('timerexpired', timeOutAlert);   
    document.addEventListener('timeout', countDownAlert); 
    tmrDemo.sound = './sound/tick tack.mp3';
    tmrDemo.soundPlayTime = 3;
    tmrDemo.soundEnabled = true;
}

async function startDemo() {
    let answer = await msgBox.show('Welcher Timer soll gestartet werden?', '',
                'Aktuelle Uhrzeit, 00:00 Uhr, Countdown 10s, Alarm in 10s, Abbrechen');
    if (answer == 'Abbrechen') return;
    const time = new Date();
    tmrDemo.clear();
    pInfo.innerText = '';
    if (answer == 'Aktuelle Uhrzeit') {        
        tmrDemo.setTime();
    } else if (answer == '00:00 Uhr') {
        tmrDemo.setTime(0,0,0);
        tmrDemo.start();
    } else if (answer == 'Countdown 10s') {
        document.getElementById('chkTimeout').removeAttribute('disabled');
        document.querySelector('[for="chkTimeout"]').removeAttribute('disabled');
        tmrDemo.countDown(10);
        pInfo.innerText = answer;
        return;
    } else if (answer == 'Alarm in 10s') { 
        document.getElementById('chkAlert').removeAttribute('disabled');
        document.querySelector('[for="chkAlert"]').removeAttribute('disabled');
        tmrDemo.setAlert(time.getHours(), time.getMinutes(), time.getSeconds() + 10);       
        tmrDemo.setTime();    
        pInfo.innerText = 'Alarm: ' + time.getHours() +':'+ time.getMinutes() +':'+ Number(time.getSeconds() + 10);  
    }
    tmrDemo.start();
}

async function countDownAlert() {
    if (chkTimeout.checked) {        
        await msgBox.show('Countdown abgelaufen!','DEMO: Timer-countdown','Ok',false);
    }   
}

async function timeOutAlert() {
    if (chkAlert.checked) {
        await msgBox.show('Zeit abgelaufen!','A L A R M !!!','Ok',false);
    }   
}