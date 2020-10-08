const canvas = document.getElementById("minimap-canvas");
const editor = document.getElementById("text-area");
const ctx = canvas.getContext("2d");

const lineSpacing = 2;
const charLength = 5;
const topOffset = 0;
const leftOffset = 5;

const opcodes = ["stp", "mov", "ret", "cal", "add", "sub", "div", "mul", "and", "or", "not", "xor", "jmp", "syscall", "frs", "pop", "psh", "cmp", "js", "jg", "jo", "je", "jne"]
let comment;

function drawWord(lineNr, WordLength, offset, word) {
    word = word.replace(/,/g, '');

    if (word.charCodeAt(0) == 160) { // non breaking space
        return;
    }

    // figure out word type and then get color
    if (word[0] == ':')
        ctx.strokeStyle = "green";
    else if (opcodes.includes(word))
        ctx.strokeStyle = "red";
    else if (word[0] == ';') {
        ctx.strokeStyle = "#505050";
        comment = true;
    }
    else if (word == 'a' || word == 'b' || word == 'c' || word == 'd') {
        ctx.strokeStyle = "orange";
    }
    else if (/^\d+$/.test(word)) {
        ctx.strokeStyle = "yellow";
    } 
    else
        ctx.strokeStyle = "white";
    
    if (comment) {
        ctx.strokeStyle = "#505050";
    }

    // draw the word line
    ctx.beginPath();
    ctx.moveTo(offset + leftOffset, lineNr * lineSpacing + topOffset + .5);
    ctx.lineTo(offset + leftOffset + WordLength * charLength, lineNr * lineSpacing + topOffset + .5);
    ctx.stroke();
}

function renderMinimap() {
    canvas.width += 0;
    const lines = editor.innerText.split("\n");

    lines.forEach((line, lineNr) => {
        comment = false;
        const words = line.split(" ");
        let offset = 10;
        words.forEach((word) => {
            drawWord(lineNr, word.length, offset, word);
            offset += (word.length * charLength + 10);
        });
    });
}

module.exports = renderMinimap;