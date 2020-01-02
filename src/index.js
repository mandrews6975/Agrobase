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
  document.getElementById('delete_button').style = 'display: ; float: right';
  document.getElementById('edit_group_button').style = 'display: none';
  document.getElementById('current_contacts_tab').innerHTML = 'Contact Groups';
  let numElements = document.getElementById('contacts_table').children.length;
  for(let i = 0; i < numElements; i++){
    document.getElementById('contacts_table').children[0].remove();
  }
  let groups = getGroupNames();
  for(const group of groups){
    let row = document.createElement('tr');
    let groupListing = document.createElement('td');
    groupListing.appendChild(document.createTextNode(group));
    groupListing.addEventListener('click', () => {
      getGroupData(groupListing.innerHTML.substring(0, groupListing.innerHTML.indexOf('<')));
    });
    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.style = 'float: right';
    groupListing.appendChild(checkbox);
    row.appendChild(groupListing);
    document.getElementById('contacts_table').appendChild(row);
  }
}

function getAllContacts(){
  ipcRenderer.send('get_all_contacts');
  ipcRenderer.on('all_contacts', (event, args) => {
    document.getElementById('delete_button').style = 'display: ; float: right';
    document.getElementById('edit_group_button').style = 'display: none';
    let numElements = document.getElementById('contacts_table').children.length;
    for(let i = 0; i < numElements; i++){
      document.getElementById('contacts_table').children[0].remove();
    }
    //args contains a list of all contacts
    for(const contact of args.contacts){
      let row = document.createElement('tr');
      let contactListing = document.createElement('td');
      contactListing.appendChild(document.createTextNode(contact.fname + ' ' + contact.lname + '\n' + contact.phone + '   ' + contact.email));
      contactListing.style = 'white-space: pre';
      let checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.style = 'float: right';
      contactListing.appendChild(checkbox);
      row.appendChild(contactListing);
      document.getElementById('contacts_table').appendChild(row);
    }
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
    document.getElementById('delete_button').style = 'display: none';
    document.getElementById('current_contacts_tab').innerHTML = groupName;
    let numElements = document.getElementById('contacts_table').children.length;
    for(let i = 0; i < numElements; i++){
      document.getElementById('contacts_table').children[0].remove();
    }
    //args contains parsed group json object
    document.getElementById('edit_group_button').style = 'display: ';
    for(const message of args.messages){
      let row = document.createElement('tr');
      let messageListing = document.createElement('td');
      let card = document.createElement('div');
      card.classList.add('card');
      card.classList.add('bg-info');
      card.classList.add('mb-2');
      let cardBody = document.createElement('div');
      cardBody.classList.add('px-1');
      cardBody.classList.add('py-1');
      cardBody.classList.add('card-body');
      let cardTitle = document.createElement('h5');
      cardTitle.classList.add('card-title');
      cardTitle.appendChild(document.createTextNode(message.message));
      cardBody.appendChild(cardTitle);
      cardBody.appendChild(document.createTextNode('Sent: ' + message.time));
      card.appendChild(cardBody);
      messageListing.appendChild(card);
      row.appendChild(messageListing);
      document.getElementById('contacts_table').appendChild(row);
    }
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
  arg = document.getElementById('input_groupName_newGroup').value;
  if(fs.existsSync("data/contacts/groups/" + arg + ".json")){
    document.getElementById("input_groupName_newGroup").placeholder = "Group Name Already Exists";
    document.getElementById("input_groupName_newGroup").value = '';
  }
  else {
    jQuery('#modal_new_group').modal('hide');
    ipcRenderer.send('addNewGroup', arg);
    ipcRenderer.on('groupWritingDone', () => {
      getGroupData("Drivers");
    });
  }
  document.getElementById("input_groupName").value = "";
}

function editGroup(){
  document.getElementById('input_groupName_editGroup').value = document.getElementById('current_contacts_tab').innerHTML;
  ipcRenderer.send('get_all_contacts');
  ipcRenderer.on('all_contacts', (event, allContacts) => {
    let numElements = document.getElementById('edit_group_contacts_table').children.length;
    for(let i = 0; i < numElements; i++){
      document.getElementById('edit_group_contacts_table').children[0].remove();
    }
    ipcRenderer.send('get_group_data', document.getElementById('current_contacts_tab').innerHTML);
    ipcRenderer.on('group_data', (event, groupData) => {
      for(const contact of allContacts.contacts){
        let row = document.createElement('tr');
        let contactListing = document.createElement('td');
        contactListing.appendChild(document.createTextNode(contact.fname + ' ' + contact.lname + '\n' + contact.phone + '   ' + contact.email));
        contactListing.style = 'white-space: pre';
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style = 'float: right';
        let j = 0;
        for(groupContact of groupData.contacts){
          if(groupData.contacts[j].fname == contact.fname && groupData.contacts[j].lname == contact.lname){
            checkbox.checked = true;
            break;
          }
          j++;
        }
        contactListing.appendChild(checkbox);
        row.appendChild(contactListing);
        document.getElementById('edit_group_contacts_table').appendChild(row);
      }
    });
  });
}

function saveGroupChanges(){

}
