var city0 = "北京市";

var isp0 = "Apper";

var time = function (){
	// 获取时间
	var date = new Date();
	function format(p){
	  return p > 10 ? '' + p: '0' + p;
	}
	var year = date.getFullYear();
	var month = format(date.getMonth()+1);
	var day = format(date.getDate());
	var hour = format(date.getHours());
	var minute = format(date.getMinutes());
	var second = format(date.getSeconds());
	return year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second;	
}();

if ($response.statusCode != 200) {
	$.done()
}

function City_ValidCheck(para) {
  return para!=undefined? para: city0;
}

function ISP_ValidCheck(para) {
  return para!=undefined? para: isp0;
}

function Area_check(para) {
  return (para=="中华民国")? "台湾": para;
}

var body = $response.body;
var obj = JSON.parse(body);
var title = City_ValidCheck(obj['city']);
var subtitle = ISP_ValidCheck(obj['org']);
var ip = obj['query'];
var description = '服务商:'+obj['isp'] + '\n'+'地区:' +City_ValidCheck(obj['regionName']) + '\n' + 'IP:'+ obj['query'] + '\n' +'时区:'+ obj['timezone'] + '\n时间:' + time;
$done({title, subtitle, ip, description});
