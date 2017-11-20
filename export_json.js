/*Test内のAnnotationデータ(xml形式)と予測データ(json形式)の結果を比較するために、xmlをjson形式に変換する*/
var fs = require('fs');
var xml2js = require('xml2js');
var jsonfile = require('jsonfile');

fs.readdir('./Test/Annotations', function(err, files){
  for(index in files){
    fs.readFile('./Test/Annotations/' + files[index], function(err, data){
	  xml2js.parseString(data.toString(), function(err, result){
	    var fileName = result.annotation.filename[0];
		var objects = result.annotation.object;
		var regions = [];
	    for(index in objects){
		  var bandbox = {};
		  bandbox['xmin'] = objects[index].bandbox[0]['xmin'][0];
		  bandbox['ymin'] = objects[index].bandbox[0]['ymin'][0];
		  bandbox['xmax'] = objects[index].bandbox[0]['xmax'][0];
		  bandbox['ymax'] = objects[index].bandbox[0]['ymax'][0];
		  regions.push(bandbox);
		}
		var json = jsonfile.writeFileSync('./Test/Jsons/' + fileName.toString().replace(/(?:\.jpg)/g, "") + '.json', {file: fileName, regions: regions}, { encoding: 'utf-8', replacer: null, spaces: null});
	  });
	});
  }
});

