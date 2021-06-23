var express = require('express');
var router = express.Router();
const sha1 = require('sha1');
const path = require('path');
var roomonechat = require('../models/session_roomonechat');
var roomManageai = require('../models/session_roomManageAi');
var roomOnebinar = require('../models/session_roomOnebinar');
var roomOnedental = require('../models/session_roomOnedental');
var roomJmc = require('../models/session_roomJmc');
var roomTelemedicine = require('../models/session_roomTelemedicine');
var roomEmeeting = require('../models/session_roomEmeeting');
var roomEducation = require('../models/session_roomEducation');
var oneboxService = require('../service/onebox');
var roomonecon = require('../models/session_room');
const auth = require('../service/auth_onechat');
const code = require('../service/hashcode');
const URL = require('url').URL;
const logger = require('../service/loggerfile');
const { encode, decode } = require('../service/hashcode');
const AWS = require('aws-sdk');
var s3Service = require('../service/s3_storage');
var archiver = require('archiver');
var fs = require('fs');
const axios = require('axios');

async function uploadtoS3(req, res) {
  AWS.config.update({
    accessKeyId: 'DYH22T4REDJ3LK159J3J',
    secretAccessKey: 'LHKzBQqvP/ZPCLoa7q+ce+qA9EnG8iv78hMmX2jo',
    signatureVersion: 'v4',
    endpoint: 'https://s3gw.inet.co.th:8082',
  });
  const s3 = new AWS.S3();
  const myBucket = 'testoneconf';

  let myKey = 'okrimsa.txt';
  let findfile = path.resolve(process.env.path_record, 'prayut.txt');
  fs.readFile(findfile, function (err, data) {
    if (err) {
      throw err;
    }
    params = { Bucket: myBucket, Key: myKey, Body: data };
    s3.putObject(params, function (err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log(
          `Successfully uploaded data to Bucket ${myBucket} filename ${myKey}`
        );
        const url = s3.getSignedUrl('getObject', {
          Bucket: myBucket,
          Key: myKey,
        });
        res.send({
          status: 'success',
          message: 'upload file success',
          data: { url: url },
        });
      }
    });
  });
}

router.get('/getlink/:meetingid', async function (req, res) {
  let filename = req.params.meetingid;
  console.log(filename);
  try {
    let s3link = await s3Service.genpresinedurl(filename);
    res.status(200).json({ status: 'success', url: s3link });
  } catch (error) {
    console.log(error);
  }
});

