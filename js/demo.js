import MessageBox from './classes/messagebox_class.js';
import Timer from './classes/timer_class.js';
import Container from './classes/container.class.js';

const msgBox = new MessageBox('../msgbox.css'),
      tmrDemo = new Timer(12,0,0,'divClock'),
      divClock = new Container('divClockFrame');
      

const chkAlert = document.getElementById('chkAlert'),
      chkTimeout = document.getElementById('chkTimeout'),
      pInfo = document.getElementById('pInfo'),
      btnShowClock = document.getElementById('btnShowContainer'),
      btnRunTimer = document.getElementById('btnStartTimer');

let clockVisible = false;

runApp();

function runApp() {
    btnShowClock.addEventListener('click', toggleClock);
    btnRunTimer.addEventListener('click', startDemo);    
    document.addEventListener('timerexpired', timeOutAlert);   
    document.addEventListener('timeout', countDownAlert); 
    tmrDemo.sound = './sound/tick tack.mp3';
    tmrDemo.soundPlayTime = 3;
    tmrDemo.soundEnabled = true;
    divClock.hide();
    divClock.addEventListener('click', clockClicked);
    console.log(divClock.events)
}

function toggleClock() {
    clockVisible = !clockVisible;
    if (clockVisible) {
        divClock.show();
        btnShowClock.innerText = 'Hide Clock';
        btnRunTimer.removeAttribute('disabled');
    } else {
        divClock.hide();
        btnShowClock.innerText = 'Show Clock';
        btnRunTimer.setAttribute('disabled','');
    }
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
        await msgBox.show('Countdown abgelaufen!','DEMO: Timer-countdown','Ok', false);
    }   
}

async function timeOutAlert() {
    if (chkAlert.checked) {
        await msgBox.show('Zeit abgelaufen!','A L A R M !!!','Ok', false);
    }   
}

async function clockClicked() {
    await msgBox.show('Na, auf die Uhr geklickt?','C L I C K !','Ok', false);
    divClock.removeEventListener('clockClicked');
}