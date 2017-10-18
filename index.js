var pg  					= require('pg');
var express 				= require('express');
var app 					= express();
var PointObject 			= require('./models/PointObject');
var LineObject  			= require('./models/LineObject');
var BuildingObject  		= require('./models/BuildingObject');
var SignLevelObject 		= require('./models/SignLevelObject');
var CategoryContainerObject = require('./models/CategoryContainerObject');
var Dijkstra				= require('./my_modules/dijkstra');		
var firebase 				= require("firebase");


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
var selectQuery2 = "Select id,st_asgeojson(geom) as coordinates,name,st_asgeojson(coordinate_center) as coordinate_center , sign FROM public.polygon order by sign";
var selectQuery3 = "select * from public.sign_level order by category,sign";
var selectQuery4= 'select * from public.category_container order by category';
//point Array
var pointArr = [];
//line Array
var lineArr=[];
var roadArr=[]; // chỉ gồm các đường đi , không gồm các line tạo thành 1 tòa nhà
//building array
var buildingArr = [];
var centerArr = []// bao gồm trung điểm của các tòa nhà
var signLevelArr = [];
var categoryContainerArr = [];
var doDijkstra = function(sourceName,destinationName){
	var path=[];
	var dijkstra = new Dijkstra(pointArr,lineArr,roadArr,buildingArr);
	path=dijkstra.run(sourceName,destinationName);
	if(path){
		console.log("path:");
			path.forEach((item) => {
	 
	  		console.log(item);
		});
	}else{
		console.log("No way");
	}
	return path;
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
				// console.log(newPoint);
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
				roadArr.push(newLine);


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
	// console.log(lineArr);
});


pgClient.query(selectQuery2,function(err,result){
	if(err)
		{
			console.log(err);

		}
	else{
		for(var i = 0;i<result.rows.length;i++){
			let buildingName = result.rows[i]['name']; // tên của tòa nhà
			let buildingSign = result.rows[i]['sign'];
			let buildingId = result.rows[i]['id'];
			let center;
			if(result.rows[i].coordinate_center)
				center = {
					lat:JSON.parse(result.rows[i].coordinate_center)['coordinates'][1],
					lon:JSON.parse(result.rows[i].coordinate_center)['coordinates'][0]
				};
			else
				center = null;
			//console.log(buildingName);
			let oneBuilding= JSON.parse(result.rows[i]['coordinates'])['coordinates'][0][0];//giữ tọa độ của các điểm thuộc 1 tòa nhà
			
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
			let newBuilding = new BuildingObject({id:buildingId,LineObjects:oneBuildingLineArr,name:buildingName,sign:null,center:center,sign:buildingSign});
			
			buildingArr.push(newBuilding);
			// console.log(buildingArr);


			//luu cac toa nha vao firebase
			// buildingArrRef.push(newBuilding,function(err){
			// 	if(err)
			// 		console.log("save err");
			// 	else
			// 		console.log("completed");
			// });
			
		}
	}
	// console.log(buildingArr);
});

pgClient.query(selectQuery3,function(err,result){
	if(err)
		console.log(err);
	else{
		for(let i = 0 ; i <result.rows.length;i++){
			let newSignLevelObj = new SignLevelObject({sign:result.rows[i].sign,level:result.rows[i].level,category:result.rows[i].category});
			signLevelArr.push(newSignLevelObj);
		}
		// console.log(signLevelArr);
	}
})
pgClient.query(selectQuery4,function(err,result){
	if(err)
		console.log(err);
	else{
		for(let i = 0 ; i <result.rows.length;i++){
			let newCategoryContainerObj = new CategoryContainerObject({category:result.rows[i].category,container_id:result.rows[i].container_id});
			categoryContainerArr.push(newCategoryContainerObj);
		}
		// console.log(categoryContainerArr);
	}
})

function showDistance(item){
	item.getDistance();
}

lineArr.forEach((item) => {
  showDistance(item);
//   console.log(item);
  console.log("----------------");

})


// console.log(lineArr);
app.get('/json',function(req,res){
	
	res.status(200).send(JSON.stringify({lineArr:lineArr,pointArr:pointArr,buildingArr:buildingArr,relationArr:createRelationOfPolygon()}));
	
});
function createRelationOfPolygon(){
	let k =0;
	let relationOfPolygonArr=[];
	for(let i = 0 ; i<buildingArr.length;i++)
	{
		let relationOfPolygonObj ={}

		let polygonObject={} ;
		if(buildingArr[i].sign)
			{
				relationOfPolygonObj.sign=buildingArr[i].sign;
				polygonObject.sign = buildingArr[i].sign;
				relationOfPolygonObj.category=[];
				let id = buildingArr[i].id;
				for(let j = 0; j<categoryContainerArr.length;j++){
					if(categoryContainerArr[j].container_id==id){

						let category = categoryContainerArr[j].category;

						let roomArr =[]
						for(;k<signLevelArr.length;k++)
						{
							if(signLevelArr[k].category!=category)
								break;
							let roomObject={} ;
							roomObject.sign=signLevelArr[k].sign;
							roomObject.level = signLevelArr[k].level;
							roomArr.push(roomObject);
						}
						relationOfPolygonObj.category.push({category:category,room:roomArr});
					}
				}
				relationOfPolygonArr.push(relationOfPolygonObj);
			}
	}
	return relationOfPolygonArr;
}

app.post('/dijkstra',function(req,res){
	var body = "";
	var jsonObj;
	req.on('data', function (chunk) {
	    body += chunk;
	});
	req.on('end', function () {
	    jsonObj = JSON.parse(body);
	    var path = doDijkstra(jsonObj.source,jsonObj.destination);
	 	if(path)
			res.status(200).send(JSON.stringify({path:path,success:true}));
		else
			res.status(200).send(JSON.stringify({path:path,success:false}));
	})
})
app.get('/',function(req,res){
	res.render('index');

});

app.listen(port);               
                  
console.log('Magic happens on port ' + port);