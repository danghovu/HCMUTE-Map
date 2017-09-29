var pg  		= require('pg');
var express 	= require('express');
var app 		= express();
var PointObject = require('./models/PointObject');
var LineObject  = require('./models/LineObject');
var BuildingObject  = require('./models/BuildingObject');
var firebase = require("firebase");


var connectionString = "postgres://postgres:123456@localhost:5432/HCMUTE_Map";
var port = process.env.PORT || 4200; 

var config = {
    apiKey: "AIzaSyC9eBn2iBsiaQS1ShgwTFnEp7uP0Vwv0rI",
    authDomain: "hcmute-map.firebaseapp.com",
    databaseURL: "https://hcmute-map.firebaseio.com",
    projectId: "hcmute-map",
    storageBucket: "hcmute-map.appspot.com",
    messagingSenderId: "830635932098"
  };
firebase.initializeApp(config);
var ref = firebase.app().database().ref();
var pointArrRef = ref.child('pointArr');
var lineArrRef = ref.child('lineArr');
var buildingArrRef = ref.child('buildingArr');



// ref.once('value').then(
// 	function (snap) {
//  		console.log('snap.val()', snap.val());
//  });



app.use(express.static(__dirname+"/public"));
app.set("view engine","ejs");


var pgClient = new pg.Client(connectionString);
pgClient.connect()
.catch(e=>{console.log(e);});

var selectQuery = "SELECT st_asgeojson(geom),name FROM public.line_test2 where name = 'Đường' or name ='Đường nội bộ' ";
var selectQuery2 = "Select st_asgeojson(geom),name FROM public.polygon";
//point Array
var pointArr = [];
//line Array
var lineArr=[];
//building array
var buildingArr = [];

function readDataFromFirebase(curRef,arr){
	curRef.on('value',function(snapshot){
		//console.log(snapshot.value);
		snapshot.forEach((item) => {
		  // Todo...
		  arr.push(item.val());
		})
		//console.log(JSON.stringify(snapshot.val())['startPoint']);
		//console.log(arr);
	});

}
readDataFromFirebase(lineArrRef,lineArr);
readDataFromFirebase(pointArrRef,pointArr);
readDataFromFirebase(buildingArrRef,buildingArr);



//truy suất lấy dữ liệu từ các đường
// pgClient.query(selectQuery,function(err,result){
// 	if(err){
// 		console.log(err);
// 	}
// 	else
// 	{
// 		for (var i = 0; i < result.rows.length; i++) {

// 			//console.log(JSON.parse(result.rows[i]['st_asgeojson'])['coordinates']);
// 			let  oneLine = JSON.parse(result.rows[i]['st_asgeojson'])['coordinates'];
// 			//console.log(oneLine.length);
// 			let oneLinePointArr=[];//Tập hợp các diểm trên 1 đoạn thẳng
// 			for(let j = 0 ; j < oneLine.length;j++){
// 				//console.log(oneLine[j]);
// 				let newPoint = new PointObject(oneLine[j][0],oneLine[j][1]);
// 				console.log(newPoint);
// 				oneLinePointArr.push(newPoint);
// 				pointArr.push(newPoint);//Tập hợn tất cả các điểm trong csdl


// 				//lưu các điểm vào trong  firebase
// 				// pointArrRef.push(newPoint,function(err){
// 				// 	if(err)
// 				// 		console.log("save err");
// 				// 	else
// 				// 		console.log("completed");
// 				// });
// 			}
// 			for(let j = 0 ; j<oneLinePointArr.length-1;j++){
// 				let newLine = new LineObject(oneLinePointArr[j],oneLinePointArr[j+1]);
// 				lineArr.push(newLine);//Tập hợp tất cả các đường đoạn thẳng nhỏ nhất (có tọa độ 2 điểm đầu cuối)



// 				//lưu các cạnh vào trong  firebase
// 				// lineArrRef.push(newLine,function(err){
// 				// 	if(err)
// 				// 		console.log("save err");
// 				// 	else
// 				// 		console.log("completed");
// 				// });
// 			}
// 		}
// 	}
// 	//console.log(lineArr);
// });


// pgClient.query(selectQuery2,function(err,result){
// 	if(err)
// 		{
// 			console.log(err);

// 		}
// 	else{
// 		for(var i = 0;i<result.rows.length;i++){
// 			let buildingName = result.rows[i]['name']; // tên của tòa nhà
// 			//console.log(buildingName);
// 			let oneBuilding= JSON.parse(result.rows[i]['st_asgeojson'])['coordinates'][0][0];//giữ tọa độ của các điểm thuộc 1 tòa nhà
			
// 			let oneBuildingPointArr=[];//Tập hợp các diểm trên 1 toàn nhà
// 			for(var j = 0 ; j<oneBuilding.length;j++){
// 				//console.log(oneBuilding[j]);
// 				let newPoint = new PointObject(oneBuilding[j][0],oneBuilding[j][1]);
// 				oneBuildingPointArr.push(newPoint);
// 				pointArr.push(newPoint);//Tập hợn tất cả các điểm trong csdl postgresql


// 				//lưu các điểm vào trong  firebase
// 				// pointArrRef.push(newPoint,function(err){
// 				// 	if(err)
// 				// 		console.log("save err");
// 				// 	else
// 				// 		console.log("completed");
// 				// });
// 			}
// 			let oneBuildingLineArr=[];//Tập hợp các đoạn thẳng trên 1 toàn nhà
// 			for(let j = 0 ; j<oneBuildingPointArr.length-1;j++){
// 				let newLine = new LineObject(oneBuildingPointArr[j],oneBuildingPointArr[j+1]);
// 				oneBuildingLineArr.push(newLine);


// 				lineArr.push(newLine);//Tập hợp tất cả các đường đoạn thẳng nhỏ nhất (có tọa độ 2 điểm đầu cuối)


// 				//lưu các cạnh vào trong  firebase
// 				// lineArrRef.push(newLine,function(err){
// 				// 	if(err)
// 				// 		console.log("save err");
// 				// 	else
// 				// 		console.log("completed");
// 				// });
// 			}
// 			let newBuilding = new BuildingObject(oneBuildingLineArr,buildingName,null);
			
// 			buildingArr.push(newBuilding);



// 			//luu cac toa nha vao firebase
// 			// buildingArrRef.push(newBuilding,function(err){
// 			// 	if(err)
// 			// 		console.log("save err");
// 			// 	else
// 			// 		console.log("completed");
// 			// });
			
// 		}
// 	}


// });



// console.log(lineArr);
app.get('/json',function(req,res){
	res.status(200).send([lineArr,pointArr,buildingArr]);
	
});

app.get('/',function(req,res){
	res.render('index');

});

app.listen(port);               
                  
console.log('Magic happens on port ' + port);