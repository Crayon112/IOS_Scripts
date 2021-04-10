var city0 = "北京市";

var isp0 = "Crayon";


if ($response.statusCode != 200) {
	var title = city0;
	var subtitle = isp0 + '@' + time;
	var ip = '192.168.1.1';
	var description = '无效节点';
	$done({title, subtitle, ip, description});
}else{
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
	var subtitle = ISP_ValidCheck(obj['org']) + '@' +  time;
	var ip = obj['query'];
	var description = '服务商:'+obj['isp'] + '\n'+'地区:' +City_ValidCheck(obj['regionName']) + '\n' + 'IP:'+ obj['query'] + '\n' +'时区:'+ obj['timezone'];
	$done({title, subtitle, ip, description});
}
