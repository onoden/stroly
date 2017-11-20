var MySql = require('sync-mysql');
var fs = require('fs');

/*connect to mysql server*/
var connection = new MySql(
	{
		host: 'localhost',
		user: 'kyoino',
		password: 'kyoino039',
		database: 'omeka'
	}
);

module.exports = {
/*fileNameをキーにしてcanvasIdを取得できる連想配列を作成*/
				getData: function (){
 					/*JPEGImage取得*/
					files = fs.readdirSync('./Training/JPEGImages');
					var data = {};
					files.forEach(function(fileName){
						createData(fileName, data);
					});
					return data;
				}
}


/*連想配列の作成*/
function createData(fileName, data){
	var recordId = getRecordId(fileName);
	if(recordId == 'undefined') return data;
	var canvasId = getCanvasId(recordId);
	data[fileName] = canvasId;
	return data;
}


/*record_idの取得*/
function getRecordId(fileName){
	var str = fileName.replace(/(?:\d{4}-\d{2}-\d{2}-)|(?:\.jpg)/g, "");
	str = str.replace(/(?:^0+)/g, "");
	var queryStr = "select record_id from omeka_element_texts where text ='" + str + "_cnv'";
	var result = connection.query(queryStr);
	try{
		var recordId = result[0]['record_id'];
	}catch(e){
		return 'undefined';
	}
	return recordId;
}


/*CanvasIDの取得*/
function getCanvasId(recordId){
	var result = connection.query('select text from omeka_element_texts where record_id =' + recordId);
	for(index in result){
  	text = result[index]['text'];
		if(text.match(/[^-]{8}-[^-]{4}-[^-]{4}-[^-]{4}-[^-]{12}/g)){
			var canvasId = text;
		}
	}
	return canvasId;
}

