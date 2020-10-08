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

    //if (e.key == "Enter" || e.key == "Backspace" || e.key == " ") {
        syntaxHighlight();
    //}

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
    opcodes: "color: #ee0000; font-weight: bold;"
};

const opcodes = ["stp", "mov", "ret", "cal", "add", "sub", "div", "mul", "and", "or", "not", "xor", "jmp", "syscall"]

const syntaxHighlight = () => {
    console.log("UPDATE")
    const text = editor.innerText;
    let newText = "";
    text.split("\n").forEach(line => {
        line.split(" ").forEach(word => {
            if (opcodes.includes(word.trim())) {
                newText += `<span style="${theme.opcodes}">${word}</span> `;
            } else {
                newText += word + " ";
            }
        });

        newText += "<br />"
    });
    
    textRenderTarget.innerHTML = newText;
};