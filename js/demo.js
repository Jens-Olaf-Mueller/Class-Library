import { $ } from './library.js';
import MessageBox from './classes/messagebox_class.js';
import Timer from './classes/timer_class.js';
import Container from './classes/container_class.js';
import IntervalCollection from './classes/intervals_class.js';
import Calculator from './classes/calculator_class.js';

const msgBox = new MessageBox('../msgbox.css'),
      tmrDemo = new Timer(12,0,0,'divClock'),
      divClock = new Container('divClockFrame'),
      collIntervals = new IntervalCollection('Test'),
      calc = new Calculator();
      

const chkAlert = $('chkAlert'),
      chkShowClock = $('chkShowClock'),
      chkTimeout = $('chkTimeout'),
      pInfo = $('pInfo'),
      btnShowClock = $('btnShowContainer'),
      btnRunTimer = $('btnStartTimer'),
      imgShowCalc = $('imgCalcPopup'),
      imgShowCalcFull = $('imgCalcFullscreen');

runApp();

function runApp() {
    // btnShowClock.addEventListener('click', toggleClock);
    chkShowClock.addEventListener('change', toggleClock);
    btnRunTimer.addEventListener('click', startDemo);    
    document.addEventListener('timerexpired', timeOutAlert);   
    document.addEventListener('timeout', countDownAlert); 
    Array.from($('input[type="radio"][name="calcstyle"]')).forEach((radio) => {
        radio.addEventListener('click', () => resetStylesheets());
    });
    tmrDemo.sound = './sound/tick tack.mp3';
    tmrDemo.soundPlayTime = 3;
    tmrDemo.soundEnabled = true;
    divClock.hide();
    divClock.addEventListener('click', clockClicked);
    console.log(divClock.events)
    // collIntervals.add(intervalDemo, 5000, 'intervalDemo');
    // collIntervals.add(intervalDemo, 5000, tmrDemo);
    // collIntervals.list();
    // let calc = new Calculator('./style/calculator.css');
    // let calc = new Calculator('./style/calculator_neumorphic.css');

    // "input[type='radio'][name='rate']:checked"

    imgShowCalc.addEventListener('click', showCalculator);
    imgShowCalcFull.addEventListener('click', showCalculator);
}

function showCalculator(event) {
    // get the chosen stylesheet
    const style = $('input[type="radio"][name="calcstyle"]:checked').value;
    calc.stylesheet = style;
    if (event.target.id == 'imgCalcFullscreen') {        
        calc.show();
    } else {
        calc.show('inpCalcResult');
    }
    
}

function resetStylesheets() {
    const sheets = $('link[rel="stylesheet"][href*="calculator"]');
    if (sheets instanceof NodeList) {
        for(let i=0 ; i < sheets.length; i++){
            const sht = sheets[i];
            sht.parentNode.removeChild(sht);
        }
    } else {
        sheets.parentNode.removeChild(sheets);
    }
}

function toggleClock() {
    if (this.checked) {
        // divClock.show();
        divClock.visible = true;
        btnRunTimer.removeAttribute('disabled');
    } else {
        divClock.hide();
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
        $('chkTimeout').removeAttribute('disabled');
        $('[for="chkTimeout"]').removeAttribute('disabled');
        tmrDemo.countDown(10);
        pInfo.innerText = answer;
        return;
    } else if (answer == 'Alarm in 10s') { 
        $('chkAlert').removeAttribute('disabled');
        $('[for="chkAlert"]').removeAttribute('disabled');
        tmrDemo.setAlert(time.getHours(), time.getMinutes(), time.getSeconds() + 10);       
        tmrDemo.setTime();    
        pInfo.innerText = 'Alarm: ' + time.getHours() +':'+ time.getMinutes() +':'+ Number(time.getSeconds() + 10);  
    }
    tmrDemo.start();
}

async function countDownAlert() {
    if (chkTimeout.checked) {  
        msgBox.gradientColorFrom = 'limegreen';
        await msgBox.show('Countdown abgelaufen!','DEMO: Timer-countdown','Ok', false, true);
    }   
}

async function timeOutAlert() {
    if (chkAlert.checked) {
        msgBox.gradientColorFrom = 'firebrick';   
        await msgBox.show('Zeit abgelaufen!','A L A R M !!!','Ok', false);
    }   
}

async function clockClicked() {
    await msgBox.show('Na, auf die Uhr geklickt?','C L I C K !','Ok', false);
}

async function intervalDemo() {
    let answer = await msgBox.show('Der Interval nervt Dich alle 5 Sekunden...<br>Interval stoppen?','Demo Interval','Ja, Nein', false);
    debugger
    if (answer == 'Ja') {

        collIntervals.stop('intervalDemo');
        collIntervals.list();
    } 
    
}