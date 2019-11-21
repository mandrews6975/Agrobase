const {
  app,
  BrowserWindow
} = require('electron');
const fs = require('fs');
const ipcMain = require('electron').ipcMain;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    width: 1280,
    height: 720,
    minWidth: 1280,
    minHeight: 720,
    show: false
  });

  // Only show mainWindow once all page contents are prepared
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};



const fileWriter = (event, arg, callback) => {
  fs.readFile("data/" + arg[0] + ".json", 'utf8', (err, data) => {
    if (err) {
      return console.log(err);
    }
    let jsonObj = JSON.parse(data);
    let newObj = {
      time: arg[1],
      ampm: arg[2],
      message: arg[3]
    };
    jsonObj.messages.push(newObj);
    // Sort array of messages
    // FIXME
    let sortedMessages = [];
    for(let i = 0; i < jsonObj.messages.length; i++){
      if(jsonObj.messages[i].time == ''){
        sortedMessages.push(jsonObj.messages[i]);
        jsonObj.messages[i] = null;
      }
    }
    for(let i = 0; i < jsonObj.messages.length; i++){
      if(jsonObj.messages[i] != null){
        let minIndex = i;
        for(let j = i + 1; j < jsonObj.messages.length; j++){
          if(jsonObj.messages[j] != null && jsonObj.messages[j].ampm < jsonObj.messages[minIndex].ampm){
            minIndex = j;
          }else if(jsonObj.messages[j] != null && jsonObj.messages[j].ampm == jsonObj.messages[minIndex].ampm){
            if(jsonObj.messages[minIndex].time.substring(0, 2) == '12'){
              jsonObj.messages[minIndex].time.replace('1', '0');
              jsonObj.messages[minIndex].time.replace('2', '0');
            }
            if(jsonObj.messages[j].time.substring(0, 2) == '12'){
              jsonObj.messages[j].time.replace('1', '0');
              jsonObj.messages[j].time.replace('2', '0');
            }
            if(jsonObj.messages[j].time < jsonObj.messages[minIndex].time){
              minIndex = j;
            }
            if(jsonObj.messages[minIndex].time.substring(0, 2) == '00'){
              jsonObj.messages[minIndex].time.replace('0', '1');
              jsonObj.messages[minIndex].time.replace('0', '2');
            }
            if(jsonObj.messages[j].time.substring(0, 2) == '00'){
              jsonObj.messages[j].time.replace('0', '1');
              jsonObj.messages[j].time.replace('0', '2');
            }
          }
        }
        sortedMessages.push(jsonObj.messages[minIndex]);
        jsonObj.messages[minIndex] = null;
      }
    }
    jsonObj.messages = sortedMessages;
    let jsonString = JSON.stringify(jsonObj);
    fs.writeFile("data/" + arg[0] + ".json", jsonString, function(err) {
      if (err) {
        return console.log(err);
      }
      if (callback) callback();
    });
  });
}

const returnData = (event, arg) => {
  if(fs.existsSync("data/" + arg + ".json")){
    fs.readFile("data/" + arg + ".json", 'utf8', (err, data) => {
      if (err) {
        return console.log(err);
      }
      let scheduleData = JSON.parse(data);
      event.sender.send('ScheduleData', scheduleData);
    });
  }else{
    fs.appendFile("data/" + arg + ".json", '{"messages": []}', 'utf8', function(err) {
      if (err) {
        return console.log(err);
      }
      //readFile only can occur after appendFile callback
      fs.readFile("data/" + arg + ".json", 'utf8', (err, data) => {
        if (err) {
          return console.log(err);
        }
        let scheduleData = JSON.parse(data);
        event.sender.send('ScheduleData', scheduleData);
      });
    });
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);
//createWindow;
//ipc.on('SubmitButtonClick', fileWriter);
app.on('ready', () => {
  ipcMain.on('SubmitButtonClick', (event, arg) => {
    fileWriter(event, arg, () => {
      event.sender.send('fileWritingDone');
    });
  });
  ipcMain.on('Date', (event, arg) => {
    returnData(event, arg);
  });
});




// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
