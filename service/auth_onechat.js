const secretkeyManageAi = process.env.secretkeyManageAi;
const secretkeyOnechat = process.env.secretkeyOnechat;
const secretkeyOnebinar = process.env.secretkeyOnebinar;
const secretkeyOnedentral = process.env.secretkeyOnedentral;

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
  } else if (secretkeyOnedentral === token && service == 'onedentral') {
    return true;
  } else {
    return false;
  }
};
