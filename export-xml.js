var request = require('sync-request');
var xml2js = require('xml2js');
var fs = require('fs');
var mysql = require('mysql');

/* connect mysql server */
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'kyoino',
  password: 'kyoino039',
  database: 'omeka'
});


connection.query("select record_id, text from omeka_element_texts where text like '{%'", function(err, result, fields){
  rowData = JSON.parse(JSON.stringify(result));
  var annotationJsonDataSet = getAnnotationJsonDataSet(rowData);		
  var data = [];
  for(index in annotationJsonDataSet){
	  var annotationJsonData = JSON.parse(annotationJsonDataSet[index]);
    var manifestUrl = annotationJsonData['on'][0]['within']['@id'];
    var imageSize = getImageSize(manifestUrl);
    var imageName = getImageName(manifestUrl);
    var annotationText = annotationJsonData['resource'][0]['chars'].replace(/(?:<p>)|(?:<\/p>)/g, "");     
    var coordinate = annotationJsonData['on'][0]['selector']['default']['value'].replace(/(?:xywh=)/g, "");
    if(typeof(data[imageName]) === "undefined"){
      var values = [];
      values.push({'annotation': annotationText, 'coordinate': coordinate, 'imageSize': imageSize});
      data[imageName] = values;
    }else{
        data[imageName].push({'annotation': annotationText, 'coordinate': coordinate, 'imageSize': imageSize});
    }
		console.log(imageName + ":" + data[imageName][annotation]);
		/*
	if(Object.keys(data).length == 2){
	  break;
	}*/
  }

  var sortedData = sortByNumberOfAnnotations(data);
  exportXML(sortedData);
});

function getAnnotationJsonDataSet(rowData){
  var annotationJsonDataSet = [];
  for(index in rowData){
	var text = rowData[index]['text'];
	var bool = isJSON(text);
    if(bool){
	  if(text.match(/^(?:{"@context":)(?:.*"chars":)(?:.*"xywh=)/)){
	    annotationJsonDataSet.push(rowData[index]['text']);
	  }
	}else{
	  continue;
	}
  }
  return annotationJsonDataSet;
}


function getImageSize(manifestUrl){
  var imageSize = {};
  var response = request('GET', manifestUrl);
  if(!response.error && response.statusCode === 200){
	var jsonData = JSON.parse(response.body.toString());
	imageSize['height'] = jsonData['sequences'][0]['canvases'][0]['height'];
	imageSize['width'] = jsonData['sequences'][0]['canvases'][0]['width'];
  }
  return imageSize;

}

function exportXML(data){
  console.log('exportXML function start...');
  for(key in data[index]){
	  var annotations = [];
		var annoCount = 0;
    var builder = new xml2js.Builder();
    var fileName = key;
	  var annotationDataSet = data[index][key];
    annotations.push({folder: 'Test'}, {filename: fileName}, {size: {'height': annotationDataSet[0]['imageSize']['height'], 'width': annotationDataSet[0]['imageSize']['width']}});
	  for(index in annotationDataSet){
	    var coordinate = annotationDataSet[index]['coordinate'].split(',');
	    annotations.push({object: {name: 'map_text', bandbox: {xmin: coordinate[0], ymin: coordinate[1], xmax: parseInt(coordinate[0]) + parseInt(coordinate[2]), ymax: parseInt(coordinate[1]) + parseInt(coordinate[3])}}});
	  }
		annoCount += annotationDataSet.length;
		if(annoCount <= 3000){
		  createXML(builder, fileName, annotations, 'Training');
		}else{
			createXML(builder, fileName, annotations, 'Test');
		}
  }
}

function createHeader(folderName, annotationDataSet){
  annotations.push({folder: folderName}, {filename: fileName}, {size: {'height': annotationDataSet[0]['imageSize']['height'], 'width': annotationDataSet[0]['imageSize']['width']}});
}

function createBody(annotationData){
  var coordinate = annotationData['coordinate'].split(',');
	annotations.push({object: {name: 'map_text', bandbox: {xmin: coordinate[0], ymin: coordinate[1], xmax: parseInt(coordinate[0]) + parseInt(coordinate[2]), ymax: parseInt(coordinate[1]) + parseInt(coordinate[3])}}});
}

function createXML(builder, folderName, fileName, annotations){
  var xml = builder.buildObject({annotation: annotations});
  fs.writeFile('./'+folderName+'Annotations/' + fileName.replace(/(?:\.jpg)/g, "") + '.xml', xml, function(err){
	  console.log('exported');
	});
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

function sortByNumberOfAnnotations(data){
  console.log('sortByNumberOfAnnotations function start....');
  var ary = [];
  for(key in data){
    var hash = {};
	hash[key] = data[key];
	ary.push(hash);
  }
  var length = ary.length;
  for(var i=0; i<length; i++){
    for(var num=i+1; num<length; num++){
	  var tmp = ary[i];
	  if(Object.values(ary[i])[0].length < Object.values(ary[num])[0].length){
	    ary[i] = ary[num];
		ary[num] = tmp;
	  }
	}
  }
  return ary;
}

