'use strict' // 嚴謹模式

const
    http = require('./../http'),
    util = require('util');
/**
 * 取得媒體內容
 * @param {String} access_token
 * @param {String} userid
 */
exports.getMediaContent = function (accessToken, mediaId) {  
    return new Promise(function (resolve, reject) {
        // 設定PUT RESTful API連接參數
        var url = util.format(process.env.API_getMedia, accessToken, mediaId);
        try {
            http.requestHttpsGet(url).then(function (data) {
                resolve(data);
            });
        }
        catch(e)
        {
            reject("error:" + e);
        }
        
    });
}

/**
 * 媒體內容上傳歸檔
 * @param {Stream} data
 */
exports.uploadMediaContent = function (data) {
    return new Promise(function (resolve, reject) {
        // save file to Server
        var now = new Date().toISOString().
            replace(/T/, ' ').replace(/\..+/, '').replace(/-/g, '').replace(/:/g, '').replace(/\s+/g, "");
        var random = Math.floor(Math.random() * 9999) + 1;
        var FileName = now + random + ".png";
        console.log(FileName);
        var url = 'http://116.50.39.201:7102/FileRESTful/resources/FileRESTful/postFile/WechatImg/' + FileName;
        try {
            http.requestHttpPost(url,data).then(function (data) {
                resolve(data);
            });
        }
        catch (e) {
            reject("error:" + e);
        }
    });
}