router.post('/create', async function (req, res, next) {
  let data = req.body;
  // console.log(data); 
  console.log('~ Header ~');
  console.log(req.headers);
  try {
    const tokenkey = req.headers['authorization'].split(' ')[1];
    if (auth(tokenkey, data.tag)) {
      const encodeName = encode(data.name),
        decodeName = decode(encodeName);
      let meetingid = sha1(data.roomname) + '-' + Date.now();
      let tagService = data.tag;
      let key = sha1(meetingid + encodeName);
      let url = process.env.ONECHAT_ROOM_DOMAIN;
      if (!ValidUrl(data.url) && data.url != '' && data.url != null) {
        return res
          .status(400)
          .json({ status: 'error', message: 'url invalid.' });
      }
      let url_redirect =
        data.url == '' || data.url == null
          ? process.env.domain_frontend
          : data.url;
      const optionResult = () => {
        let media = {
          video: false,
          audio: true,
        };
        data.option == 'video' ? (media.video = true) : (media.video = false);
        return media;
      };
      if (tagService == null || tagService == 'onechat') {
        tagService = 'onechat';
        meetingid = meetingid + '-N0jv9PZp8k';
        let session = new roomonechat({
          hostname: encodeName,
          roomname: data.roomname,
          urlroom: url,
          keyroom: key,
          member: [{ name: encodeName, join_at: timeNow(), out_at: '' }],
          meeting_id: meetingid,
          created_at: Date.now(),
        });
        const urlroomToken = {
          role: 'moderator',
          meetingId: meetingid,
          roomname: data.roomname,
          keyroom: key,
          nickname: decodeName,
          option: optionResult(),
          clientid: decodeName + '-' + 'host',
          service: tagService,
          userXmpAuth: process.env.user_jitsi,
          passXmpAuth: process.env.password_jitsi,
          secretRoom: false,
          redirect: url_redirect,
        };
        const token = code.encodeJS(urlroomToken);
        url = url + meetingid + '?' + token;
        await session.save();
        logger.info(
          `service: ${tagService}, name: ${decodeName}, meetingid: ${meetingid} message: create url meeting.`
        );
        res.status(200).send({
          data: {
            urlroom: url,
            meetingid: meetingid,
            key: key,
            option: data.option,
            created_at: Date.now(),
          },
          events: 'CreateRoom',
          status: 'Success',
        });
      } else if (tagService == 'manageAi') {
        tagService = 'manageAi';
        meetingid = meetingid + '-3opbsowhx6';
        let session = new roomManageai({
          hostname: encodeName,
          roomname: data.roomname,
          urlroom: url,
          keyroom: key,
          member: [{ name: encodeName, join_at: timeNow(), out_at: '' }],
          meeting_id: meetingid,
          oneboxaccountid: data.account_id,
          created_at: Date.now(),
        });
        const urlroomToken = {
          role: 'moderator',
          meetingId: meetingid,
          roomname: data.roomname,
          keyroom: key,
          nickname: decodeName,
          option: optionResult(),
          clientid: decodeName + '-' + 'host',
          service: tagService,
          userXmpAuth: process.env.user_jitsi,
          passXmpAuth: process.env.password_jitsi,
          secretRoom: false,
          redirect: url_redirect,
        };
        const token = code.encodeJS(urlroomToken);
        url = url + meetingid + '?' + token;
        await session.save();
        logger.info(
          `service: ${tagService}, name: ${decodeName}, meetingid: ${meetingid} message: create url meeting.`
        );
        res.status(200).send({
          data: {
            urlroom: url,
            meetingid: meetingid,
            key: key,
            option: optionResult(),
            created_at: timeNow(),
          },
          events: 'CreateRoom',
          status: 'Success',
        });
      } else if (tagService == 'onedental') {
        tagService = 'onedental';
        meetingid = meetingid + '-ox7jai3s1t';
        if (data.folder_id === undefined || data.folder_id === '') {
          res.status(400).send({
            status: 'error',
            error: 'folder_id is require',
          });
        }
        let session = new roomOnedental({
          hostname: encodeName,
          roomname: data.roomname,
          urlroom: url,
          keyroom: key,
          member: [{ name: encodeName, join_at: timeNow(), out_at: '' }],
          meeting_id: meetingid,
          folder_id: data.folder_id,
          oneboxaccountid: data.account_id,
          created_at: Date.now(),
        });

        const urlroomToken = {
          role: 'moderator',
          meetingId: meetingid,
          roomname: data.roomname,
          keyroom: key,
          nickname: decodeName,
          option: optionResult(),
          clientid: decodeName + '-' + 'host',
          service: tagService,
          userXmpAuth: process.env.user_jitsi,
          passXmpAuth: process.env.password_jitsi,
          secretRoom: false,
          redirect: url_redirect,
        };
        const token = code.encodeJS(urlroomToken);
        url = url + meetingid + '?' + token;
        await session.save();
        logger.info(
          `service: ${tagService}, name: ${decodeName}, meetingid: ${meetingid} message: create url meeting.`
        );
        res.status(200).send({
          data: {
            urlroom: url,
            meetingid: meetingid,
            key: key,
            option: optionResult(),
            created_at: timeNow(),
          },
          events: 'CreateRoom',
          status: 'Success',
        });
      } else if (tagService == 'jmc') {
        tagService = 'jmc';
        meetingid = meetingid + '-apdxlkruyg';
        let session = new roomJmc({
          hostname: encodeName,
          roomname: data.roomname,
          urlroom: url,
          keyroom: key,
          member: [{ name: encodeName, join_at: timeNow(), out_at: '' }],
          meeting_id: meetingid,
          oneboxaccountid: data.account_id,
          created_at: Date.now(),
        });
        const urlroomToken = {
          role: 'moderator',
          meetingId: meetingid,
          roomname: data.roomname,
          keyroom: key,
          nickname: decodeName,
          option: optionResult(),
          clientid: decodeName + '-' + 'host',
          service: tagService,
          userXmpAuth: process.env.user_jitsi,
          passXmpAuth: process.env.password_jitsi,
          secretRoom: false,
          redirect: url_redirect,
        };
        const token = code.encodeJS(urlroomToken);
        url = url + meetingid + '?' + token;
        await session.save();
        logger.info(
          `service: ${tagService}, name: ${decodeName}, meetingid: ${meetingid} message: create url meeting.`
        );
        res.status(200).send({
          data: {
            urlroom: url,
            meetingid: meetingid,
            key: key,
            option: optionResult(),
            created_at: timeNow(),
          },
          events: 'CreateRoom',
          status: 'Success',
        });
      } else if (tagService == 'telemedicine') {
        tagService = 'telemedicine';
        meetingid = meetingid + '-vfphdm38o6';
        let session = new roomTelemedicine({
          hostname: encodeName,
          roomname: data.roomname,
          urlroom: url,
          keyroom: key,
          member: [{ name: encodeName, join_at: timeNow(), out_at: '' }],
          meeting_id: meetingid,
          oneboxaccountid: data.account_id,
          created_at: Date.now(),
        });
        const urlroomToken = {
          role: 'moderator',
          meetingId: meetingid,
          roomname: data.roomname,
          keyroom: key,
          nickname: decodeName,
          option: optionResult(),
          clientid: decodeName + '-' + 'host',
          service: tagService,
          userXmpAuth: process.env.user_jitsi,
          passXmpAuth: process.env.password_jitsi,
          secretRoom: false,
          redirect: url_redirect,
        };
        const token = code.encodeJS(urlroomToken);
        url = url + meetingid + '?' + token;
        await session.save();
        logger.info(
          `service: ${tagService}, name: ${decodeName}, meetingid: ${meetingid} message: create url meeting.`
        );
        res.status(200).send({
          data: {
            urlroom: url,
            meetingid: meetingid,
            key: key,
            option: optionResult(),
            created_at: timeNow(),
          },
          events: 'CreateRoom',
          status: 'Success',
        });
      } else if (tagService == 'emeeting') {
        tagService = 'emeeting';
        meetingid = meetingid + '-hakfy0jk6j';
        let session = new roomEmeeting({
          hostname: encodeName,
          roomname: data.roomname,
          urlroom: url,
          keyroom: key,
          member: [{ name: encodeName, join_at: timeNow(), out_at: '' }],
          meeting_id: meetingid,
          oneboxaccountid: data.account_id,
          created_at: Date.now(),
        });
        const urlroomToken = {
          role: 'moderator',
          meetingId: meetingid,
          roomname: data.roomname,
          keyroom: key,
          nickname: decodeName,
          option: optionResult(),
          clientid: decodeName + '-' + 'host',
          service: tagService,
          userXmpAuth: process.env.user_jitsi,
          passXmpAuth: process.env.password_jitsi,
          secretRoom: false,
          redirect: url_redirect,
        };
        const token = code.encodeJS(urlroomToken);
        url = url + meetingid + '?' + token;
        await session.save();

        // let dowload_link = await s3Service.genpresinedurl(`${meetingid}.mp4`)
        ///// test s3 /////
        // console.log(`api getlink => /api/onebox/getlink/${meetingid}.zip`);

        logger.info(
          `service: ${tagService}, name: ${decodeName}, meetingid: ${meetingid} message: create url meeting.`
        );
        res.status(200).send({
          data: {
            urlroom: url,
            meetingid: meetingid,
            key: key,
            option: optionResult(),
            created_at: timeNow(),
            downloadlink: `/api/onechatroom/getlink/${meetingid}.zip`,
          },
          events: 'CreateRoom',
          status: 'Success',
        });
      } else if (tagService == 'onebinar') {
        tagService = 'onebinar';
        meetingid = meetingid + '-S0bwJAfVvc';
        let session = new roomOnebinar({
          hostname: encodeName,
          roomname: data.roomname,
          urlroom: url,
          keyroom: key,
          member: [{ name: encodeName, join_at: timeNow(), out_at: '' }],
          meeting_id: meetingid,
          created_at: Date.now(),
        });
        const urlroomToken = {
          role: 'moderator',
          meetingId: meetingid,
          roomname: data.roomname,
          keyroom: key,
          nickname: decodeName,
          option: optionResult(),
          clientid: decodeName + '-' + 'host',
          service: tagService,
          userXmpAuth: process.env.user_jitsi,
          passXmpAuth: process.env.password_jitsi,
          secretRoom: false,
          redirect: url_redirect,
        };
        const token = code.encodeJS(urlroomToken);
        url = url + meetingid + '?' + token;
        await session.save();
        logger.info(
          `service: ${tagService}, name: ${decodeName}, meetingid: ${meetingid} message: create url meeting.`
        );
        res.status(200).send({
          data: {
            urlroom: url,
            meetingid: meetingid,
            key: key,
            option: data.option,
            created_at: timeNow(),
          },
          events: 'CreateRoom',
          status: 'Success',
        });
      } else if (tagService == 'education') {
        tagService = 'education';
        meetingid = meetingid + '-tRFJweUQm';
        let session = new roomEducation({
          hostname: encodeName,
          roomname: data.roomname,
          urlroom: url,
          keyroom: key,
          member: [{ name: encodeName, join_at: timeNow(), out_at: '' }],
          oneboxaccountid: data.account_id,
          meeting_id: meetingid,
          created_at: Date.now(),
        });
        const urlroomToken = {
          role: 'moderator',
          meetingId: meetingid,
          roomname: data.roomname,
          keyroom: key,
          nickname: decodeName,
          option: optionResult(),
          clientid: decodeName + '-' + 'host',
          service: tagService,
          userXmpAuth: process.env.user_jitsi,
          passXmpAuth: process.env.password_jitsi,
          secretRoom: false,
          redirect: url_redirect,
        };
        const token = code.encodeJS(urlroomToken);
        url = url + meetingid + '?' + token;
        await session.save();
        logger.info(
          `service: ${tagService}, name: ${decodeName}, meetingid: ${meetingid} message: create url meeting.`
        );
        res.status(200).send({
          data: {
            urlroom: url,
            meetingid: meetingid,
            key: key,
            option: data.option,
            created_at: timeNow(),
          },
          events: 'CreateRoom',
          status: 'Success',
        });
      } else {
        res.status(401).send({
          status: 'error',
          error: 'no service ' + tagService,
        });
      }
    } else {
      console.log('~ tokenkey ~');
      console.log(tokenkey);
      res.status(401).send({
        status: 'AuthError',
        error: 'SecretKey-Wrong',
      });
    }
  } catch (error) {
    console.log(error);
    // next(error);
    res.status(401).send({
      status: 'Error',
      error: 'Unauthorize',
    });
  }
});

