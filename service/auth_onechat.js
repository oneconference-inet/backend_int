const secretkeyManageAi = process.env.secretkeyManageAi;
const secretkeyOnechat = process.env.secretkeyOnechat;
const secretkeyOnebinar = process.env.secretkeyOnebinar;

module.exports = function (token, service) {
  console.log(token, service);
  if (
    secretkeyOnechat === token && service == "onechat" ||
    secretkeyOnechat === token && service == null
  ) {
    return true;
  }else if(secretkeyManageAi === token && service == "manageAi"){
    return true;
  } 
  else if (secretkeyOnebinar === token && service == "onebinar") {
    return true;
  } else {
    return false;
  }
};
