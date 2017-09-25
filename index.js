var pg  		= require('pg');
var express 	= require('express');
var app 		= express();
var PointObject = require('./models/PointObject');
var LineObject  = require('./models/LineObject');

var connectionString = "postgres://postgres:123456@localhost:5432/HCMUTE_Map";
var port = process.env.PORT || 4200; 

app.use(express.static(__dirname+"/public"));
app.set("view engine","ejs");


var pgClient = new pg.Client(connectionString);
pgClient.connect()
.catch(e=>{console.log(e);});

var selectQuery = "SELECT st_asgeojson(geom),name FROM public.line_test1 where name = 'Đường'";

//point Array
var pointArr = [];
//line Array
var lineArr=[];
//building array
var buildingArr = [];
//truy suất lấy dữ liệu
pgClient.query(selectQuery,function(err,result){
	if(err){
		console.log(err);
	}
	for (var i = 0; i < result.rows.length; i++) {

			//console.log(JSON.parse(result.rows[i]['st_asgeojson'])['coordinates']);
			let  oneLine = JSON.parse(result.rows[i]['st_asgeojson'])['coordinates'];
			//console.log(oneLine.length);
			let oneLinePointArr=[];//Tập hợp các diểm trên 1 đoạn thẳng
			for(let j = 0 ; j < oneLine.length;j++){
				let newPoint = new PointObject(oneLine[j][0],oneLine[j][1]);
				oneLinePointArr.push(newPoint);
				pointArr.push(newPoint);//Tập hợn tất cả các điểm trong csdl
			}
			for(let j = 0 ; j<oneLinePointArr.length-1;j++){
				let newLine = new LineObject(oneLinePointArr[j],oneLinePointArr[j+1]);
				lineArr.push(newLine);
			}
	}
	console.log(lineArr);
});

app.get('/json',function(req,res){
	res.status(200).send([lineArr,pointArr]);
	
});

app.get('/',function(req,res){
	res.render('index');

});

app.listen(port);               
                  
console.log('Magic happens on port ' + port);