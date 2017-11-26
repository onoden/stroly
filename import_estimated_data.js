var seleniumDriver = require('./test_import_items');
var async = require('async');
var associativeData = require('./associative-data');
var json = require('./ocr/estimation/data/2017-10-27-0009_ocr(1).json');
var data = {};
var fileName = null;
var regionFormat = null;

async.series([
	function(callback){
		console.log('loading file...')
		fileName = json['file'];
		data = associativeData.getData();
		console.log('complete');
		callback();
	}, 
	function(callback){
		console.log('start selenium...');
		/*Omekaへログインし、予測データをインポートする画面へ遷移させる*/
		seleniumDriver.loginToOmeka()
	  .then(seleniumDriver.clickButton('//nav[@id="content-nav"]/ul[@class="navigation"]/li[2]'))
		.then(seleniumDriver.clickButton('//a[@class="add button small green"]'))
		.then(seleniumDriver.sendParam('Annotation: "example"', '//textarea[@id="Elements-50-0-text"]'))
		.then(seleniumDriver.sendParam('estimation', '//textarea[@id="Elements-37-0-text"]'))
		.then(seleniumDriver.clickButton('//ul[@id="section-nav"]/li[2]'));
		callback();
	},
	function(callback){
		/*Annotationのメタデータを定義する*/
		seleniumDriver.clickButton('//select[@id="item-type"]/option[2]');
		seleniumDriver.sleep(2000);
		/*On Canvas*/
		seleniumDriver.sendParam(data[fileName], '//input[@id="Elements-60-0-text"]');
		var regions = json['regions'];
		var regionFormat = refactorRegionFormat(regions[0]);
		/*Selector*/
		seleniumDriver.sendParam(setSVGData(regions[0]), '//textarea[@id="Elements-61-0-text"]');
		/*Text*/
		seleniumDriver.sendParam(regions[0]['text'], '//textarea[@id="Elements-1-0-text"]');
		seleniumDriver.clickButton('//input[@id="Elements-1-0-html"]');
		seleniumDriver.sendParam(regionFormat, '//textarea[@id="Elements-62-0-text"]');
		/*AnnotationのJsonデータを定義する*/
		seleniumDriver.clickButton('//ul[@id="section-nav"]/li[3]');
		seleniumDriver.sendParam(setJsonData(regions[0]['text'], regions[0]), '//textarea[@id="Elements-56-0-text"]');
		callback();
	},
	function(callback){
		/*予測データをインポートする*/
		//seleniumDriver.clickButton('//input[@id="add_item"]');
		callback();
	}
				
]);



function refactorRegionFormat(region){
	var width = String(parseInt(region['xmax']) - parseInt(region['xmin']));
	var height = String(parseInt(region['ymax']) - parseInt(region['ymin']));
	var regionFormat = region['xmin'] + ',' + region['ymin'] + ',' + width + ',' + height;
	return regionFormat;
}

function setJsonData(text, region){
	var svgData = setSVGData(region);
	var jsonData = "{\"@context\":\"http:\/\/iiif.io\/api\/presentation\/2\/context.json\",\"@type\":\"oa:Annotation\",\"motivation\":\"oa:commenting\",\"resource\":[{\"@type\":\"dctypes:Text\",\"format\":\"text/html\",\"chars\":\"<p>" + text + "</p>\"}],\"on\":[{\"@type\":\"oa:SpecificResource\",\"selector\":{\"@type\":\"oa:Choice\",\"default\":{\"@type\":\"oa:FragmentSelector\",\"value\":\"xywh=" + region + "\"},\"item\":{\"@type\":\"oa:SvgSelector\",\"value\":" + svgData + "}}}]}\"}}}]}"
	return jsonData;
}

function setSVGData(region){
	var regionFormat = refactorRegionFormat(region);
	var region = regionFormat.split(',');
	var svgData = "<svg xmlns='http:\/\/www.w3.org\/2000\/svg'><path xmlns=\"http:\/\/www.w3.org\/2000\/svg\" d=\"M" + region[0] + "," + region[1] + "v0h" + parseInt(region[2])/2 + "v" + parseInt(region[3])/2 + "v"+ parseInt(region[3])/2 + "h-" + parseInt(region[2])/2 + "h-" + parseInt(region[2])/2 + "v-" + parseInt(region[3])/2 + "z\" data-paper-data=\"{&quot;strokeWidth&quot;:1,&quot;rotation&quot;:0,&quot;deleteIcon&quot;:null,&quot;rotationIcon&quot;:null,&quot;group&quot;:null,&quot;editable&quot;:true,&quot;annotation&quot;:null}\" id=\"rectangle_8be82323-5a15-41c2-bd07-094af6947020\" fill-opacity=\"0\" fill=\"#00bfff\" fill-rule=\"nonzero\" stroke=\"#ff0000\" stroke-width=\"1\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\" stroke-miterlimit=\"10\" stroke-dasharray=\"\" stroke-dashoffset=\"0\" font-family=\"none\" font-weight=\"none\" font-size=\"none\" text-anchor=\"none\" style=\"mix-blend-mode: normal\"\/><\/svg>";
  return svgData;
}
