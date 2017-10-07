var pg  			= require('pg');
var express 		= require('express');
var app 			= express();
var PointObject 	= require('./models/PointObject');
var LineObject  	= require('./models/LineObject');
var BuildingObject  = require('./models/BuildingObject');
var Dijkstra		= require('./my_modules/dijkstra');

var firebase 		= require("firebase");


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

var selectQuery = "SELECT st_asgeojson(geom),name FROM public.line_test3 where name = 'Đường' or name ='Đường nội bộ' ";
var selectQuery2 = "Select st_asgeojson(geom),name FROM public.polygon";
//point Array
var pointArr = [];
//line Array
var lineArr=[];
//building array
var buildingArr = [];
// PointObject.prototype.getDistanceFromLatLonInKm = function(point2){
// 	var a;
// 	var totalX=Math.pow(this.lon-point2.lon,2);
// 	var totalY=Math.pow(this.lat-point2.lat,2);
// 	a=Math.sqrt(totalX+totalY);
// 	return a;
// }
// var loadData = function(callback){
// 	var point1 = new PointObject({lon:0,lat:0});
// 	var point2 = new PointObject({lon:0,lat:3});
// 	var point3 = new PointObject({lon:5,lat:0});
// 	var point4 = new PointObject({lon:0,lat:-2});
// 	var point5 = new PointObject({lon:7,lat:3});
// 	var point6 = new PointObject({lon:5,lat:1});
// 	var point7 = new PointObject({lon:6,lat:-2});
// 	var point8 = new PointObject({lon:0,lat:6});
// 	pointArr.push(point1,point2,point3,point4,point5,point6,point7,point8);
// 	console.log(pointArr);
// 	var line1 = new LineObject({startPoint:point1,endPoint:point2});
// 	var line2 = new LineObject({startPoint:point1,endPoint:point3});
// 	var line3 = new LineObject({startPoint:point1,endPoint:point4});

// 	var line4 = new LineObject({startPoint:point2,endPoint:point3});

// 	var line5 = new LineObject({startPoint:point2,endPoint:point5});
// 	var line6 = new LineObject({startPoint:point3,endPoint:point6});
// 	var line7 = new LineObject({startPoint:point4,endPoint:point6});
// 	var line8 = new LineObject({startPoint:point5,endPoint:point6});
// 	var line9 = new LineObject({startPoint:point5,endPoint:point8});
// 	var line10 = new LineObject({startPoint:point6,endPoint:point7});
// 	var line11 = new LineObject({startPoint:point6,endPoint:point8});
// 	var line12 = new LineObject({startPoint:point7,endPoint:point8});
// 	lineArr.push(line1,line2,line3,line4,line5,line6,line7,line8,line9,line10,line11,line12);
// 	lineArr.forEach((item) => {
// 	  showDistance(item);
// 	  console.log(item);
// 	  console.log("----------------");

// 	})
// 	var bd1 = new BuildingObject({LineObjects:[new LineObject({startPoint:point1,endPoint:point1})],name:'1',sign:null});
// 	var bd2 = new BuildingObject({LineObjects:[new LineObject({startPoint:point2,endPoint:point2})],name:'2',sign:null});
// 	var bd3 = new BuildingObject({LineObjects:[new LineObject({startPoint:point3,endPoint:point3})],name:'3',sign:null});
// 	var bd4 = new BuildingObject({LineObjects:[new LineObject({startPoint:point4,endPoint:point4})],name:'4',sign:null});
// 	var bd5 = new BuildingObject({LineObjects:[new LineObject({startPoint:point5,endPoint:point5})],name:'5',sign:null});
// 	var bd6 = new BuildingObject({LineObjects:[new LineObject({startPoint:point6,endPoint:point6})],name:'6',sign:null});
// 	var bd7 = new BuildingObject({LineObjects:[new LineObject({startPoint:point7,endPoint:point7})],name:'7',sign:null});
// 	var bd8 = new BuildingObject({LineObjects:[new LineObject({startPoint:point8,endPoint:point8})],name:'8',sign:null});
// 	buildingArr.push(bd1,bd2,bd3,bd4,bd5,bd6,bd7,bd8);
// 	console.log(buildingArr);
// 	callback();
// }

var path;
var doDijkstra = function(){
	var dijkstra = new Dijkstra(pointArr,lineArr,buildingArr);
	dijkstra.dijkstra('Bãi giữ xe máy','Bãi giữ xe đạp');
	path = dijkstra.getPath();
	if(path){
		console.log("path:");
			path.forEach((item) => {
	 
	  		console.log(item);
		});
	}else{
		console.log("No way");
	}
}


// loadData(doingDijkstra);

function readDataFromFirebase(curRef,arr,constrc){
	curRef.on('value',function(snapshot){
		//console.log(snapshot.value);
		snapshot.forEach((item) => {
			  // Todo...

			item = new constrc(item.val());
			 //otherFunc(item);
			 //console.log(item);

			  // arr.push(item.val());
			arr.push(item);
		})
		//console.log(JSON.stringify(snapshot.val())['startPoint']);
		console.log(arr);
		console.log("=====================");
	});

}

