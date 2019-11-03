function receiveScheduleData() {
  //$("#ScheduleTable").empty();
  ipcRenderer.on('ScheduleData', (event, arg) => {
  //  let numRows = document.getElementById('ScheduleTable').rows.length;
  let numRows = document.getElementById('ScheduleTable').children.length;
    for(var i = 0; i<numRows; i++) {
      document.getElementById('ScheduleTable').children[i].remove();
    }
    for(var i = 0; i<arg.length; i++) {
      let row = document.getElementById('ScheduleTable').insertRow(i);
      let cell = row.insertCell(0);
      cell.innerHTML = arg[i];
    }
  });
  console.log("table updated");
}

function sendDate() {
  console.log("sendDate called");
  let date = document.getElementById('current_date').innerHTML;
  let mm = date.substring(0, 2);
  let dd = date.substring(3, 5);
  let yyyy = date.substring(6);
  ipcRenderer.send('Date', mm + dd + yyyy);
  console.log("date sent");
}

function prevDay(){
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

function nextDay(){
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

function SubmitButtonFunction() {
  console.log("submit button pressed");
  let date = document.getElementById('current_date').innerHTML;
  let mm = date.substring(0, 2);
  let dd = date.substring(3, 5);
  let yyyy = date.substring(6);
  var AMPM = '';
  if(document.getElementById('button_dropdown').innerHTML == 'Event') {
    AMPM = document.getElementById('AMPM_dropdown').innerHTML;
  }
  let args = [mm + dd + yyyy, document.getElementById('input_time').value + AMPM , document.getElementById('input_announcement_event').value];
  ipcRenderer.send('SubmitButtonClick', args);
  sendDate();
  receiveScheduleData();
}
