const secretkeyManageAi = process.env.secretkeyManageAi;
const secretkeyOnechat = process.env.secretkeyOnechat;
const secretkeyOnebinar = process.env.secretkeyOnebinar;
const secretkeyOnedental = process.env.secretkeyOnedental;
const secretkeyJMC = process.env.secretkeyJMC;
const secretkeyTelemedicine = process.env.secretkeyTelemedicine;

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
  } else {
    return false;
  }
};
