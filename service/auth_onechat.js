const sercretkeyOnechatManageAi = process.env.sercretkeyOnechatManageAi;
const secretkeyOnebinar = process.env.secretkeyOnebinar;
module.exports = function (token, service) {
  if (sercretkeyOnechatManageAi === token && service == 'onechat' || service == 'ManageAi' || service == null) {
    return true;
  } else if (secretkeyOnebinar === token && service == "onebinar") {
    return true;
  } else {
    return false;
  }
};
