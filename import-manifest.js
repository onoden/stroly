var fs = require('fs-extra');
var request = require('sync-request');
var sprintf = require('sprintf-js').sprintf;

var i = 0;
var date = new Date();
var y = date.getFullYear();
var m = date.getMonth()+1;
var d = date.getDate();
while(true){
  var fileNumber = sprintf("%04d", i);
  var fileName = y+'-'+m+'-'+d+'-'+fileNumber+'.jpg';
  var url = 'http://192.168.1.47:5004/images/' + fileName;
  var response = request('GET', url);


  if(!response.error && response.statusCode === 200){
    var data = JSON.parse(response.body);
    var json = require('../manifest.json');
    json['@id'] = i
    
    var sequences = json.sequences[0];
    sequences['@id'] = i + '_sq'  
    
    var canvases = sequences.canvases[0];
    canvases['@id'] = i + '_cnv'
    canvases.height = data.height;
    canvases.width = data.width;
    
    var images = canvases.images[0];
    images['@id'] = i + '_img' 
    images.on = i + '_on';
    
    var resource = images.resource;
    resource['@id'] = url + '/full/full/0/default.jpg';    
    resource.height = data.height;
    resource.width = data.width;

    var service = images.resource.service;
    service['@context'] = data['@context'];
    service['@id'] = data['@id'];
    service.profile = data.profile;
    
    fs.writeFile('/var/www/iiif/' + i + '_manifest.json', JSON.stringify(json, null, '  '));
    i += 1;
  } else {
    console.log('インポート完了');
    return;
  }
}
