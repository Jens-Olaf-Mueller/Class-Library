import { $, addWatermark } from './library.js';
import Container from './classes/container_class.js';
import MessageBox from './classes/messagebox_class.js';

const demoContainer = new Container('divDemoContainer');
const msgBox = new MessageBox('../style/msgbox.css');

export function initContainer() {
    $('chkEventListener').addEventListener('change', (event) => {
        if (event.target.checked) {
            demoContainer.addEventListener('click', clickOnDemoContainer);
            addWatermark(demoContainer.thisContainer, 'Now you can click me...', true)
        } else {
            demoContainer.removeEventListener('click', clickOnDemoContainer);
            $('[id*="h2-"]').remove();
        }
    });    
    $('containermethods').forEach((opt) => {
        opt.addEventListener('change', (event) => {
            if (event.target.checked && event.target.value == 'hide') {
                demoContainer.hide();
            } else {
                demoContainer.show();
            }
        })
    });
    $('fade').forEach((opt) => {
        opt.addEventListener('change', (event) => {
            const delay = Number($('inpFade').value) || 250;
            if (event.target.checked && event.target.value == 'in') {
                demoContainer.fadeIn(delay);
            } else {
                demoContainer.fadeOut(delay);
            }
        })
    });
    $('chkClass').addEventListener('change', (event) => {
        if (event.target.checked) {
            demoContainer.addClass('blue-theme');
        } else {
            demoContainer.removeClass('blue-theme');
        }
    });
}

async function clickOnDemoContainer() {
    await msgBox.show('You clicked on me!','Container click-event','Ok', false, true);
}