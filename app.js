const request = require('request');
const fs = require('fs');
const fritz = require('fritzbox.js');
const options = require('./options.js');
const dayjs = require('dayjs');

const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());

const Logger = require('./logger');
const logger = new Logger();

async function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

async function getData(configItem)
{
  let finalWriteResult = [];

  if(configItem.GetCurrent == undefined && configItem.Date == undefined)
  {
    var now = dayjs();
    let datePart = now.format('YYYY_MM_DD');
    let pat = './'+datePart+'.json';
    if(fs.existsSync(pat)==true)
    {
      await readFile(pat).then(response => {

        let rrr = JSON.parse(response);
        finalWriteResult.push(...rrr);
        finalWriteResult.push(...resultJson);
      })
      .catch(error => {
        logger.error(error);
      });
    }
    else
    {
      finalWriteResult.push(...resultJson);
    }
  }
  else if(configItem.Date != undefined)
  {
    let pat = './'+configItem.Date+'.json';
    if(fs.existsSync(pat)==true)
    {
      await readFile(pat).then(response => {

        let rrr = JSON.parse(response);
        finalWriteResult.push(...rrr);
        //finalWriteResult.push(...resultJson);
      })
      .catch(error => {
        logger.error(error);
      });
    }
  }
  else if(configItem.GetCurrent != undefined)
  {
    // tbd.
  }

  return JSON.stringify(finalWriteResult,null, '\t');
}

app.get('/XXJson', async (req, res) => {
  
  let configItem = {};
  configItem.GetCurrent = req.query.Days;
  configItem.Date = req.query.Date;

  res.type('application/json');
  await getData(configItem).then(response => {
    res.send(response);
  })
  .catch(error => {
    logger.error(error);
  });
});

app.get('/XX', (req, res) => {
  logger.log(__dirname);
  res.sendFile(__dirname+'/index.html');
});

let mu = [];

app.get('/Raw', (req, res) => {
  res.json(mu);
});

app.get('/CreateRaw', (req, res) => {

  mu = [];
  
  try {
    let ttt = fs.readdirSync('./', {withFileTypes: true})
              .filter(item => !item.isDirectory())
              .filter(item => item.name.startsWith("20"))
              .map(item => item.name);

    ttt.forEach(element => {
      const data = fs.readFileSync('./'+element, 'utf8');
      const jso = JSON.parse(data);
      let lenjso = jso.length;
      let arr = new Array(lenjso);

      for(let a=0; a < lenjso; a++)
      {
        const jso_1 = JSON.parse(jso[a]);
        let loc = {};
        loc.Data = jso_1.Data;
        loc.Time = jso_1.Time;
        arr[a] = loc;
      }
        console.log(arr);
        mu.push(arr);
    });
    // const frameworksData = JSON.stringify(arr)
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.get('/config.js', (req, res) => {
  res.sendFile(__dirname+'/config.js');
});

app.get('/chart.min.js', (req, res) => {
  res.sendFile(__dirname+'/chart.min.js');
});

app.listen(2999, () =>
  logger.log(`Selrver listening on port 2999!`),
);

app.use(function(req, res){
  //res.sendStatus(404);
});

const url = 'http://'+options.boxip+'/data.lua';
    
const headers = { 
     'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
     'Content-Type' : 'application/x-www-form-urlencoded' 
};

var currentJson = {};
var channelDs = {};
var channelUs = {};
var writeCounter = 0;
var resultJson = [];
var path = '';
    

async function login () {
    const sId = await fritz.getSessionId(options).then(sessionId => 
    {
      if (sessionId.error) {
        logger.log('Error:', sessionId.error.message)
        process.exit(1)
      } else {
      
      logger.log('SID: ' + sessionId);
  
      var form = { xhr: '1', sid: sessionId, lang: 'de', page: 'docInfo', xhrId: 'all'};
      
      request.post({ url: url, form: form, headers: headers }, function (e, r, body) {
          currentJson = JSON.parse(body);        
          Worker();
      });
  
    }
    }).catch(error => {
      logger.error(error);
    }); 
  }

async function callbackFunc() {
    logger.log("Login Called");
    login();
}

function Worker()
{
    var now = dayjs();

    let datePart = now.format('YYYY_MM_DD'); 
    let currentTime =now.format('YYYY-MM-DDTHH:mm:ssZ') ;

    logger.log(currentJson);

    channelDs.Data = currentJson.data.channelDs.docsis30;
    channelUs.Data = currentJson.data.channelUs.docsis30;

    channelDs.Time = currentTime;
    channelUs.Time = currentTime;


    path = './'+datePart+'.json';

    let cur_temp = JSON.stringify(channelUs);
    
    if(cur_temp.length > 425)
      resultJson.push(cur_temp);
    else
      logger.log("Error in String lenght");

    if(writeCounter >90)
    {
      logger.log("I need to write to file...");

      let finalWriteResult = [];

      if(fs.existsSync(path)==true)
      {
        logger.log("FileExist");
        finalWriteResult = JSON.parse(fs.readFileSync(path));
      }

      logger.log("Push it push it");
      finalWriteResult.push(...resultJson);

      logger.log("create file");
      fs.writeFileSync(path, JSON.stringify(finalWriteResult,null, '\t'));
      writeCounter = 0;
      resultJson = [];
    }

    writeCounter++;
}

const timeoutObj = setInterval(callbackFunc, 10000);
const intervalId = timeoutObj[Symbol.toPrimitive](); //intervalId is an interger


