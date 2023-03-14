'use strict' // 嚴謹模式

const
    http = require('./../http'),
    util = require('util'),
    fs = require('fs'), // file system
    accessTokenJson = require('./access_token'); // access_token.json

/**
 * 取得Token
 * @param {String} secretType Token類型
 * @param {String} secret secret
 */
exports.getAccessToken = function (secretType, secret){
    return new Promise(function (resolve, reject) {
        // 目前時間
        var currentTime = new Date().getTime();
        // 格式化URL
        var url = util.format(process.env.API_getAccessToken, process.env.corpId, secret);
        // 判斷accessToken是否還有效
        // 已過期時重取
        //console.log("url=" + url + ",secretType=" + secretType);
        switch (secretType) {
            case 'directory':
                if (accessTokenJson.directory.access_token === "" || accessTokenJson.directory.expires_time < currentTime) {
                    http.requestHttpsGet(url).then(function (data) {
                        var result = JSON.parse(data);
                        if (result.errcode == "0") {
                            accessTokenJson.directory.access_token = result.access_token;
                            accessTokenJson.directory.expires_time = new Date().getTime() + (parseInt(result.expires_in) - 200) * 1000;
                            // 更新 accessToken.json
                            console.log(JSON.stringify(accessTokenJson));
                            fs.writeFile('./wechat/access_token.json', JSON.stringify(accessTokenJson), (err) => err && console.error(err));
                            console.log("update " + secretType + " accessToken:" + JSON.stringify(accessTokenJson.directory));
                            // return access_token 
                            resolve(accessTokenJson.directory.access_token);
                        } else {
                            // return error msg
                            resolve(result);
                        }
                    });
                    //尚未過期，直接返回    
                } else {
                    resolve(accessTokenJson.directory.access_token);
                }
                break;
            case 'agent':
                if (accessTokenJson.agent.access_token === "" || accessTokenJson.agent.expires_time < currentTime) {
                    http.requestHttpsGet(url).then(function (data) {
                        var result = JSON.parse(data);
                        if (result.errcode == "0") {
                            accessTokenJson.agent.access_token = result.access_token;
                            accessTokenJson.agent.expires_time = new Date().getTime() + (parseInt(result.expires_in) - 200) * 1000;
                            // 更新 accessToken.json
                            fs.writeFile('./wechat/access_token.json', JSON.stringify(accessTokenJson));
                            console.log("update " + secretType + " accessToken:" + JSON.stringify(accessTokenJson.agent));
                            // return access_token 
                            resolve(accessTokenJson.agent.access_token);
                        } else {
                            // return error msg
                            resolve(result);
                        }
                    });
                    //尚未過期，直接返回    
                } else {
                    resolve(accessTokenJson.agent.access_token);
                }
                break;
            default:

                break;
        }
    });
}