function writeDataToFirebase(curRef,arr,otherFunc){
	arr.forEach((item)=>{
		if(otherFunc){
			otherFunc(item);
		}

		curRef.push((item),function(err){
			if(err)
				console.log("Write error");
			else
				console.log("Write Successfully");
		});
	})
}
// readDataFromFirebase(pointArrRef,pointArr,PointObject);
// readDataFromFirebase(lineArrRef,lineArr,LineObject);
// readDataFromFirebase(buildingArrRef,buildingArr,BuildingObject);


//writeDataToFirebase(lineArrRef,lineArr);

//truy suất lấy dữ liệu từ các đường
pgClient.query(selectQuery,function(err,result){
	if(err){
		console.log(err);
	}
	else
	{
		for (var i = 0; i < result.rows.length; i++) {

			//console.log(JSON.parse(result.rows[i]['st_asgeojson'])['coordinates']);
			let  oneLine = JSON.parse(result.rows[i]['st_asgeojson'])['coordinates'];
			//console.log(oneLine.length);
			let oneLinePointArr=[];//Tập hợp các diểm trên 1 đoạn thẳng
			for(let j = 0 ; j < oneLine.length;j++){
				//console.log(oneLine[j]);
				let newPoint = new PointObject({lon:oneLine[j][0],lat:oneLine[j][1]});
				// let newPoint = new PointObject(oneLine[j][0],oneLine[j][1]);
				console.log(newPoint);
				oneLinePointArr.push(newPoint);
				pointArr.push(newPoint);//Tập hợn tất cả các điểm trong csdl


				//lưu các điểm vào trong  firebase
				// pointArrRef.push(newPoint,function(err){
				// 	if(err)
				// 		console.log("save err");
				// 	else
				// 		console.log("completed");
				// });
			}
			for(let j = 0 ; j<oneLinePointArr.length-1;j++){
				let newLine = new LineObject({startPoint:oneLinePointArr[j],endPoint:oneLinePointArr[j+1]});
				lineArr.push(newLine);//Tập hợp tất cả các đường đoạn thẳng nhỏ nhất (có tọa độ 2 điểm đầu cuối)



				//lưu các cạnh vào trong  firebase
				// lineArrRef.push(newLine,function(err){
				// 	if(err)
				// 		console.log("save err");
				// 	else
				// 		console.log("completed");
				// });
			}
		}
	}
	console.log(lineArr);
});


pgClient.query(selectQuery2,function(err,result){
	if(err)
		{
			console.log(err);

		}
	else{
		for(var i = 0;i<result.rows.length;i++){
			let buildingName = result.rows[i]['name']; // tên của tòa nhà
			//console.log(buildingName);
			let oneBuilding= JSON.parse(result.rows[i]['st_asgeojson'])['coordinates'][0][0];//giữ tọa độ của các điểm thuộc 1 tòa nhà
			
			let oneBuildingPointArr=[];//Tập hợp các diểm trên 1 toàn nhà
			for(var j = 0 ; j<oneBuilding.length;j++){
				//console.log(oneBuilding[j]);
				let newPoint = new PointObject({lon:oneBuilding[j][0],lat:oneBuilding[j][1]});
				oneBuildingPointArr.push(newPoint);
				pointArr.push(newPoint);//Tập hợn tất cả các điểm trong csdl postgresql


				//lưu các điểm vào trong  firebase
				// pointArrRef.push(newPoint,function(err){
				// 	if(err)
				// 		console.log("save err");
				// 	else
				// 		console.log("completed");
				// });
			}
			let oneBuildingLineArr=[];//Tập hợp các đoạn thẳng trên 1 toàn nhà
			for(let j = 0 ; j<oneBuildingPointArr.length-1;j++){
				let newLine = new LineObject({startPoint:oneBuildingPointArr[j],endPoint:oneBuildingPointArr[j+1]});
				oneBuildingLineArr.push(newLine);


				lineArr.push(newLine);//Tập hợp tất cả các đường đoạn thẳng nhỏ nhất (có tọa độ 2 điểm đầu cuối)


				//lưu các cạnh vào trong  firebase
				// lineArrRef.push(newLine,function(err){
				// 	if(err)
				// 		console.log("save err");
				// 	else
				// 		console.log("completed");
				// });
			}
			let newBuilding = new BuildingObject({LineObjects:oneBuildingLineArr,name:buildingName,sign:null});
			
			buildingArr.push(newBuilding);



			//luu cac toa nha vao firebase
			// buildingArrRef.push(newBuilding,function(err){
			// 	if(err)
			// 		console.log("save err");
			// 	else
			// 		console.log("completed");
			// });
			
		}
	}
	console.log(buildingArr);
	doDijkstra();
});
function showDistance(item){
	item.getDistance();
}

lineArr.forEach((item) => {
  showDistance(item);
  console.log(item);
  console.log("----------------");

})


// console.log(lineArr);
app.get('/json',function(req,res){
	res.status(200).send([lineArr,pointArr,buildingArr,path]);
	
});

app.get('/',function(req,res){
	res.render('index');

});

app.listen(port);               
                  
console.log('Magic happens on port ' + port);