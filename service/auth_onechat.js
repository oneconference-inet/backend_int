const sercretkey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJWaWRlb2NhbGwiLCJuYW1lIjoiT05FQ0hBVFNFUlZJQ0UiLCJpYXQiOjIyMDF9.-llQuCLFEUdv4BdJ1pf0-4KwrfwnXz7ybqS10DFLuBs";
const secretketOnebinar =
  "ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnpkV0lpT2lKV2FXUmxiMk5oYkd3aUxDSnVZVzFsSWpvaVQyNWxZbWx1WVhJaUxDSnBZWFFpT2pJeU1ERjkuSGgzNzVQUU9uMHN0cXhXSU9ESmI1M1RGWlRXOXhvRXlOaXJaaWZ0bVVsWQ==";
module.exports = function (token, service) {
  if (sercretkey === token && service == 'onechat' || service == 'ManageAi' || service == null) {
    return true;
  } else if (secretketOnebinar === token && service == "onebinar") {
    return true;
  } else {
    return false;
  }
};
