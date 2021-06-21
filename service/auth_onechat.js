const secretkeyManageAi = process.env.secretkeyManageAi;
const secretkeyOnechat = process.env.secretkeyOnechat;
const secretkeyOnebinar = process.env.secretkeyOnebinar;
const secretkeyOnedental = process.env.secretkeyOnedental;
const secretkeyJMC = process.env.secretkeyJMC;
const secretkeyTelemedicine = process.env.secretkeyTelemedicine;
const secretkeyEmeeting = process.env.secretkeyEmeeting;
const secretkeyEducation = process.env.secretkeyEducation;

module.exports = function (token, service) {
  if (
    (secretkeyOnechat === token && service == 'onechat') ||
    (secretkeyOnechat === token && service == null)
  ) {
    return true;
  } else if (secretkeyManageAi === token && service == 'manageAi') {
    return true;
  } else if (secretkeyOnebinar === token && service == 'onebinar') {
    return true;
  } else if (secretkeyOnedental === token && service == 'onedental') {
    return true;
  } else if (secretkeyJMC === token && service == 'jmc') {
    return true;
  } else if (secretkeyTelemedicine === token && service == 'telemedicine') {
    return true;
  } else if (secretkeyEmeeting === token && service == 'emeeting') {
    return true;
  } else if (secretkeyEducation === token && service == 'education') {
    return true;
  } else {
    return false;
  }
};
