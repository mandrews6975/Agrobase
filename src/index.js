function sendDate() {
  let date = document.getElementById('current_date').innerHTML;
  let mm = date.substring(0, 2);
  let dd = date.substring(3, 5);
  let yyyy = date.substring(6);
  ipcRenderer.send('Date', mm + dd + yyyy);
}
//Waits to recieve list of schedule entries, renders schedule
function receiveScheduleData() {
  ipcRenderer.on('ScheduleData', (event, arg) => {
    let numRows = document.getElementById('ScheduleTable').children.length;
    for (var i = 0; i < numRows; i++) {
      document.getElementById('ScheduleTable').children[i].remove();
    }
    for (var i = 0; i < arg.messages.length; i++) {
      let row = document.getElementById('ScheduleTable').insertRow(i);
      let cell = row.insertCell(0);
      if(arg.messages[i].time != ''){
        cell.innerHTML = arg.messages[i].time + ' ' + arg.messages[i].ampm + ': ' + arg.messages[i].message;
      }else{
        cell.innerHTML = arg.messages[i].message;
      }
    }
  });
}

function prevDay() {
  let date = document.getElementById('current_date').innerHTML;
  let mm = date.substring(0, 2);
  let dd = date.substring(3, 5);
  let yyyy = date.substring(6);
  date = new Date(yyyy, mm - 1, dd);
  date.setDate(date.getDate() - 1);
  dd = String(date.getDate()).padStart(2, '0');
  mm = String(date.getMonth() + 1).padStart(2, '0');
  yyyy = date.getFullYear();
  date = mm + '/' + dd + '/' + yyyy;
  document.getElementById('current_date').innerHTML = date;
  sendDate();
  receiveScheduleData();
}

function nextDay() {
  let date = document.getElementById('current_date').innerHTML;
  let mm = date.substring(0, 2);
  let dd = date.substring(3, 5);
  let yyyy = date.substring(6);
  date = new Date(yyyy, mm - 1, dd);
  date.setDate(date.getDate() + 1);
  dd = String(date.getDate()).padStart(2, '0');
  mm = String(date.getMonth() + 1).padStart(2, '0');
  yyyy = date.getFullYear();
  date = mm + '/' + dd + '/' + yyyy;
  document.getElementById('current_date').innerHTML = date;
  sendDate();
  receiveScheduleData();
}

function changeAnn() {
  document.getElementById('button_dropdown').innerHTML = 'Announcement';
  document.getElementById('input_time').style.display = 'none';
  document.getElementById('AMPM_dropdown').style.display = 'none';
}

function changeEvent() {
  document.getElementById('button_dropdown').innerHTML = 'Event';
  document.getElementById('input_time').style.display = 'block';
  document.getElementById('AMPM_dropdown').style.display = 'block';
}

function changeAM() {
  document.getElementById('AMPM_dropdown').innerHTML = 'AM';
}

function changePM() {
  document.getElementById('AMPM_dropdown').innerHTML = 'PM';
}

function SubmitButtonFunction() {
  let date = document.getElementById('current_date').innerHTML;
  let mm = date.substring(0, 2);
  let dd = date.substring(3, 5);
  let yyyy = date.substring(6);
  var AMPM = '';
  if (document.getElementById('button_dropdown').innerHTML == 'Event') {
    AMPM = document.getElementById('AMPM_dropdown').innerHTML;
  }
  let args = [mm + dd + yyyy, document.getElementById('input_time').value, AMPM, document.getElementById('input_announcement_event').value];
  ipcRenderer.send('SubmitButtonClick', args);
  ipcRenderer.on('scheduleWritingDone', () => {
    sendDate();
    receiveScheduleData();
  });
  document.getElementById('input_time').value = '';
  document.getElementById('input_announcement_event').value = '';
}

function switchAllContacts(){
  document.getElementById('current_contacts_tab').innerHTML = 'All Contacts';
  getAllContacts();
}

function switchContactGroups(){
  document.getElementById('current_contacts_tab').innerHTML = 'Contact Groups';
  getGroupData("Drivers");
  console.log(getGroupNames());
}

function getAllContacts(){
  ipcRenderer.send('get_all_contacts');
  ipcRenderer.on('all_contacts', (event, args) => {
    //args contains a list of all contacts
  });
}

function sendNewMessage(groupName) {

}

function addNewContact(){
  //args array last, first, phone, email
  let lName = document.getElementById('input_LastName').value;
  let fName = document.getElementById('input_FirstName').value;
  let phone = document.getElementById('input_Phone').value;
  let email = document.getElementById('input_Email').value;
  document.getElementById('input_LastName').value = "";
  document.getElementById('input_FirstName').value = "";
  document.getElementById('input_Phone').value = "";
  document.getElementById('input_Email').value = "";
  let args = [lName,fName,phone,email];
  ipcRenderer.send('addNewContact', args);
  ipcRenderer.on('contactWritingDone', () => {
    getAllContacts();
  });
}

function getGroupData(groupName){
  ipcRenderer.send('get_group_data', groupName);
  ipcRenderer.on('group_data', (event, args) => {
    //args contains parsed group json object
    console.log(args);
  });
}

function getGroupNames() {
  let nameList = [];
  let fileList = fs.readdirSync('data/contacts/groups/');
  for(let i = 0; i<fileList.length; i++) {
    nameList.push(fileList[i].split('.').slice(0, -1).join('.'));
  }
  return nameList;
}

function addNewGroup() {
  arg = document.getElementById('input_groupName').value;
  if(fs.existsSync("data/contacts/groups/" + arg + ".json")){
    document.getElementById("input_groupName").placeholder = "Group Name Already Exists";
  }
  else {
    document.getElementById("input_groupName").placeholder = "Group Name";
    jQuery('#modal_new_group').modal('hide');
    ipcRenderer.send('addNewGroup', arg);
    ipcRenderer.on('groupWritingDone', () => {
      getGroupData("Drivers");
    });
  }
  document.getElementById("input_groupName").value = "";
}
