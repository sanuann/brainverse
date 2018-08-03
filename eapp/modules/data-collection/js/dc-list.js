let collectionObj = JSON.parse(localStorage.getItem("collectionObj"))
console.log("[dc-list] collectionObj: ", collectionObj)

//let cObj = JSON.parse(localStorage.getItem('saveObj'))
//console.log("cObj::saveObj ", cObj)

function getDCObj(dc){
    return new Promise(function(resolve){
      let url = serverURL+"/acquisitions/local/" + dc
      $.ajax({
        type: "GET",
        url: url,
        accept: "application/json",
        success: function(data){
          console.log('project DC received :success', data)
          resolve(data)
        }//data
      })
    })
}

getDCObj(collectionObj['ID']).then(function(values){
  console.log("[dc-list.js: getDCOBj values: ", values)
  loadDataCollections(values)
})

$('#projectId').append('<h5> Project Name: '+ collectionObj['Name'] +'</h5>')

$('#btn-addSubject').click(addSubjectDataToCollection)

function addSubjectDataToCollection(e){
  e.preventDefault()
  window.location.href = serverURL+"/data-collection/html/dc.html"
}

function convertObjs2dataTableSource(dcObjs){

  console.log("[dc-list.js] array dcObjs:", dcObjs)

  let dcObj = dcObjs.list
  for(j=0;j<dcObj.length;j++){
      let sObj = dcObj[j]
      console.log("[dc-lists: converObj2]sObj: ", sObj)
      //if(cObj['Project']['Name']=== sObj['Project']['Name']){
        if(sObj.hasOwnProperty('Session')){
          sessionIds.push(sObj['Session']['SessionID'])
          sessionNumbers.push(sObj['Session']['SessionNumber'])
          sessionNames.push(sObj['Session']['SessionName'])
          taskIds.push(sObj['AcquisitionActivity']['AcquisitionActivityID'])
          taskNames.push(sObj['AcquisitionActivity']['AcquisitionName'])
          instrumentNames.push(sObj['InstrumentName'])
          statuses.push(sObj['AcquisitionActivity']['Status'])
          subjectIds.push(sObj['SubjectID'])
        }
      //}
    }
  //}
  dataTableSource = []
  for(let k=0; k<sessionNames.length;k++){
    let row = {}
    row['sessionNumber'] = sessionNumbers[k]
    row['sessionName'] = sessionNames[k]
    row['taskName'] = taskNames[k]
    row['instrumentName'] = instrumentNames[k]
    row['status'] = statuses[k]
    row['sessionId'] = sessionIds[k]
    row['taskId'] = taskIds[k]
    row['subjectId'] = subjectIds[k]
    dataTableSource[k] = row
  }
  console.log("[dc-list.js]---dataTableSource:--- ", dataTableSource)
  localStorage.setItem('dataTableSource', JSON.stringify(dataTableSource))
}

function loadDataCollections(values){
  convertObjs2dataTableSource(values)
  var source = {
    localData: dataTableSource,
    dataType: "array",
    dataFields: [{
      name: 'subjectId',
      type:'string'
    },
    {
      name: 'sessionId',
      type:'string'
    },
      {
        name: 'sessionNumber',
        type: 'string'
    }, {
        name: 'sessionName',
        type: 'string'
    }, {
      name: 'taskId',
      type: 'string'
    },
    {
        name: 'taskName',
        type: 'string'
    }, {
        name: 'instrumentName',
        type: 'string'
    }, {
        name: 'status',
        type: 'string'
    }]
  }

  var dataAdapter = new $.jqx.dataAdapter(source)

  $("#activityTable").jqxDataTable({
      width: 1100,
      theme: 'energyblue',
      //pageable: true,
      //pagerMode: 'advanced',
      filterable: true,
      source: dataAdapter,
      columns: [{
        text: 'SubjectID',
        dataField: 'subjectId',
        width: 100
        },
        {
          text: 'Session Number',
          dataField: 'sessionNumber',
          width: 120
      }, {
          text: 'Session Name',
          dataField: 'sessionName',
          width: 200
      }, {
          text: 'Task Name',
          editable: false,
          dataField: 'taskName',
          width: 280
      }, {
          text: 'Instrument Name',
          dataField: 'instrumentName',
          width: 300
      }, {
          text: 'Status',
          dataField: 'status',
          width: 100
      }]
  })

    $('#activityTable').on('rowClick', function (event) {
        var args = event.args
        var row = args.row
        var index = args.index;
        // row key
        var rowKey = args.key;
        console.log("row clicked:", row)
        console.log("index: ", index)
        console.log("rowKey: ", rowKey)
        event.stopPropagation()
        if (row['status'] === 'completed') {
            console.log('true')
            return true
        }
        else {
            console.log("inside else --")
            // row['subjectId'] = $("#subjectId").val()
            localStorage.setItem("action", JSON.stringify(row))
            window.location.href = serverURL + "/data-collection/html/dc-form.html"
        }
        /*row['subjectId'] = $("#subjectId").val()
        localStorage.setItem("action", JSON.stringify(row))
        window.location.href = serverURL + "/data-collection/html/dc-form.html"*/
    })
}

$('#btn-back-dc').click(function(){
    window.location.href = serverURL+"/data-collection/html/dc-mgm.html"
})
$('#btn-back-mn').click(function(){
    window.location.href = serverURL+"/main"
})

$('#btn-export').click(exportCollection);

function exportCollection(e){
    e.preventDefault()
    console.log("-----------inside export Button-----------")
    window.location.href = serverURL+"/data-collection/html/dc-export.html"
}



