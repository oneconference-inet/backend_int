if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}
'use strict';
const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const path = require('path');
const { type } = require('os');

const env = process.env.NODE_ENV || 'development' || 'production';
const logDir = 'log';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const filename = path.join(logDir, date()+'.log');

function date(){
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; 
  var yyyy = today.getFullYear();
  if(dd<10)
    dd='0'+dd;
  if(mm<10)
    mm='0'+mm;
  today = dd+'-'+mm+'-'+yyyy;
  return today
}



function info(message){
  const logger = createLogger({
    // change level if in dev environment versus production
    level: env === 'development' || 'production' ? 'debug' : 'info',
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      format.printf(info => `{"datetime":"${info.timestamp}","level":"${info.level}","message":"${info.message}"}`)
    ),
    transports: [
      new transports.Console({
        level: 'info',
        format: format.combine(
          format.colorize(),
          format.printf(
            info => `${info.timestamp}: ${info.level}: ${info.message}`
          )
        )
      }),
      new transports.File({ filename }),
      new transports.File({ filename: 'log/main.log' }),    
    ]
  });
  checkDate(logger,message,'info')
}

function warn(message){
  const logger = createLogger({
    // change level if in dev environment versus production
    level: env === 'development' || 'production' ? 'debug' : 'info',
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      format.printf(info => `{"datetime":"${info.timestamp}","level":"${info.level}","message":"${info.message}"}`)
    ),
    transports: [
      new transports.Console({
        level: 'info',
        format: format.combine(
          format.colorize(),
          format.printf(
            info => `${info.timestamp}: ${info.level}: ${info.message}`
          )
        )
      }),
      new transports.File({ filename }),
      new transports.File({ filename: 'log/main.log' }),
    ]
  });
  checkDate(logger,message,'warn')
}

function error(message){
  
  const logger = createLogger({
    // change level if in dev environment versus production
    level: env === 'development' || 'production' ? 'debug' : 'info',
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      format.printf(info => `{"datetime":"${info.timestamp}","level":"${info.level}","message":"${info.message}"}`)
    ),
    transports: [
      new transports.Console({
        level: 'info',
        format: format.combine(
          format.colorize(),
          format.printf(
            info => `${info.timestamp}: ${info.level}: ${info.message}`
          )
        )
      }),
      new transports.File({ filename }),
      new transports.File({ filename: 'log/main.log' }),
    ]
  });
  checkDate(logger,message,'error')
}

function checkDate(logger,message,type){
  const currentDate = new Date() //'December 19, 2020 23:59:00'
  const nextDate = new Date();
  nextDate.setDate(currentDate.getDate() + 1)
  nextDate.setHours(00, 00, 00);
  var next24 = localStorage.getItem("nextDay"); //use
  if (!next24) {
    localStorage.setItem("nextDay", nextDate);
    checkTypeLog(logger,message,type)
  }
  else{
    if (currentDate >= new Date(next24) ){
      localStorage.removeItem("nextDay");
      localStorage.setItem("nextDay", nextDate);
      fs.truncate('log/main.log', 0, function(){console.log('clear main.log file.')})
      checkTypeLog(logger,message,type)
    }
    else{
      checkTypeLog(logger,message,type)
    }
  }
}

const checkTypeLog = (logger,message,type)=>{
  return type === 'info' ? logger.info(message) 
  : type === 'warn' ? logger.warn(message)
  : logger.error(message);
}

module.exports = {
   info,warn,error
};