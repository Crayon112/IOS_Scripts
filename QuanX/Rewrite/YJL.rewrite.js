
/**
 * @fileoverview Example of HTTP rewrite of response header.
 *
 * @supported Quantumult X (v1.0.5-build183)
 *
 * [rewrite_local]
 * ^http://example\.com/resource8/ url script-response-header response-header.js
 */

// $request.scheme, $request.method, $request.url, $request.path, $request.headers
// $response.statusCode, $response.headers

var mbody = $response.body;

mbody = {
  "message" : "执行成功",
  "data" : {
    "promotionChannelId" : "178257641941499904",
    "expireTime" : "2021-04-27 22:05:00",
    "loginTime" : "2021-03-27 22:18:55",
    "phone" : "9A4CB3E1-3369-40F6-A553-2576D8B8E52C",
    "packagesBalance" : "",
    "expired" : false,
    "signedToday" : true,
    "signInfo" : {
      "signedToday" : true,
      "signedDays" : 100,
      "signedAward" : "签到赠送套餐"
    },
    "signedDays" : 100,
    "paying" : true,
    "createTime" : "2021-03-27 22:05:00",
    "userId" : "428313520019341312",
    "secretKey" : "b8792991-4ede-49f8-a4b1-8878acdc90cb",
    "username" : "9A4CB3E1-3369-40F6-A553-2576D8B8E52C",
    "signedDuration" : 100,
    "shareCodeStr" : "WEKJJI",
    "email" : "",
    "shareCode" : "42103560"
  },
  "code" : 0
}

var modifiedStatus = 'HTTP/1.1 200 OK';

$done({body: mbody});
// $done({headers : modifiedHeaders});
// $done({}); // Not changed.
