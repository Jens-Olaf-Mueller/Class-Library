import { $ } from './library.js';
import MessageBox from './classes/messagebox_class.js';
import Color from './classes/color_class.js';

const buddies = $('[data-buddy]');
const msgBox = new MessageBox($('[name="msgstyle"]:checked').value);
const msgColor = new Color();

export function initMessagebox() {
    buddies.forEach((buddy) => {
        buddy.addEventListener('change', switchBuddy);
    });
    $('btnMessagebox').addEventListener('click', showMessagebox);
    $('[data-code="msgbox"]').forEach((ctrl) => {
        ctrl.addEventListener('change', updateCode);
    });
    updateCode();
}

function switchBuddy(checkbox) {
    const buddies = checkbox.target.dataset.buddy.split(',').map(el => el.trim());
    buddies.forEach((buddy) => {
        if (checkbox.target.checked) {
            $(buddy).removeAttribute('disabled');
        } else {
            $(buddy).setAttribute('disabled','');
        }    
    });
}

function updateCode(control) {
    if (control && (control.target.id == 'inpDefault' || control.target.id =='inpEdged')) {
        const isDefault = !$('[name="msgstyle"]:checked').value.includes('_edged');
        $('colGradientFrom').value = isDefault ? '#000A6D' : '#008000';
        $('colGradientTo').value = isDefault ? '#f5f5f5' : '#ffff00';        
    }
    const box = getMsgBoxSettings();
     msgBox.stylesheet = box.sheet;
    const code = `const msgbox = new MessageBox('${box.sheet}');
let answer = await msgbox.show("${box.message}", "${box.title}", "${box.buttons}", ${box.modal}, ${JSON.stringify(box.gradient)})`;
    $('codeMsgBox').innerHTML = code;    
    $('msgAnswer').innerText = '';
}

async function showMessagebox() {
    const box = getMsgBoxSettings();
    let answer = await msgBox.show(box.message, box.title, box.buttons, box.modal, box.gradient);
    $('msgAnswer').innerHTML = 'Button clicked: <span class="green">' + answer + '</span>';
}

function getMsgBoxSettings() {
    return {
        message: $('chkPrompt').checked ? $('txtPrompt').value : '',
        title: $('chkTitle').checked ? $('txtTitle').value : '',
        buttons: $('chkButtons').checked ? $('txtButtons').value : '',
        modal: $('chkModal').checked,
        gradient: $('chkGradient').checked ? {from: $('colGradientFrom').value, to: $('colGradientTo').value} : false,
        sheet: $('[name="msgstyle"]:checked').value
    };
}