router.post('/join', async function (req, res, next) {
  try {
    let data = req.body;
    const tokenkey = req.headers['authorization'].split(' ')[1];
    if (auth(tokenkey, data.tag)) {
      const encodeName = encode(data.name),
        decodeName = decode(encodeName);
      let tagService = data.tag;
      let roomdata;
      let arrJoin;
      let url = process.env.ONECHAT_ROOM_DOMAIN + data.meetingid + '?';
      let url_redirect =
        data.url == '' || data.url == null
          ? process.env.domain_frontend
          : data.url;
      const optionResult = () => {
        let media = {
          video: false,
          audio: true,
        };
        data.option == 'video' ? (media.video = true) : (media.video = false);
        return media;
      };
      if (tagService == null || tagService == 'onechat') {
        tagService == 'onechat';
        roomdata = await roomonechat.findOne({ meeting_id: data.meetingid });
        if (roomdata) {
          if (roomdata.keyroom !== data.key) {
            logger.error(
              `service: ${tagService}, name:${decodeName} meetingid: ${data.meetingid} message: password invalid.`
            );
            res.status(400).send({ status: 'ERROR', error: 'WrongKey' });
          } else {
            const urlroomToken = {
              role: 'attendee',
              meetingId: data.meetingid,
              roomname: roomdata.roomname,
              keyroom: roomdata.keyroom,
              nickname: decodeName,
              option: optionResult(),
              clientid: `${decodeName}`,
              service: 'onechat',
              secretRoom: false,
              redirect: url_redirect,
            };
            const token = code.encodeJS(urlroomToken);
            url = url + token;
            let joindata = updateJoinTime(roomdata.member, encodeName);
            if (joindata.statusJoin) {
              await roomonechat.updateOne(
                { meeting_id: data.meetingid },
                { member: joindata.arrMember }
              );
              logger.info(
                `service: ${tagService}, name: ${decodeName}, meetingid: ${data.meetingid} message: join meeting again.`
              );
            } else {
              arrJoin = joindata.arrMember;
              arrJoin.push({
                name: encodeName,
                join_at: timeNow(),
                out_at: '',
              });
              await roomonechat.updateOne(
                { meeting_id: data.meetingid },
                { member: arrJoin }
              );
            }
            logger.info(
              `service: ${tagService}, name: ${decodeName}, meetingid: ${data.meetingid} message: join meeting.`
            );
            res.status(200).send({
              data: {
                urlroom: url,
                name_join: decodeName,
                meetingid: data.meetingid,
                join_at: Date.now(),
                option: data.option,
              },
              events: 'JoinRoom',
              status: 'Success',
            });
          }
        } else {
          logger.error(
            `service: ${tagService}, name:${decodeName} meetingid: ${data.meetingid} message: meetingid is wrong.`
          );
          res
            .status(400)
            .json({ status: 'error', message: 'meetingid is wrong' });
        }
      } else if (tagService == 'onebinar') {
        roomdata = await roomOnebinar.findOne({ meeting_id: data.meetingid });
        if (roomdata) {
          if (roomdata.keyroom !== data.key) {
            logger.error(
              `service: ${tagService}, name:${decodeName} meetingid: ${data.meetingid} message: password invalid.`
            );
            res.status(400).send({ status: 'ERROR', error: 'WrongKey' });
          } else {
            const urlroomToken = {
              role: 'attendee',
              meetingId: data.meetingid,
              roomname: roomdata.roomname,
              keyroom: roomdata.keyroom,
              nickname: decodeName,
              option: optionResult(),
              clientid: `${decodeName}`,
              service: tagService,
              redirect: url_redirect,
            };
            const token = code.encodeJS(urlroomToken);
            url = url + token;
            let joindata = updateJoinTime(roomdata.member, encodeName);
            if (joindata.statusJoin) {
              await roomOnebinar.updateOne(
                { meeting_id: data.meetingid },
                { member: joindata.arrMember }
              );
              logger.info(
                `service: ${tagService}, name: ${decodeName}, meetingid: ${data.meetingid} message: join meeting again.`
              );
            } else {
              arrJoin = joindata.arrMember;
              arrJoin.push({
                name: encodeName,
                join_at: timeNow(),
                out_at: '',
              });
              await roomOnebinar.updateOne(
                { meeting_id: data.meetingid },
                { member: arrJoin }
              );
            }
            logger.info(
              `service: ${tagService}, name: ${decodeName}, meetingid: ${data.meetingid} message: join meeting.`
            );
            res.status(200).send({
              data: {
                urlroom: url,
                name_join: decodeName,
                meetingid: data.meetingid,
                join_at: timeNow(),
                option: optionResult(),
              },
              events: 'JoinRoom',
              status: 'Success',
            });
          }
        } else {
          logger.error(
            `service: ${tagService}, name:${decodeName} meetingid: ${data.meetingid} message: meetingid is wrong.`
          );
          res
            .status(400)
            .json({ status: 'error', message: 'meetingid is wrong' });
        }
      } else if (tagService == 'manageAi') {
        if (!ValidUrl(data.url) && data.url != '' && data.url != null) {
          return res
            .status(400)
            .json({ status: 'error', message: 'url invalid.' });
        }
        roomdata = await roomManageai.findOne({ meeting_id: data.meetingid });
        if (roomdata) {
          if (roomdata.keyroom !== data.key) {
            logger.error(
              `service: ${tagService}, name:${decodeName} meetingid: ${data.meetingid} message: password invalid.`
            );
            res.status(400).send({ status: 'ERROR', error: 'WrongKey' });
          } else {
            const urlroomToken = {
              role: 'attendee',
              meetingId: data.meetingid,
              roomname: roomdata.roomname,
              keyroom: roomdata.keyroom,
              nickname: decodeName,
              option: optionResult(),
              clientid: `${decodeName}`,
              service: tagService,
              redirect: url_redirect,
            };
            const token = code.encodeJS(urlroomToken);
            url = url + token;
            let joindata = updateJoinTime(roomdata.member, encodeName);
            if (joindata.statusJoin) {
              await roomManageai.updateOne(
                { meeting_id: data.meetingid },
                { member: joindata.arrMember }
              );
              logger.info(
                `service: ${tagService}, name: ${decodeName}, meetingid: ${data.meetingid} message: join meeting again.`
              );
            } else {
              arrJoin = joindata.arrMember;
              arrJoin.push({
                name: encodeName,
                join_at: timeNow(),
                out_at: '',
              });
              await roomManageai.updateOne(
                { meeting_id: data.meetingid },
                { member: arrJoin }
              );
            }
            logger.info(
              `service: ${tagService}, name: ${decodeName}, meetingid: ${data.meetingid} message: join meeting.`
            );
            res.status(200).send({
              data: {
                urlroom: url,
                name_join: decodeName,
                meetingid: data.meetingid,
                join_at: timeNow(),
                option: optionResult(),
              },
              events: 'JoinRoom',
              status: 'Success',
            });
          }
        } else {
          logger.error(
            `service: ${tagService}, name:${decodeName} meetingid: ${data.meetingid} message: meetingid is wrong.`
          );
          res
            .status(400)
            .json({ status: 'error', message: 'meetingid is wrong.' });
        }
      } else if (tagService == 'emeeting') {
        if (!ValidUrl(data.url) && data.url != '' && data.url != null) {
          return res
            .status(400)
            .json({ status: 'error', message: 'url invalid.' });
        }
        roomdata = await roomEmeeting.findOne({ meeting_id: data.meetingid });
        if (roomdata) {
          if (roomdata.keyroom !== data.key) {
            logger.error(
              `service: ${tagService}, name:${decodeName} meetingid: ${data.meetingid} message: password invalid.`
            );
            res.status(400).send({ status: 'ERROR', error: 'WrongKey' });
          } else {
            const urlroomToken = {
              role: 'attendee',
              meetingId: data.meetingid,
              roomname: roomdata.roomname,
              keyroom: roomdata.keyroom,
              nickname: decodeName,
              option: optionResult(),
              clientid: `${decodeName}`,
              service: tagService,
              redirect: url_redirect,
            };
            const token = code.encodeJS(urlroomToken);
            url = url + token;
            let joindata = updateJoinTime(roomdata.member, encodeName);
            if (joindata.statusJoin) {
              await roomEmeeting.updateOne(
                { meeting_id: data.meetingid },
                { member: joindata.arrMember }
              );
              logger.info(
                `service: ${tagService}, name: ${decodeName}, meetingid: ${data.meetingid} message: join meeting again.`
              );
            } else {
              arrJoin = joindata.arrMember;
              arrJoin.push({
                name: encodeName,
                join_at: timeNow(),
                out_at: '',
              });
              await roomEmeeting.updateOne(
                { meeting_id: data.meetingid },
                { member: arrJoin }
              );
            }
            logger.info(
              `service: ${tagService}, name: ${decodeName}, meetingid: ${data.meetingid} message: join meeting.`
            );
            res.status(200).send({
              data: {
                urlroom: url,
                name_join: decodeName,
                meetingid: data.meetingid,
                join_at: timeNow(),
                option: optionResult(),
              },
              events: 'JoinRoom',
              status: 'Success',
            });
          }
        } else {
          logger.error(
            `service: ${tagService}, name:${decodeName} meetingid: ${data.meetingid} message: meetingid is wrong.`
          );
          res
            .status(400)
            .json({ status: 'error', message: 'meetingid is wrong.' });
        }
      } else if (tagService == 'education') {
        if (!ValidUrl(data.url) && data.url != '' && data.url != null) {
          return res
            .status(400)
            .json({ status: 'error', message: 'url invalid.' });
        }
        roomdata = await roomEducation.findOne({ meeting_id: data.meetingid });
        if (roomdata) {
          if (roomdata.keyroom !== data.key) {
            logger.error(
              `service: ${tagService}, name:${decodeName} meetingid: ${data.meetingid} message: password invalid.`
            );
            res.status(400).send({ status: 'ERROR', error: 'WrongKey' });
          } else {
            const urlroomToken = {
              role: 'attendee',
              meetingId: data.meetingid,
              roomname: roomdata.roomname,
              keyroom: roomdata.keyroom,
              nickname: decodeName,
              option: optionResult(),
              clientid: `${decodeName}`,
              service: tagService,
              redirect: url_redirect,
            };
            const token = code.encodeJS(urlroomToken);
            url = url + token;
            let joindata = updateJoinTime(roomdata.member, encodeName);
            if (joindata.statusJoin) {
              await roomEmeeting.updateOne(
                { meeting_id: data.meetingid },
                { member: joindata.arrMember }
              );
              logger.info(
                `service: ${tagService}, name: ${decodeName}, meetingid: ${data.meetingid} message: join meeting again.`
              );
            } else {
              arrJoin = joindata.arrMember;
              arrJoin.push({
                name: encodeName,
                join_at: timeNow(),
                out_at: '',
              });
              await roomEducation.updateOne(
                { meeting_id: data.meetingid },
                { member: arrJoin }
              );
            }
            logger.info(
              `service: ${tagService}, name: ${decodeName}, meetingid: ${data.meetingid} message: join meeting.`
            );
            res.status(200).send({
              data: {
                urlroom: url,
                name_join: decodeName,
                meetingid: data.meetingid,
                join_at: timeNow(),
                option: optionResult(),
              },
              events: 'JoinRoom',
              status: 'Success',
            });
          }
        } else {
          logger.error(
            `service: ${tagService}, name:${decodeName} meetingid: ${data.meetingid} message: meetingid is wrong.`
          );
          res
            .status(400)
            .json({ status: 'error', message: 'meetingid is wrong.' });
        }
      } else if (tagService == 'onedental') {
        if (!ValidUrl(data.url) && data.url != '' && data.url != null) {
          return res
            .status(400)
            .json({ status: 'error', message: 'url invalid.' });
        }
        roomdata = await roomOnedental.findOne({ meeting_id: data.meetingid });
        if (roomdata) {
          if (roomdata.keyroom !== data.key) {
            logger.error(
              `service: ${tagService}, name:${decodeName} meetingid: ${data.meetingid} message: password invalid.`
            );
            res.status(400).send({ status: 'ERROR', error: 'WrongKey' });
          } else {
            const urlroomToken = {
              role: 'attendee',
              meetingId: data.meetingid,
              roomname: roomdata.roomname,
              keyroom: roomdata.keyroom,
              nickname: decodeName,
              option: optionResult(),
              clientid: `${decodeName}`,
              service: tagService,
              redirect: url_redirect,
            };
            const token = code.encodeJS(urlroomToken);
            url = url + token;
            let joindata = updateJoinTime(roomdata.member, encodeName);
            if (joindata.statusJoin) {
              await roomOnedental.updateOne(
                { meeting_id: data.meetingid },
                { member: joindata.arrMember }
              );
              logger.info(
                `service: ${tagService}, name: ${decodeName}, meetingid: ${data.meetingid} message: join meeting again.`
              );
            } else {
              arrJoin = joindata.arrMember;
              arrJoin.push({
                name: encodeName,
                join_at: timeNow(),
                out_at: '',
              });
              await roomOnedental.updateOne(
                { meeting_id: data.meetingid },
                { member: arrJoin }
              );
            }
            logger.info(
              `service: ${tagService}, name: ${decodeName}, meetingid: ${data.meetingid} message: join meeting.`
            );
            res.status(200).send({
              data: {
                urlroom: url,
                name_join: decodeName,
                meetingid: data.meetingid,
                join_at: timeNow(),
                option: optionResult(),
              },
              events: 'JoinRoom',
              status: 'Success',
            });
          }
        } else {
          logger.error(
            `service: ${tagService}, name:${decodeName} meetingid: ${data.meetingid} message: meetingid is wrong.`
          );
          res
            .status(400)
            .json({ status: 'error', message: 'meetingid is wrong.' });
        }
      } else if (tagService == 'jmc') {
        if (!ValidUrl(data.url) && data.url != '' && data.url != null) {
          return res
            .status(400)
            .json({ status: 'error', message: 'url invalid.' });
        }
        roomdata = await roomJmc.findOne({ meeting_id: data.meetingid });
        if (roomdata) {
          if (roomdata.keyroom !== data.key) {
            logger.error(
              `service: ${tagService}, name:${decodeName} meetingid: ${data.meetingid} message: password invalid.`
            );
            res.status(400).send({ status: 'ERROR', error: 'WrongKey' });
          } else {
            const urlroomToken = {
              role: 'attendee',
              meetingId: data.meetingid,
              roomname: roomdata.roomname,
              keyroom: roomdata.keyroom,
              nickname: decodeName,
              option: optionResult(),
              clientid: `${decodeName}`,
              service: tagService,
              redirect: url_redirect,
            };
            const token = code.encodeJS(urlroomToken);
            url = url + token;
            let joindata = updateJoinTime(roomdata.member, encodeName);
            if (joindata.statusJoin) {
              await roomJmc.updateOne(
                { meeting_id: data.meetingid },
                { member: joindata.arrMember }
              );
              logger.info(
                `service: ${tagService}, name: ${decodeName}, meetingid: ${data.meetingid} message: join meeting again.`
              );
            } else {
              arrJoin = joindata.arrMember;
              arrJoin.push({
                name: encodeName,
                join_at: timeNow(),
                out_at: '',
              });
              await roomJmc.updateOne(
                { meeting_id: data.meetingid },
                { member: arrJoin }
              );
            }
            logger.info(
              `service: ${tagService}, name: ${decodeName}, meetingid: ${data.meetingid} message: join meeting.`
            );
            res.status(200).send({
              data: {
                urlroom: url,
                name_join: decodeName,
                meetingid: data.meetingid,
                join_at: timeNow(),
                option: optionResult(),
              },
              events: 'JoinRoom',
              status: 'Success',
            });
          }
        } else {
          logger.error(
            `service: ${tagService}, name:${decodeName} meetingid: ${data.meetingid} message: meetingid is wrong.`
          );
          res
            .status(400)
            .json({ status: 'error', message: 'meetingid is wrong.' });
        }
      } else if (tagService == 'telemedicine') {
        if (!ValidUrl(data.url) && data.url != '' && data.url != null) {
          return res
            .status(400)
            .json({ status: 'error', message: 'url invalid.' });
        }
        roomdata = await roomTelemedicine.findOne({
          meeting_id: data.meetingid,
        });
        if (roomdata) {
          if (roomdata.keyroom !== data.key) {
            logger.error(
              `service: ${tagService}, name:${decodeName} meetingid: ${data.meetingid} message: password invalid.`
            );
            res.status(400).send({ status: 'ERROR', error: 'WrongKey' });
          } else {
            const urlroomToken = {
              role: 'attendee',
              meetingId: data.meetingid,
              roomname: roomdata.roomname,
              keyroom: roomdata.keyroom,
              nickname: decodeName,
              option: optionResult(),
              clientid: `${decodeName}`,
              service: tagService,
              redirect: url_redirect,
            };
            const token = code.encodeJS(urlroomToken);
            url = url + token;
            let joindata = updateJoinTime(roomdata.member, encodeName);
            if (joindata.statusJoin) {
              await roomTelemedicine.updateOne(
                { meeting_id: data.meetingid },
                { member: joindata.arrMember }
              );
              logger.info(
                `service: ${tagService}, name: ${decodeName}, meetingid: ${data.meetingid} message: join meeting again.`
              );
            } else {
              arrJoin = joindata.arrMember;
              arrJoin.push({
                name: encodeName,
                join_at: timeNow(),
                out_at: '',
              });
              await roomTelemedicine.updateOne(
                { meeting_id: data.meetingid },
                { member: arrJoin }
              );
            }
            logger.info(
              `service: ${tagService}, name: ${decodeName}, meetingid: ${data.meetingid} message: join meeting.`
            );
            res.status(200).send({
              data: {
                urlroom: url,
                name_join: decodeName,
                meetingid: data.meetingid,
                join_at: timeNow(),
                option: optionResult(),
              },
              events: 'JoinRoom',
              status: 'Success',
            });
          }
        } else {
          logger.error(
            `service: ${tagService}, name:${decodeName} meetingid: ${data.meetingid} message: meetingid is wrong.`
          );
          res
            .status(400)
            .json({ status: 'error', message: 'meetingid is wrong.' });
        }
      }
    } else {
      res.status(401).send({
        status: 'AuthError',
        error: 'SecretKey-Wrong',
      });
    }
  } catch (error) {
    console.log(error);
    // next(error);
    res.status(401).send({
      status: 'Error',
      error: 'Unauthorize',
    });
  }
});

