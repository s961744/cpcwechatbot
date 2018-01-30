'use strict' // 嚴謹模式

const
    urltil = require('url'),// url模組
    http = require('http'),
    https = require('https');

/**
* 處理http GET
* @param {String} url
*/
exports.requestHttpGet = function (url) {
    return new Promise(function (resolve, reject) {
        http.get(url, function (res) {
            var chunks = [], result = "", size = 0;
            res.on('data', function (chunk) {
                chunks.push(chunk);
                size += chunk.length;
            });
            res.on('end', function () {
                var data = null;
                switch (chunks.length) {
                    case 0: data = new Buffer(0);
                        break;
                    case 1: data = chunks[0];
                        break;
                    default:
                        data = new Buffer(size);
                        for (var i = 0, pos = 0, l = chunks.length; i < l; i++) {
                            var chunk = chunks[i];
                            chunk.copy(data, pos);
                            pos += chunk.length;
                        }
                        break;
                }
                if (data === '[]') {
                    console.log("Empty result.");
                }
                else {
                    resolve(data);
                }
            });
        }).on('error', function (err) {
            reject(err);
        });
    });
}

/**
* 處理http POST
* @param {String} url
*/
exports.requestHttpPost = function (url, data) {
    return new Promise(function (resolve, reject) {
        //解析 url 地址
        var urlData = urltil.parse(url);
        //设置 https.request  options 传入的参数对象
        var options = {
            //目标主机地址
            hostname: urlData.hostname,
            //目标地址 
            path: urlData.path,
            //目标PORT 
            port: urlData.port,
            //请求方法
            method: 'POST'
        };
        var req = http.request(options, function (res) {
            var buffer = [], result = '';
            //用于监听 data 事件 接收数据
            res.on('data', function (data) {
                buffer.push(data);
            });
            //用于监听 end 事件 完成数据的接收
            res.on('end', function () {
                result = Buffer.concat(buffer).toString('utf-8');
                resolve(result);
            })
        })
            //监听错误事件
            .on('error', function (err) {
                console.log(err);
                reject(err);
            });
        //传入数据
        req.write(data);
        req.end();
    });
}

/**
* 處理http PUT
* @param {String} url
*/
exports.requestHttpPut = function (url, data) {
    return new Promise(function (resolve, reject) {
        //解析 url 地址
        var urlData = urltil.parse(url);
        //设置 https.request  options 传入的参数对象
        var options = {
            //目标主机地址
            hostname: urlData.hostname,
            //目标地址 
            path: urlData.path,
            //目标PORT 
            port: urlData.port,
            //请求方法
            method: 'PUT'
        };
        var req = http.request(options, function (res) {
            var buffer = [], result = '';
            //用于监听 data 事件 接收数据
            res.on('data', function (data) {
                buffer.push(data);
            });
            //用于监听 end 事件 完成数据的接收
            res.on('end', function () {
                result = Buffer.concat(buffer).toString('utf-8');
                resolve(result);
            })
        })
            //监听错误事件
            .on('error', function (err) {
                console.log(err);
                reject(err);
            });
        //传入数据
        req.write(data);
        req.end();
    });
}

/**
* 處理https GET
* @param {String} url
*/
exports.requestHttpsGet = function (url) {  
    return new Promise(function (resolve, reject) {
        https.get(url, function (res) {
            var chunks = [], result = "", size = 0;
            res.on('data', function (chunk) {
                chunks.push(chunk);
                size += chunk.length;
            });
            res.on('end', function () {
                var data = null;
                switch (chunks.length) {
                    case 0: data = new Buffer(0);
                        break;
                    case 1: data = chunks[0];
                        break;
                    default:
                        data = new Buffer(size);
                        for (var i = 0, pos = 0, l = chunks.length; i < l; i++) {
                            var chunk = chunks[i];
                            chunk.copy(data, pos);
                            pos += chunk.length;
                        }
                        break;
                }
                if (data === '[]') {
                    console.log("Empty result.");
                }
                else {
                    resolve(data);
                }
            });
        }).on('error', function (err) {
            reject(err);
        });
    });
}

/**
* 處理https POST
* @param {String} url
* @param {String} data
*/
exports.requestHttpsPost = function (url, data) {
    return new Promise(function (resolve, reject) {
        //解析 url 地址
        var urlData = urltil.parse(url);
        //设置 https.request  options 传入的参数对象
        var options = {
            //目标主机地址
            hostname: urlData.hostname,
            //目标地址 
            path: urlData.path,
            //请求方法
            method: 'POST',
            //头部协议
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(data, 'utf-8')
            }
        };
        var req = https.request(options, function (res) {
            var buffer = [], result = '';
            //用于监听 data 事件 接收数据
            res.on('data', function (data) {
                buffer.push(data);
            });
            //用于监听 end 事件 完成数据的接收
            res.on('end', function () {
                result = Buffer.concat(buffer).toString('utf-8');
                resolve(result);
            })
        })
            //监听错误事件
            .on('error', function (err) {
                console.log(err);
                reject(err);
            });
        //传入数据
        req.write(data);
        req.end();
    });
}

