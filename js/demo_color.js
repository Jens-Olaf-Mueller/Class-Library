import { $ } from './library.js';
import Color from '../js/classes/color_class.js';

const objColorParts = {
    rgbdec: ['Red', 'Green', 'Blue', 'Black'],
    rgbhex: ['Red #', 'Green #', 'Blue #', 'Black'],
    hsl: ['Hue', 'Saturation', 'Lightness', 'Black'],
    hwb: ['Hue', 'Whiteness', 'Blackness', 'Black'],
    cmyk: ['Cyan', 'Magenta', 'Yellow', 'Black']
};

const clsColor = new Color();
const RGB = Array.from($('rgb'));
const colorName = $('inpColorName');

export function initColor() {
    RGB.forEach((rgb) => {
        rgb.addEventListener('input', () => displayColor());
    });
    Array.from($('colorformat')).forEach((format) => {
        format.addEventListener('change', (event) => converColor(event));
    });
    colorName.addEventListener('input', (event) => getColorName(event))
}

function displayColor() {
    const rgb = RGB.map(item => {return item.value});         
    const currCol = ($('inpHex').checked) ? '#'+rgb[0]+rgb[1]+rgb[2] : rgb;
    
    $('h4ColorName').textContent = clsColor.getName(currCol);
    $('h4HexValue').innerText = clsColor.toHex(currCol);
    $('inpColorName').value = clsColor.getName(currCol) || '';
    $('divColor').style.cssText += `background-color: ${clsColor.toHex(currCol)};`;
}

function getColorName(event) {
    let hex = clsColor.toHex(event.target.value);
    $('divColor').style.cssText += `background-color: ${clsColor.toHex(hex)};`;
}

function converColor(event) {
    const key = event.target.value;     
    let i = 0;['lblRed','lblGreen','lblBlue','lblBlack'].forEach((id) => {
        $(id).innerText = objColorParts[key][i];
        i++;
    });

    $('lblBlack').setAttribute('disabled','');
    $('inpBlack').setAttribute('disabled','');    
    switch (key) {
        case 'rgbhex':
            
            break;        
        case 'rgbdec':
            
            break;        
        case 'hsl':
            
            break;        
        case 'hwb':
            
            break;        
        case 'cmyk':
            $('lblBlack').removeAttribute('disabled');
            $('inpBlack').removeAttribute('disabled');
            break;
    
        default:
            break;
    }
}