router.post('/checkKey', async function (req, res) {
  try {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    res.header(
      'Access-Control-Allow-Methods',
      'POST, GET, PUT, PATCH, DELETE, OPTIONS'
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Option, Authorization'
    );

    const { meetingid, clientname, name } = req.body;
    let roomdata;
    let nameJoin = encode(name);
    if (clientname == 'oneconference' || clientname == 'onemail') {
      roomdata = await roomonecon.findOne({ meeting_id: meetingid });
      res.send({ key: roomdata.key, urlInvite: roomdata.urlInvite });
    } else if (clientname == 'onechat') {
      roomdata = await roomonechat.findOne({ meeting_id: meetingid });
      let joindata = updateJoinTime(roomdata.member, nameJoin);
      await roomonechat.updateOne(
        { meeting_id: meetingid },
        { member: joindata.arrMember }
      );
      res.send({ key: roomdata.keyroom });
    } else if (clientname == 'manageAi') {
      roomdata = await roomManageai.findOne({ meeting_id: meetingid });
      let joindata = updateJoinTime(roomdata.member, nameJoin);
      await roomManageai.updateOne(
        { meeting_id: meetingid },
        { member: joindata.arrMember }
      );
      res.send({ key: roomdata.keyroom });
    } else if (clientname == 'onedental') {
      roomdata = await roomOnedental.findOne({ meeting_id: meetingid });
      let joindata = updateJoinTime(roomdata.member, nameJoin);
      await roomOnedental.updateOne(
        { meeting_id: meetingid },
        { member: joindata.arrMember }
      );
      res.send({ key: roomdata.keyroom });
    } else if (clientname == 'emeeting') {
      roomdata = await roomEmeeting.findOne({ meeting_id: meetingid });
      let joindata = updateJoinTime(roomdata.member, nameJoin);
      await roomEmeeting.updateOne(
        { meeting_id: meetingid },
        { member: joindata.arrMember }
      );
      res.send({ key: roomdata.keyroom });
    } else if (clientname == 'education') {
      roomdata = await roomEducation.findOne({ meeting_id: meetingid });
      let joindata = updateJoinTime(roomdata.member, nameJoin);
      await roomEducation.updateOne(
        { meeting_id: meetingid },
        { member: joindata.arrMember }
      );
      res.send({ key: roomdata.keyroom });
    } else if (clientname == 'jmc') {
      roomdata = await roomJmc.findOne({ meeting_id: meetingid });
      let joindata = updateJoinTime(roomdata.member, nameJoin);
      await roomJmc.updateOne(
        { meeting_id: meetingid },
        { member: joindata.arrMember }
      );
      res.send({ key: roomdata.keyroom });
    } else if (clientname == 'telemedicine') {
      roomdata = await roomTelemedicine.findOne({ meeting_id: meetingid });
      let joindata = updateJoinTime(roomdata.member, nameJoin);
      await roomTelemedicine.updateOne(
        { meeting_id: meetingid },
        { member: joindata.arrMember }
      );
      res.send({ key: roomdata.keyroom });
    } else if (clientname == 'onebinar') {
      roomdata = await roomOnebinar.findOne({ meeting_id: meetingid });
      let joindata = updateJoinTime(roomdata.member, nameJoin);
      await roomOnebinar.updateOne(
        { meeting_id: meetingid },
        { member: joindata.arrMember }
      );
      res.send({ key: roomdata.keyroom });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({
      status: 'Error',
      error: error,
    });
  }
});

router.post('/endmeeting', async function (req, res, next) {
  try {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    res.header(
      'Access-Control-Allow-Methods',
      'POST, GET, PUT, PATCH, DELETE, OPTIONS'
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Option, Authorization'
    );

    const { meetingid, tag } = req.body;
    let roomdata;
    let arrJoin;
    const tokenkey =
      req.headers['authorization'] !== undefined
        ? req.headers['authorization'].split(' ')[1]
        : null;
    if (auth(tokenkey, tag)) {
      if (tag == 'onechat') {
        roomdata = await roomonechat.findOne(
          { meeting_id: meetingid },
          'member'
        );
        if (roomdata) {
          arrJoin = roomdata.member;
          arrJoin.forEach((e) => {
            if (e.out_at === '') {
              e.out_at = timeNow();
            }
          });
          await roomonechat.updateOne({ meeting_id: meetingid }, roomdata);
          // roomdata.delete();
          logger.info(
            `service: ${tag}, meetingid: ${meetingid} message: endmeeting successfully.`
          );
          res.status(200).send({
            status: 'success',
            message: 'endmeeting successfully.',
          });
        } else {
          res.status(400).send({
            status: 'error',
            message: 'meetingid is wrong.',
          });
        }
      } else if (tag == 'manageAi') {
        roomdata = await roomManageai.findOne(
          { meeting_id: meetingid },
          'member'
        );
        if (roomdata) {
          arrJoin = roomdata.member;
          arrJoin.forEach((e) => {
            if (e.out_at === '') {
              e.out_at = timeNow();
            }
          });
          await roomManageai.updateOne({ meeting_id: meetingid }, roomdata);
          // roomdata.delete();
          logger.info(
            `service: ${tag}, meetingid: ${meetingid} message: endmeeting successfully.`
          );
          res.status(200).send({
            status: 'success',
            message: 'endmeeting successfully.',
          });
        } else {
          res.status(400).send({
            status: 'error',
            message: 'meetingid is wrong.',
          });
        }
      } else if (tag == 'onedental') {
        roomdata = await roomOnedental.findOne(
          { meeting_id: meetingid },
          'member'
        );
        if (roomdata) {
          arrJoin = roomdata.member;
          arrJoin.forEach((e) => {
            if (e.out_at === '') {
              e.out_at = timeNow();
            }
          });
          await roomOnedental.updateOne({ meeting_id: meetingid }, roomdata);
          // roomdata.delete();
          logger.info(
            `service: ${tag}, meetingid: ${meetingid} message: endmeeting successfully.`
          );
          res.status(200).send({
            status: 'success',
            message: 'endmeeting successfully.',
          });
        } else {
          res.status(400).send({
            status: 'error',
            message: 'meetingid is wrong.',
          });
        }
      } else if (tag == 'education') {
        roomdata = await roomEducation.findOne(
          { meeting_id: meetingid },
          'member'
        );
        if (roomdata) {
          arrJoin = roomdata.member;
          arrJoin.forEach((e) => {
            if (e.out_at === '') {
              e.out_at = timeNow();
            }
          });
          await roomEducation.updateOne({ meeting_id: meetingid }, roomdata);
          // roomdata.delete();
          logger.info(
            `service: ${tag}, meetingid: ${meetingid} message: endmeeting successfully.`
          );
          res.status(200).send({
            status: 'success',
            message: 'endmeeting successfully.',
          });
        } else {
          res.status(400).send({
            status: 'error',
            message: 'meetingid is wrong.',
          });
        }
      } else if (tag == 'emeeting') {
        roomdata = await roomEmeeting.findOne(
          { meeting_id: meetingid },
          'member'
        );
        if (roomdata) {
          arrJoin = roomdata.member;
          arrJoin.forEach((e) => {
            if (e.out_at === '') {
              e.out_at = timeNow();
            }
          });
          await roomEmeeting.updateOne({ meeting_id: meetingid }, roomdata);
          // roomdata.delete();
          let toggle_uploads3 = await axios.get(
            `${process.env.path_node_sendfile_uploadzip}${meetingid}`
          );
          logger.info(
            `service: ${tag}, meetingid: ${meetingid} message: endmeeting successfully.`
          );
          res.status(200).send({
            status: 'success',
            message: 'endmeeting successfully.',
          });
        } else {
          res.status(400).send({
            status: 'error',
            message: 'meetingid is wrong.',
          });
        }
      } else if (tag == 'jmc') {
        roomdata = await roomJmc.findOne({ meeting_id: meetingid }, 'member');
        if (roomdata) {
          arrJoin = roomdata.member;
          arrJoin.forEach((e) => {
            if (e.out_at === '') {
              e.out_at = timeNow();
            }
          });
          await roomJmc.updateOne({ meeting_id: meetingid }, roomdata);
          // roomdata.delete();
          logger.info(
            `service: ${tag}, meetingid: ${meetingid} message: endmeeting successfully.`
          );
          res.status(200).send({
            status: 'success',
            message: 'endmeeting successfully.',
          });
        } else {
          res.status(400).send({
            status: 'error',
            message: 'meetingid is wrong.',
          });
        }
      } else if (tag == 'telemedicine') {
        roomdata = await roomTelemedicine.findOne(
          { meeting_id: meetingid },
          'member'
        );
        if (roomdata) {
          arrJoin = roomdata.member;
          arrJoin.forEach((e) => {
            if (e.out_at === '') {
              e.out_at = timeNow();
            }
          });
          await roomTelemedicine.updateOne({ meeting_id: meetingid }, roomdata);
          // roomdata.delete();
          logger.info(
            `service: ${tag}, meetingid: ${meetingid} message: endmeeting successfully.`
          );
          res.status(200).send({
            status: 'success',
            message: 'endmeeting successfully.',
          });
        } else {
          res.status(400).send({
            status: 'error',
            message: 'meetingid is wrong.',
          });
        }
      } else if (tag == 'onebinar') {
        roomdata = await roomOnebinar.findOne(
          { meeting_id: meetingid },
          'member'
        );
        if (roomdata) {
          arrJoin = roomdata.member;
          arrJoin.forEach((e) => {
            if (e.out_at === '') {
              e.out_at = timeNow();
            }
          });
          await roomOnebinar.updateOne({ meeting_id: meetingid }, roomdata);
          // roomdata.delete();
          logger.info(
            `service: ${tag}, meetingid: ${meetingid} message: endmeeting successfully.`
          );
          res.status(200).send({
            status: 'success',
            message: 'endmeeting successfully.',
          });
        } else {
          res.status(400).send({
            status: 'error',
            message: 'meetingid is wrong.',
          });
        }
      }
    } else {
      res.status(401).send({
        status: 'AuthError',
        error: 'SecretKey-Wrong',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({
      status: 'Error',
      error: error,
    });
  }
});

router.post('/endjoin', async function (req, res, next) {
  try {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    res.header(
      'Access-Control-Allow-Methods',
      'POST, GET, PUT, PATCH, DELETE, OPTIONS'
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Option, Authorization'
    );
    const { meetingid, tag, name } = req.body;
    const namejoin = encode(name),
      decodeName = decode(namejoin);
    let roomdata;
    const tokenkey =
      req.headers['authorization'] !== undefined
        ? req.headers['authorization'].split(' ')[1]
        : null;
    if (auth(tokenkey, tag)) {
      if (tag == 'onechat') {
        roomdata = await roomonechat.findOne(
          { meeting_id: meetingid },
          'member'
        );
        if (roomdata) {
          let enddata = updateEndJoin(roomdata.member, namejoin);
          await roomonechat.updateOne(
            { meeting_id: meetingid },
            { member: enddata }
          );
          logger.info(
            `service: ${tag}, name: ${decodeName}, meetingid: ${meetingid} message: hangup successfully.`
          );
          res.status(200).send({
            status: 'success',
            message: 'hangup successfully.',
          });
        } else {
          res.status(400).send({
            status: 'error',
            message: 'meetingid is wrong.',
          });
        }
      } else if (tag == 'manageAi') {
        roomdata = await roomManageai.findOne(
          { meeting_id: meetingid },
          'member'
        );
        if (roomdata) {
          let enddata = updateEndJoin(roomdata.member, namejoin);
          await roomManageai.updateOne(
            { meeting_id: meetingid },
            { member: enddata }
          );
          logger.info(
            `service: ${tag}, name: ${decodeName}, meetingid: ${meetingid} message: hangup successfully.`
          );
          res.status(200).send({
            status: 'success',
            message: 'hangup successfully.',
          });
        } else {
          res.status(400).send({
            status: 'error',
            message: 'meetingid is wrong.',
          });
        }
      } else if (tag == 'onedental') {
        roomdata = await roomOnedental.findOne(
          { meeting_id: meetingid },
          'member'
        );
        if (roomdata) {
          let enddata = updateEndJoin(roomdata.member, namejoin);
          await roomOnedental.updateOne(
            { meeting_id: meetingid },
            { member: enddata }
          );
          logger.info(
            `service: ${tag}, name: ${decodeName}, meetingid: ${meetingid} message: hangup successfully.`
          );
          res.status(200).send({
            status: 'success',
            message: 'hangup successfully.',
          });
        } else {
          res.status(400).send({
            status: 'error',
            message: 'meetingid is wrong.',
          });
        }
      } else if (tag == 'emeeting') {
        roomdata = await roomEmeeting.findOne(
          { meeting_id: meetingid },
          'member'
        );
        if (roomdata) {
          let enddata = updateEndJoin(roomdata.member, namejoin);
          await roomEmeeting.updateOne(
            { meeting_id: meetingid },
            { member: enddata }
          );
          logger.info(
            `service: ${tag}, name: ${decodeName}, meetingid: ${meetingid} message: hangup successfully.`
          );
          res.status(200).send({
            status: 'success',
            message: 'hangup successfully.',
          });
        } else {
          res.status(400).send({
            status: 'error',
            message: 'meetingid is wrong.',
          });
        }
      } else if (tag == 'jmc') {
        roomdata = await roomJmc.findOne({ meeting_id: meetingid }, 'member');
        if (roomdata) {
          let enddata = updateEndJoin(roomdata.member, namejoin);
          await roomJmc.updateOne(
            { meeting_id: meetingid },
            { member: enddata }
          );
          logger.info(
            `service: ${tag}, name: ${decodeName}, meetingid: ${meetingid} message: hangup successfully.`
          );
          res.status(200).send({
            status: 'success',
            message: 'hangup successfully.',
          });
        } else {
          res.status(400).send({
            status: 'error',
            message: 'meetingid is wrong.',
          });
        }
      } else if (tag == 'telemedicine') {
        roomdata = await roomTelemedicine.findOne(
          { meeting_id: meetingid },
          'member'
        );
        if (roomdata) {
          let enddata = updateEndJoin(roomdata.member, namejoin);
          await roomTelemedicine.updateOne(
            { meeting_id: meetingid },
            { member: enddata }
          );
          logger.info(
            `service: ${tag}, name: ${decodeName}, meetingid: ${meetingid} message: hangup successfully.`
          );
          res.status(200).send({
            status: 'success',
            message: 'hangup successfully.',
          });
        } else {
          res.status(400).send({
            status: 'error',
            message: 'meetingid is wrong.',
          });
        }
      } else if (tag == 'education') {
        roomdata = await roomEducation.findOne(
          { meeting_id: meetingid },
          'member'
        );
        if (roomdata) {
          let enddata = updateEndJoin(roomdata.member, namejoin);
          await roomEducation.updateOne(
            { meeting_id: meetingid },
            { member: enddata }
          );
          logger.info(
            `service: ${tag}, name: ${decodeName}, meetingid: ${meetingid} message: hangup successfully.`
          );
          res.status(200).send({
            status: 'success',
            message: 'hangup successfully.',
          });
        } else {
          res.status(400).send({
            status: 'error',
            message: 'meetingid is wrong.',
          });
        }
      } else if (tag == 'onebinar') {
        roomdata = await roomOnebinar.findOne(
          { meeting_id: meetingid },
          'member'
        );
        if (roomdata) {
          let enddata = updateEndJoin(roomdata.member, namejoin);
          await roomOnebinar.updateOne(
            { meeting_id: meetingid },
            { member: enddata }
          );
          logger.info(
            `service: ${tag}, name: ${decodeName}, meetingid: ${meetingid} message: hangup successfully.`
          );
          res.status(200).send({
            status: 'success',
            message: 'hangup successfully.',
          });
        } else {
          res.status(400).send({
            status: 'error',
            message: 'meetingid is wrong.',
          });
        }
      }
    } else {
      res.status(401).send({
        status: 'AuthError',
        error: 'SecretKey-Wrong',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({
      status: 'Error',
      error: error,
    });
  }
});

router.post('/getKey', async function (req, res) {
  try {
    const { tag, meetingid } = req.body;
    const tokenkey =
      req.headers['authorization'] !== undefined
        ? req.headers['authorization'].split(' ')[1]
        : null;
    if (auth(tokenkey, tag)) {
      roomdata = await roomonechat.findOne(
        { meeting_id: meetingid },
        'keyroom'
      );
      if (roomdata) {
        res.send({ key: roomdata.keyroom });
      } else {
        res
          .status(400)
          .send({ status: 'error', message: 'meetingid invalid.' });
      }
    } else {
      res.status(401).send({
        status: 'AuthError',
        error: 'SecretKey-Wrong',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({
      status: 'Error',
      error: error,
    });
  }
});
function updateJoinTime(arrMember, namejoin, statusJoin = false) {
  arrMember.forEach((e) => {
    if (e.name == namejoin) {
      statusJoin = true;
      e.join_at = timeNow();
    }
  });
  return {
    arrMember,
    statusJoin,
  };
}

function updateEndJoin(arrMember, namejoin) {
  arrMember.forEach((e) => {
    if (e.name == namejoin) {
      e.out_at = timeNow();
    }
  });
  return arrMember;
}

function timeNow() {
  let now = new Date();
  let resultTime = now.toLocaleString();
  return resultTime;
}

const ValidUrl = (s) => {
  try {
    new URL(s);
    return true;
  } catch (err) {
    return false;
  }
};
module.exports = router;
