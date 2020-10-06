const { remote, dialog } = require('electron');
let currWindow = remote.BrowserWindow.getFocusedWindow();

window.openFile = () => {
    dialog.showOpenDialog(currWindow);
};