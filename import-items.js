var webdriver = require('selenium-webdriver');
var fs = require('fs');
var sleep = require('sleep-async');
 
driver = new webdriver.Builder()
.forBrowser('firefox')
.build();
 
driver.get('http://192.168.1.47/admin/users/login').then(function(){
	loginToOmeka();
}).then(function(){
	clickButtonIIIFToolkit();
}).then(function(){
	selectMethodToImportItems();
}).then(function(){
	fs.readdir('/var/www/iiif', function(err, fileNames){
		if(err) throw('errorMessage:'+ err);
		for(var i in fileNames){
			var urlElement = driver.findElement(webdriver.By.xpath('//input[@id="items_import_source_url"]'));
			urlElement.sendKeys('http://localhost/iiif/'+ fileNames[i]);
        		driver.findElement(webdriver.By.xpath('//input[@id="submit"]')).click();
			clickButtonIIIFToolkit();
			selectMethodToImportItems();
		}

	});

});


var driver = new webdriver.Builder().forBrowser('firefox').build();


function loginToOmeka(driver, webdriver){
	driver.findElement(webdriver.By.xpath('//input[@id="username"]')).sendKeys('kyoino');
        driver.findElement(webdriver.By.xpath('//input[@id="password"]')).sendKeys('kyoino039');
        driver.findElement(webdriver.By.xpath('//input[@id="submit"]')).click();   
}

function clickButtonIIIFToolkit(driver, webdriver){
	driver.findElement(webdriver.By.xpath('//ul[@class="navigation"]/li[6]')).click();
}

function selectMethodToImportItems(driver, webdriver){
	driver.findElement(webdriver.By.xpath('//input[@id="items_import_type-1"]')).click();
        driver.findElement(webdriver.By.xpath('//input[@id="items_import_source-1"]')).click();
        driver.findElement(webdriver.By.xpath('//input[@id="items_preview_size-0"]')).click();
        driver.findElement(webdriver.By.xpath('//input[@id="items_annotation_size-0"]')).click();
        driver.findElement(webdriver.By.xpath('//input[@id="items_are_public"]')).click();
}

