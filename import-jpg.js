/*イメージサーバ内からjpg画像をシステム内にインポートする*/
var request = require('sync-request');
var fs = require('fs');
var sprintf = require('sprintf-js').sprintf;
var pathPrefix = './VOC2012/JPEGImages/';
var i = 0;

while(true){
  var fileNumber = sprintf("%04d", i);
  var url = 'http://192.168.1.47:5004/images/2017-10-27-'+ fileNumber + '.jpg/full/full/0/default.jpg';
  console.log(url);
  var response = request('GET', url);

  if(!response.error && response.statusCode === 200){
    var imageName = url.replace(/(?:http:\/\/192.168.1.47:5004\/images\/)|(?:\/full\/full\/0\/default\.jpg)/g, "");
		var body = response.body;
    fs.writeFileSync(pathPrefix + imageName, body, 'binary');
	console.log('インポート');
  }else{
	console.log('インポート完了');
	return;
  }
  i+=1;
}
