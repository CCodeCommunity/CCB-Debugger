const { remote } = require("electron");
const { dialog } = remote;
const fs = require("fs");

const editor = document.getElementById("text-area");
const textRenderTarget = document.getElementById("txt-col");
const lineNumbers = document.getElementById("line-numbers");
const saveButton = document.getElementById("save");
const infoRight = document.getElementById("info-right");

const renderMinimap = require("./js/minimap.js");

let cursorColumn = 0;
let cursorLine = 0;

editor.onscroll = () => {lineNumbers.scrollTop = editor.scrollTop};

infoRight.innerHTML = "ln 0, col 0"

saveButton.onclick = () => {
    const path = dialog.showOpenDialogSync();
    const buffer = fs.readFileSync(path[0]);
    editor.innerText = buffer.toString();
    reCalculateLineNumbers();
};

const typeable = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ,0123456789\"".split("")
typeable.push("Enter")
typeable.push("Tab")

editor.onkeyup = e => {
    cursorColumn = window.getSelection().anchorOffset;
    cursorLine = (window.getSelection().anchorNode.parentElement.parentElement.tagName == "BODY" ? -1 : window.getSelection().anchorNode.parentElement.parentElement.parentElement.tagName == "BODY" ? 0 : [...window.getSelection().anchorNode.parentElement.parentElement.children].indexOf(window.getSelection().anchorNode.parentElement) + 1) + (cursorColumn == 0);

    infoRight.innerHTML = `ln ${cursorLine}, col ${cursorColumn}`;

    if (e.key == "Enter" || e.key == "Backspace") {
        reCalculateLineNumbers();
    }

    syntaxHighlight();
    
    renderMinimap();
};

const reCalculateLineNumbers = () => {
    const count = editor.innerText.replace(/\n\n/g, '\n').split("\n").length;
    lineNumbers.innerText = "";

    for (let i = 0; i < count; i++) {
        lineNumbers.innerText += (i + 1) + '\n';
    }
};

let theme = {
    opcodes: "color: red; font-weight: bold;",
    registers: "color: orange; font-weight: bold;",
    number: "color: yellow",
    label: "color: green",
    comment: "color: #707070"
};

const opcodes = ["stp", "mov", "ret", "cal", "add", "sub", "div", "mul", "and", "or", "not", "xor", "jmp", "syscall"]

const syntaxHighlight = () => {
    console.log("UPDATE")
    const text = editor.innerText;
    let newText = "";
    text.split("\n").forEach(line => {
        let comment = false;
        line.split(" ").forEach(word => {
            const res = highlightTerm(newText, word.trim(), comment);
            newText = res[0];
            comment = res[1];
        });

        newText += "<br />"
    });
    
    textRenderTarget.innerHTML = newText;
};

const highlightTerm = (newText, word, comment) => {
    // comments
    if (comment) {
        newText += `<span style="${theme.comment}">${word}</span> `;
    }

    else if (!(word.split(";").length == 1)) {
        comment = true;
        newText += `<span style="${theme.comment}">`;
        
        if (word[0] == ';')
            newText += `${word} `;
        else {
            const wordPieces = word.split(";");
            let res = highlightTerm(newText, wordPieces[0], false);
            newText = res[0].slice(0, -1);
            newText += `<span style="${theme.comment}">;${wordPieces[1]}</span>`;
        }
    }

    // opcodes
    else if (opcodes.includes(word.trim())) {
        newText += `<span style="${theme.opcodes}">${word} </span> `;
    }
    
    // registers
    else if (word == "a" || word == "b" || word == "a" || word == "b" || word == "a," || word == "b," || word == "a," || word == "b,") {
        newText += `<span style="${theme.registers}">${word} </span> `;
    }

    // numbers
    else if (/^\d+$/.test(word)) {
        newText += `<span style="${theme.number}">${word}</span> `;
    }

    // labels
    else if (word[0] == ':') {
        newText += `<span style="${theme.label}">${word}</span> `;
    }

    // other language elements
    else {
        newText += word + " ";
    }

    return [newText, comment];
};