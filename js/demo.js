import { $ } from './library.js';
import { initContainer } from './demo_container.js';
import { initColor } from './demo_color.js';
import { initMessagebox } from './demo_messagebox.js';
import MessageBox from './classes/messagebox_class.js';
import Timer from './classes/timer_class.js';
import Container from './classes/container_class.js';
import IntervalCollection from './classes/intervals_class.js';
import Calculator from './classes/calculator_class.js';

const msgBox = new MessageBox('../msgbox.css');
const tmrDemo = new Timer(12,0,0,'divClock'),
      divClock = new Container('divClockFrame'),
      collIntervals = new IntervalCollection('Test'),
      calc = new Calculator();
      

const tabs = $('button.btnTab'),
      chkAlert = $('chkAlert'),
      chkShowClock = $('chkShowClock'),
      chkTimeout = $('chkTimeout'),
      pInfo = $('pInfo'),
      btnShowClock = $('btnShowContainer'),
      btnRunTimer = $('btnStartTimer'),
      imgShowCalc = $('imgCalcPopup'),
      imgShowCalcFull = $('imgCalcFullscreen');

runApp();

function runApp() {
    // install logic for tabstrip
    tabs.forEach((tab) => {
        tab.addEventListener('click', (event) => switchTab(event));
    });
    initContainer();     
    initColor();         
    initMessagebox();    
    // initTimer();      
    
    // $('jomCombo').options = [{caption: 'Frühling', value: 1},{caption: 'Sommer', value: 2},{caption: 'Herbts', value: 3},{caption: 'Winter', value: 4}];
// debugger
    // $('jomRadios').options ='Januar,Februar,März, April:3,Mai,Juni:5';

    // $('jomCombo').selected = 2;
    // $('jomRadios').selected = 1;

    const jom = document.createElement('jom-control');
    // $('#fldControl .tabcontent-left').appendChild(jom);
    jom.captionText = "Neues Element";
    jom.type ="counter";
    jom.min=-5;
    jom.max = 150;
    jom.value = 100;
    jom.unit = 'value: kg';
    jom.captionwidth = '12rem';

// debugger

$('jomCountries').addEventListener('click', function() {
    console.log(this.value)
})

    const combo = document.createElement('jom-combo');
    combo.options = 'A,B,C,D,E,F,G,H'
    combo.size = 4
    combo.addEventListener('click', function() {
        console.log(this.value)
    })
    // document.body.appendChild(combo)

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
    // divClock.hide();
    // divClock.addEventListener('click', clockClicked);
    // console.log(divClock.events)
    // collIntervals.add(intervalDemo, 5000, 'intervalDemo');
    // collIntervals.add(intervalDemo, 5000, tmrDemo);
    // collIntervals.list();
    // let calc = new Calculator('./style/calculator.css');
    // let calc = new Calculator('./style/calculator_neumorphic.css');

    // "input[type='radio'][name='rate']:checked"

    imgShowCalc.addEventListener('click', showCalculator);
    imgShowCalcFull.addEventListener('click', showCalculator);

    // $('jomText').setAttribute('disabled','disabled');
    // $('jomText').removeAttribute('disabled');


    // $('jomText').type = 'counter';
    // $('jomText').value = 22.50;
    // debugger
    // const names = document.querySelectorAll('jom-control[name="season"]')[1].checked = true;        
    
}

function switchTab(event) {
    const caption = event.target.innerText.split(' ')[0],
          tabcontent = $('.tabcontent');
    for (let i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = 'none';
    }
    for (let i = 0; i < tabs.length; i++) {
      tabs[i].className = tabs[i].className.replace(' active', '');
    }
    $(`fld${caption}`).style.display = 'grid';
    event.currentTarget.className += ' active';
}




function showCalculator(event) {
    // get the chosen stylesheet
    const style = $('input[type="radio"][name="calcstyle"]:checked').value;
    calc.stylesheet = style;
    if (event.target.id == 'imgCalcFullscreen') {        
        calc.show();
        // for (let i = 0; i < 4; i++) {
        //     $('divCalculator').innerHTML += `<h2 class="watermark">Click here to close</h2>`;
        // }
        // const watermarks = $('.watermark');
        // watermarks[0].style.cssText += 'top: 4rem; left: 4rem;';
        // watermarks[1].style.cssText += 'top: 4rem; right: 4rem;';
        // watermarks[2].style.cssText += 'bottom: 4rem; left: 4rem;';
        // watermarks[3].style.cssText += 'bottom: 4rem; right: 4rem;';
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

async function startDemo(event) {
    event.preventDefault();
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