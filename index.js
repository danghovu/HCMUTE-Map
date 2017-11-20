var pg  					= require('pg');
var express 				= require('express');
var app 					= express();
var PointObject 			= require('./models/PointObject');
var LineObject  			= require('./models/LineObject');
var BuildingObject  		= require('./models/BuildingObject');
var Dijkstra				= require('./my_modules/dijkstra');		


var connectionString = "postgres://postgres:123456@localhost:5432/HCMUTE_Map";
var port = process.env.PORT || 4200; 




app.use(express.static(__dirname+"/public"));
app.set("view engine","ejs");
app.engine('html', require('ejs').renderFile);

var pgClient = new pg.Client(connectionString);
pgClient.connect()
.catch(e=>{console.log(e);});

var selectQuery = "SELECT st_asgeojson(geom),name FROM public.line_test3 ";
var selectQuery2 = "Select id,st_asgeojson(geom) as coordinates,name,st_asgeojson(coordinate_center) as coordinate_center , sign FROM public.polygon order by sign";
var selectQuery3 = `select * 
					from public."relationView" 
					where name != 'Bỏ' and name != 'Tòa nhà trung tâm' and name != 'ĐH Sư Phạm Kỹ Thuật TP.HCM'
					order by containerSign,category,level,name`;
//point Array
var pointArr = [];
//line Array
var roadArr=[]; // chỉ gồm các đường đi , không gồm các line tạo thành 1 tòa nhà
//building array
var buildingArr = [];
var relationArr=[];

var doDijkstra = function(sourceName,destinationName){
	var path=[];
	if(sourceName==destinationName)
		return 0;
	var dijkstra = new Dijkstra(pointArr,roadArr,buildingArr);
	return path=dijkstra.run(sourceName,destinationName);

}


//truy suất lấy dữ liệu từ các đường
pgClient.query(selectQuery,function(err,result){
	if(err){
		console.log(err);
	}
	else
	{
		for (var i = 0; i < result.rows.length; i++) {
			let  oneLine = JSON.parse(result.rows[i]['st_asgeojson'])['coordinates'];
			let oneLinePointArr=[];//Tập hợp các diểm trên 1 đoạn thẳng
			for(let j = 0 ; j < oneLine.length;j++){
				let newPoint = new PointObject({lon:oneLine[j][0],lat:oneLine[j][1]});
				oneLinePointArr.push(newPoint);
				pointArr.push(newPoint);//Tập hợn tất cả các điểm trong csdl
			}
			for(let j = 0 ; j<oneLinePointArr.length-1;j++){
				let newLine = new LineObject({startPoint:oneLinePointArr[j],endPoint:oneLinePointArr[j+1]});
				roadArr.push(newLine);

			}
		}
	}
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
			let oneBuilding= JSON.parse(result.rows[i]['coordinates'])['coordinates'][0][0];//giữ tọa độ của các điểm thuộc 1 tòa nhà
			
			let oneBuildingPointArr=[];//Tập hợp các diểm trên 1 toàn nhà
			for(var j = 0 ; j<oneBuilding.length;j++){
				let newPoint = new PointObject({lon:oneBuilding[j][0],lat:oneBuilding[j][1]});
				oneBuildingPointArr.push(newPoint);
				pointArr.push(newPoint);//Tập hợn tất cả các điểm trong csdl postgresql
			}
			let oneBuildingLineArr=[];//Tập hợp các đoạn thẳng trên 1 toàn nhà
			for(let j = 0 ; j<oneBuildingPointArr.length-1;j++){
				let newLine = new LineObject({startPoint:oneBuildingPointArr[j],endPoint:oneBuildingPointArr[j+1]});
				oneBuildingLineArr.push(newLine);
			}
			let newBuilding = new BuildingObject({id:buildingId,lineObjects:oneBuildingLineArr,name:buildingName,sign:null,center:center,sign:buildingSign});
			
			buildingArr.push(newBuilding);

		}
	}
});


pgClient.query(selectQuery3,function(err,result){
	for(let i =0 ; i < result.rows.length;i++){
		var relationObj= {};
		let curCategoryName ;
		let curBuildingName =result.rows[i].name;
		var relationObj={};

		relationObj.name = result.rows[i].name ;
		relationObj.sign = result.rows[i].containersign ;
		relationObj.categories = [];
		while(i < result.rows.length&&result.rows[i].name==curBuildingName){
			
			var categoryObj={};
			categoryObj.room=[];
			if(result.rows[i].category)
			{
				curCategoryName=result.rows[i].category;
				categoryObj.category = curCategoryName;

				while(result.rows[i].category===curCategoryName){
					categoryObj.room.push({sign:result.rows[i].sign,level:result.rows[i].level})
					i++;
				}
				i--;
				relationObj.categories.push(categoryObj);
			}
			i++;
		}
		i--;
		relationArr.push(relationObj);
	}

});

app.get('/json',function(req,res){
	// doDijkstra('Tòa nhà A3','Tòa nhà A1');
	res.status(200).send(JSON.stringify({buildingArr:buildingArr,relationArr:relationArr}));
	
});

app.get('/dijkstra',function(req,res){
	var path = doDijkstra(req.query.source,req.query.destination);
	if(path == 0)
		res.status(200).send(JSON.stringify({path:path,success:false,err:0,msg:'Hai điểm này là một'}));
	else if(path===1){
		res.status(200).send(JSON.stringify({path:path,success:false,err:1,msg:'Không vẽ'}));
	}
	else if(path){
		console.log("path:");
		path.path.forEach((item) => {			 
		console.log(item);
		})
		res.status(200).send(JSON.stringify({path:path.path,length:Math.round(path.length*1000),success:true}));
	}
	else{
		console.log("No way");
		res.status(200).send(JSON.stringify({path:path,success:false,err:2,msg:'Không có đường đi'}));
	}
})
app.get('/',function(req,res){
	res.render('index.html');

});

app.listen(port);               
                  
console.log('Magic happens on port ' + port);