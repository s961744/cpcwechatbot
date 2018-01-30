'use strict' // 嚴謹模式

const
    http = require('./../http'),
    util = require('util');
/**
 * 讀取成員
 * @param {String} access_token
 * @param {String} userid
 */
exports.getUser = function (accessToken, userid) {  
    return new Promise(function (resolve, reject) {
        // 設定PUT RESTful API連接參數
        var result = "";
        var url = util.format(process.env.API_getUser, accessToken, userid);
        http.requestHttpsGet(url).then(function (data) {
            //console.log("requestGetdata=" + data);
            result = JSON.parse(data);
            //
            if (result.errcode == "0") {
                console.log(JSON.stringify(result));
                resolve(result.name);
            } else {
                // return error msg
                console.log("error, errcode=" + result.errcode);
                reject("error, errocode=" + result.errcode);

            }
        });
        
    });
}

/**
 * 創建成員
 * @param {String} accessToken
 * @param {JSON} userInfo
 */
exports.createUser = function (accessToken, userInfo) {
    return new Promise(function (resolve, reject) {
        var url = util.format(process.env.API_createUser, accessToken);
        console.log("CreateUser url=" + url);
        http.requestHttpsPost(url, userInfo).then(function (data) {
            //console.log("requestGetdata=" + data);
            var result = JSON.parse(data);
            //
            if (result.errcode == "0") {
                console.log(JSON.stringify(result));
            } else {
                // return error msg
                console.log("Create user error, errcode=" + result.errcode);
                resolve(result);
            }
        });
    });
}

/**
 * 更新成員狀態
 * @param {JSON} userInfo
 */
exports.updateUserStatus = function (userAuth) {
    return new Promise(function (resolve, reject) {
        var url = process.env.API_weChatRestful + "/putUserAuth";
        //console.log("url=" + url);
        http.requestHttpPut(url, userAuth).then(function (data)
        {
            console.log("Update wechat_user_auth status result=" + result);
            resolve(result);
        });
    });
}

