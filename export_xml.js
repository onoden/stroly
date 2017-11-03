var request = require('sync-request');
var xml2js = require('xml2js');
var fs = require('fs');


/* connect mysql server */
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'kyoino',
  password: 'kyoino039',
  database: 'omeka'
});

connection.query("select record_id, text from omeka_element_texts", function(err, result, fields){
  rowData = JSON.parse(JSON.stringify(result));
  var omekaElementData = refactorData(rowData);
  var data = [];
  for(index in omekaElementData){
	console.log('key数: ' + Object.keys(data).length)
	if(Object.keys(data).length == 10){
	  exportXML(data);
	  var numData = 0;
	  for(key in data){
	    numData += data[key].length;
	  }
	  console.log(numData);
	  return;
	}
    if(omekaElementData[index].length == 8){
		var bool = isJSON(omekaElementData[index][7]);
		if(!bool) continue;
        var manifestJsonData = JSON.parse(omekaElementData[index][7]);
        var manifestUrl = manifestJsonData['on'][0]['within']['@id'];
		var imageName = getImageName(manifestUrl);
		var annotationText = manifestJsonData['resource'][0]['chars'].replace(/(?:<p>)|(?:<\/p>)/g, "");     
		var coordinate = manifestJsonData['on'][0]['selector']['default']['value'].replace(/(?:xywh=)/g, "");
		if(typeof(data[imageName]) === "undefined"){
		  var values = [];
		  values.push({'annotation': annotationText, 'coordinate': coordinate});
		  data[imageName] = values;
		}else{
		  data[imageName].push({'annotation': annotationText, 'coordinate': coordinate});
		}
	console.log(data);
  }
 }
});

function exportXML(data){
  for(key in data){
	var annotations = [];
	var object = [];
    var builder = new xml2js.Builder();
    var fileName = key;
	var annotationDataSet = data[key];
	var parts = [];
	for(index in annotationDataSet){
	  var coordinate = annotationDataSet[index]['coordinate'].split(',');
	  parts.push({part: {name: annotationDataSet[index]['annotation'], bandbox: {xmin: coordinate[0], ymin: coordinate[1], xmax: parseInt(coordinate[0]) + parseInt(coordinate[2]), ymax: parseInt(coordinate[1]) + parseInt(coordinate[3])}}});
	}
    annotations.push({folder: 'VOC2012'}, {filename: fileName}, {object: parts});
    var xml = builder.buildObject({annotation: annotations});
    fs.writeFile('./VOC2012/Annotations/' + fileName.replace(/(?:\.jpg)/g, "") + '.xml', xml, function(err){
	  console.log('exported');
	});
  }
}


function refactorData(rowData){
  array = [];
  for(index in rowData){
    recordId = String(rowData[index]['record_id']);
	if(typeof(array[recordId]) === "undefined"){
	  var values = [];
	  values.push(rowData[index]['text']);
	  array[recordId] = values;
	}else{
	  array[recordId].push(rowData[index]['text']);
	}
  }
  return array;
}

function getImageName(manifestUrl){
  var url = manifestUrl;
  var response = request('GET', url);
  if(!response.error && response.statusCode === 200){
    var data = JSON.parse(response.body);
    var imageUrl = data['sequences'][0]['canvases'][0]['images'][0]['resource']['@id'];
    var imageText = imageUrl.replace(/(?:http:\/\/192.168.1.47:5004\/images\/)|(?:\/full\/full\/0\/default\.jpg)/g, "");
	return imageText;
  }
}

function isJSON(arg){
  arg = (typeof arg === "function") ? arg() : arg;
  if (typeof arg  !== "string") {
    return false;
  }
  try {
    arg = (!JSON) ? eval("(" + arg + ")") : JSON.parse(arg);
    return true;
  } catch (e) {
    return false;
  }
}

