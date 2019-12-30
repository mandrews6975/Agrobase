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

//firstname lastname phone email
const contactFileWriter = (event, arg, callback) => {
  fs.readFile("data/contacts/indiv.json", 'utf8', (err,data) => {
    if (err) {
      return console.log(err);
    }
    let jsonObj = JSON.parse(data);
    let newObj = {
      lname:  arg[0],
      fname:  arg[1],
      phone: arg[2],
      email: arg[3],
    };
    //Might want to include duplicate information check
    jsonObj.contacts.push(newObj);
    let index = jsonObj.contacts.length-1;
    while((index>0) && jsonObj.contacts[index].lname<jsonObj.contacts[index-1].lname) {
      let temp = jsonObj.contacts[index-1];
      jsonObj.contacts[index-1] = jsonObj.contacts[index];
      jsonObj.contacts[index] = temp;
      index--;
    }
    let jsonString = JSON.stringify(jsonObj);
    fs.writeFile("data/contacts/indiv.json", jsonString, function(err) {
      if (err) {
        return console.log(err);
      }
      if (callback) callback();
    });
  });
}

  const returnContactData = (event, arg) => {
    fs.readFile("data/contacts/indiv.json", 'utf8', (err,data) => {
      if (err) {
        return console.log(err);
      }
      let contactData = JSON.parse(data);
      event.sender.send('all_contacts', contactData);
    });
  }

  const newGroupWriter = (event, arg, callback) => {
    fs.appendFile("data/contacts/groups/" + arg + ".json", '{"contacts": [], "messages": []}', 'utf8', function(err) {
      if (err) {
        return console.log(err);
      }
      if(callback) callback();
    });
  }

  const returnGroupArray = (event, arg) => {
    fs.readFile("data/contacts/groups/" + arg + ".json", 'utf8', (err,data) => {
      if (err) {
        return console.log(err);
      }
      let groupData = JSON.parse(data);
      event.sender.send('group_data', groupData);
    });
  }

const scheduleFileWriter = (event, arg, callback) => {
  fs.readFile("data/schedule/" + arg[0] + ".json", 'utf8', (err, data) => {
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
        //Adds message at i after the message at an earlier time is added
        if(minIndex != i) {
          sortedMessages.push(jsonObj.messages[i]);
          jsonObj.messages[i] = null;
        }
      }
    }
    jsonObj.messages = sortedMessages;
    let jsonString = JSON.stringify(jsonObj);
    fs.writeFile("data/schedule/" + arg[0] + ".json", jsonString, function(err) {
      if (err) {
        return console.log(err);
      }
      if (callback) callback();
    });
  });
}

const returnScheduleData = (event, arg) => {
  if(fs.existsSync("data/schedule/" + arg + ".json")){
    fs.readFile("data/schedule/" + arg + ".json", 'utf8', (err, data) => {
      if (err) {
        return console.log(err);
      }
      let scheduleData = JSON.parse(data);
      event.sender.send('ScheduleData', scheduleData);
    });
  }else{
    fs.appendFile("data/schedule/" + arg + ".json", '{"messages": []}', 'utf8', function(err) {
      if (err) {
        return console.log(err);
      }
      let scheduleData = [];
      event.sender.send('ScheduleData', scheduleData);
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
    scheduleFileWriter(event, arg, () => {
      event.sender.send('scheduleWritingDone');
    });
  });
  ipcMain.on('Date', (event, arg) => {
    returnScheduleData(event, arg);
  });
  ipcMain.on('addNewContact', (event, arg) => {
    contactFileWriter(event, arg, () => {
      event.sender.send('contactWritingDone');
    });
  });
  ipcMain.on('get_all_contacts', (event, arg) => {
    returnContactData(event, arg);
  });
  ipcMain.on('addNewGroup', (event, arg) => {
    newGroupWriter(event, arg, () => {
      event.sender.send("groupWritingDone");
    });
  });
  ipcMain.on('get_group_data', (event, arg) => {
    returnGroupArray(event, arg);
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
