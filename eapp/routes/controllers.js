module.exports = () => {

  const path = require('path')
  const fileUpload = require('express-fileupload')
  const bodyParser = require('body-parser')
  const writeJsonFile = require('write-json-file')
  const uuid = require('uuid-random')
  const loadJsonFile = require('load-json-file')
  const fs = require('fs')
  const moment = require('moment')


  const jsonParser = bodyParser.json()
  //const rdfHelper = require('./../util/graph.js')
  const rdfHelper = require('./../util/nidme-graph.js')

  global.store = app.locals.store
  //global.rgraph = app.locals.rgraph

  app.use(fileUpload())

  /*app.get('/', function(req, res){
    res.render('index')
  })*/

  app.get('/account', ensureAuthenticated, function(req,res){
    res.send({'user':req.user})
  })

  app.post('/projects/new', ensureAuthenticated, jsonParser, function(req, res){
    if (!req.body) return res.sendStatus(400)
    console.log('recived at server side')
    //console.log(req.body)
    let pj_info = req.body
    pj_info['ProjectID'] = uuid()
    console.log(pj_info)
    pid = pj_info['ProjectID'].split('-')
    pname = pj_info['Name'].split(' ')
    let cpath = 'uploads/proj-info-'+ pname[0]+'-'+ pid[0] +'.json'
    writeJsonFile(cpath, req.body).then(() => {
      console.log('done')
      res.json({'status':'success'})
    })
  })

  app.get('/projects/:id', ensureAuthenticated, function(req,res){
    res.send('TODO: project info for id:'+ req.params.id)
  })

  app.post('/projects/:id', ensureAuthenticated, jsonParser,function(req,res){
    res.send('TODO: project info updated!')
  })

  app.get('/projects/list', ensureAuthenticated, function(req,res){
    res.send('TODO: projects list')
  })

  app.get('/upload', ensureAuthenticated, function(req,res){
    console.log('server side')
    res.render('sampleUpload')
  })

  app.post('/upload',ensureAuthenticated, function(req,res){
    console.log(req.files);
    if (!req.files)
      return res.status(400).send('No files were uploaded.');

      // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
      let sampleFile = req.files.sampleFile;

      // Use the mv() method to place the file somewhere on your server
      sampleFile.mv(path.join(__dirname,'/../../uploads/',req.files.sampleFile.name), function(err) {
        if (err)
          return res.status(500).send(err)
        res.json({'status': 'success'})
      })
  })

  app.get('/experiments/new', ensureAuthenticated, function(req,res){
    res.send('TODO: create new experiment form')
  })

  app.post('/experiments/new', ensureAuthenticated, jsonParser,function(req,res){
    res.send('TODO:received experiments info!')
  })

  app.get('/experiments/:id',ensureAuthenticated, function(req,res){
    res.send('TODO:experiment info for id'+ req.params.id)
  })

  app.post('/experiments/:id', ensureAuthenticated, jsonParser,function(req,res){
    res.send('TODO:experiment info updated!')
  })

  app.get('/query/terms', ensureAuthenticated,function(req,res){
    const loadJsonFile = require('load-json-file')
    console.log('loading Terms file')
    loadJsonFile(path.join(__dirname, '/../public/terms/addProjectTerms.json')).then(ob => {
      console.log(ob)
      res.json(ob)
    })
  })

  app.get('/query/instruments', ensureAuthenticated, function(req,res){
    const loadJsonFile = require('load-json-file')
    console.log('loading Terms file')
    loadJsonFile(path.join(__dirname, '/../public/terms/instrumentsTerms.json')).then(ob => {
      console.log(ob)
      res.json(ob)
    })
  })

  app.post('/project-plans/new',ensureAuthenticated, jsonParser, function(req,res){
    if (!req.body) return res.sendStatus(400)
    console.log('recived at server side')
    //console.log(req.body)
    let pj_plan_info = req.body
    pj_plan_info['ProjectPlanID'] = uuid()
    console.log(pj_plan_info)
    pid = pj_plan_info['ProjectPlanID'].split('-')
    pname = pj_plan_info['Project Name'].split(' ')
    let cpath = path.join(__dirname, '/../../uploads/plansdocs/proj-plan-'+ pname[0]+'-'+ pid[0] +'.json')

    writeJsonFile(cpath, req.body).then(() => {
      console.log('done')
      //res.json({'status':'success', 'plan_id':'proj-plan-'+ pname[0]+'-'+ pid[0] +'.json'})
    })
    let obj_info = pj_plan_info
    //obj_info['objID'] = uuid()
    //rdfHelper.saveToRDFstore(obj_info,function(tstring){
    rdfHelper.saveToRDFstore(obj_info,function(graphId,tstring){
      console.log("savetTRDF callback fn: tstring: ", tstring)

      let cpath = path.join(__dirname, '/../../uploads/acquisition/plan-graph-' + obj_info['ProjectPlanID'] + '.ttl')
      let fname = 'plan-graph-' + obj_info['ProjectPlanID'] + '.ttl'

      fs.appendFile(cpath, tstring, function(err) {
        if(err) {
          return console.log(err);
        }
        console.log("The file was saved!");
        res.json({'pid': obj_info['ProjectPlanID'], 'fid': fname})
      })
    })
  })

  app.put('/project-plans/:id', ensureAuthenticated, jsonParser, function(req,res){
    if (!req.body) return res.sendStatus(400)
    console.log("update obj received at server:", req.body)

    let pj_plan_info = req.body
    let previousProjectPlanID = pj_plan_info['ProjectPlanID']
    pj_plan_info['ProjectPlanID'] = uuid()
    pj_plan_info['created'] = moment().format()
    pj_plan_info['wasDerivedFrom'] = previousProjectPlanID
    console.log(pj_plan_info)
    pid = pj_plan_info['ProjectPlanID'].split('-')
    pname = pj_plan_info['Project Name'].split(' ')
    //  let cpath = 'uploads/plansdocs/proj-plan-'+ pname[0]+'-'+ pid[0] +'.json'
    let cpath = path.join(__dirname, '/../../uploads/plansdocs/proj-plan-'+ pname[0]+'-'+ pid[0] +'.json')
    console.log("cpath for file update: ", cpath)
    writeJsonFile(cpath, req.body).then(() => {
    //fs.writeFile(cpath, JSON.stringify(pj_plan_info,null,2), (err) => {
      console.log('json document written done')
      //res.json({'status':'success', 'plan_id':'proj-plan-'+ pname[0]+'-'+ pid[0] +'.json'})
    })
    let obj_info = pj_plan_info

    rdfHelper.saveToRDFstore(obj_info,function(graphId,tstring){
      console.log("saveTRDF callback fn: tstring: ", tstring)

      let cpath = path.join(__dirname, '/../../uploads/acquisition/plan-graph-' + obj_info['ProjectPlanID'] + '.ttl')
      let fname = 'plan-graph-' + obj_info['ProjectPlanID'] + '.ttl'

      fs.appendFile(cpath, tstring, function(err) {
        if(err) {
          return console.log(err);
        }
        console.log("The file was saved!");
        res.json({'pid': obj_info['ProjectPlanID'], 'fid': fname})
      })
    })
  })


  app.get('/project-plans/:name', ensureAuthenticated, function(req,res){
    console.log('loading project-plan file:',req.params.name )
    /*fs.readFile(path.join(__dirname, '/../../uploads/plansdocs/acquisition/'+req.params.name), function(err,contents){
      console.log("contents: ", contents)
      res.send(contents)
    })*/
    loadJsonFile(path.join(__dirname, '/../../uploads/plansdocs/'+req.params.name)).then(ob => {
      console.log("ob:==>", ob)
      res.json(ob)
    })
  })
  app.get('/project-plans', ensureAuthenticated, function(req, res){
    var listOfGraphs = new Promise(function(resolve){
        store.registeredGraphs(function(results, graphs) {
          var values = []
          for (var i = 0; i < graphs.length; i++) {
            values.push(graphs[i].valueOf())
          }
          //console.log("Registered graphs: ", values)
          resolve(values)
        })
      //})
    })
    listOfGraphs.then(function(values){
        var graphOfPromises = values.map(function(graph){
          return new Promise(function(resolve){
            store.execute(queryFunction("<"+graph+">"), function(err,results){
              resolve({
                "origin":results[0].s.value,
                "derivedFrom":results[0].derivedFrom.value,
                "date":results[0].date.value,
                "pjname":results[0].pjname.value
              })
            })//execute
          })//promise
        })//graph of promises
        return Promise.all(graphOfPromises)
  }).then(function(obj){
        console.log("obj:", obj)
        let unique = []
        for(i=0;i<obj.length;i++){
          let flag = true
          //console.log("i=",i, " ", obj[i]["origin"])
          for(j=0;j<obj.length;j++){
            if(obj[i]["origin"] === obj[j]["derivedFrom"]){
              flag = false
              break;
            }
          }
          if(flag){
            unique.push(obj[i])
          }
        }
        console.log("unique array", unique)
        let list = []
        for(i=0;i<unique.length;i++){
          let parr = unique[i]["origin"].split("#")
          let pf = parr[1].split("-")[0].split("_")
          list.push("proj-plan-"+unique[i]["pjname"]+"-"+pf[1]+".json")
        }
        res.json({'list':list})
        //return Promise.resolve(list)
  }).catch(function(error){
    console.log(error)
  })
})

  app.get('/history/project-plans/:name', ensureAuthenticated, function(req,res){
  var listOfGraphs = new Promise(function(resolve){
      store.registeredGraphs(function(results, graphs) {
        var values = []
        for (var i = 0; i < graphs.length; i++) {
          values.push(graphs[i].valueOf())
        }
        console.log("Registered graphs: ", values)
        resolve(values)
      })
    })
  listOfGraphs.then(function(values){
        var graphOfPromises = values.map(function(graph){
          return new Promise(function(resolve){
            store.execute(queryFunction("<"+graph+">"), function(err,results){
              resolve({
                "origin":results[0].s.value,
                "derivedFrom":results[0].derivedFrom.value,
                "date":results[0].date.value,
                "pjname":results[0].pjname.value
              })
            })//execute
          })//promise
        })//graph of promises
        return Promise.all(graphOfPromises)
  }).then(function(objArr){
        //console.log("objArr:", objArr)
        let unique = {}
        let obj = {}
        for(i=0;i<objArr.length;i++){
          let flag = true
          //console.log("i=",i, " ", obj[i]["origin"])
          for(j=0;j<objArr.length;j++){
            if(objArr[i]["origin"] === objArr[j]["derivedFrom"]){
              flag = false
              break;
            }
          }
          if(flag){
            unique[objArr[i]["origin"]] = objArr[i]
          }
          obj[objArr[i]["origin"]] = objArr[i]
        }
        console.log("unique obj", unique)
        console.log("obj: ~~~", obj)
        let dirGraph = {}
        for(k of Object.keys(unique)){
          let list=[]
          let node = obj[k]
          let i = 0
          console.log("key", k);
          console.log("node: ", node["derivedFrom"])
          let parent = node["derivedFrom"]
          while(parent != "http://purl.org/nidash/nidm#plan_None"){
            list[i] = node
            node = {}
            node = obj[parent]
            console.log("node: ", node["derivedFrom"])
            parent = node["derivedFrom"]
            i++
          }
          list[i] = node
          dirGraph[obj[k]["origin"]] = list
        }
        let name = req.params.name
        let history = []
        for(m of Object.keys(dirGraph)){
          let parr = m.split("#")
          let pf = parr[1].split("-")[0].split("_")
          name1 = "proj-plan-"+ dirGraph[m][0]["pjname"]+"-"+pf[1]+".json"
          console.log("name: ", name, " name1: ", name1, " dirgraph: ", dirGraph[m][0]["pjname"])
          if(name == name1){
            history = dirGraph[m]
          }
        }
         res.json(history)
        //res.json(dirGraph)
        //return Promise.resolve(list)
  }).catch(function(error){
    console.log(error)
  })

  })

  app.post('/query',jsonParser,function(req,res){
    res.send('TODO: query is called')
  })

  app.get('/queries', function(req,res){
    res.send('TODO:Queries list')
  })
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next() }
    res.redirect('/')
  }


  function queryFunction(graphId){
    let query = 'PREFIX prov:<http://www.w3.org/ns/prov#>\
    PREFIX nidm:<http://purl.org/nidash/nidm#> \
    SELECT * \
    FROM NAMED '+ graphId + '\
    {GRAPH '+graphId+'{ ?s prov:wasDerivedFrom ?p. \
    } }'

    let query1 = 'PREFIX prov:<http://www.w3.org/ns/prov#>\
    PREFIX nidm:<http://purl.org/nidash/nidm#> \
    PREFIX dc:<http://purl.org/dc/terms/> \
    SELECT * \
    FROM NAMED '+ graphId + '\
    {GRAPH '+graphId+'{ ?s prov:wasDerivedFrom ?derivedFrom ; \
      nidm:ProjectName ?pjname; \
      dc:created ?date.\
    } }'
    return query1
  }
}
