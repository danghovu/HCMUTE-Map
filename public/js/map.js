var lineArr;
var pointArr;
var buildingArr;
$.get('http://localhost:4200/json', function(result) {
    lineArr=result[0];
    pointArr=result[1];
    buildingArr=result[2];
    console.log(lineArr);
});


$(document).ready(function() {
	var map ;
	map = new L.map('map',{center:[10.85205,106.77171],zoom:18});
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { 
		attribution: '© OpenStreetMap' 
	}).addTo(map);
	map.on('click', function(e) {
		alert("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng);
		for(var i=0; i < lineArr.length;i++){
			var pointA = new L.LatLng(lineArr[i].startPoint.lat,lineArr[i].startPoint.lon);
			console.log(pointA);
			var pointB = new L.LatLng(lineArr[i].endPoint.lat,lineArr[i].endPoint.lon);
			var pointList = [pointA, pointB];

			var firstpolyline = new L.Polyline(pointList, {
				color: 'blue',
				weight: 2,
				opacity: 1,
				smoothFactor: 1
			});
			firstpolyline.addTo(map);
		}
		for(var i =0 ; i< buildingArr.length;i++){
			var pointList=[];
			if(buildingArr[i]['name']==='ĐH Sư Phạm Kỹ Thuật TP.HCM')
				continue;
			for(var j = 0 ; j<buildingArr[i].LineObjects.length;j++){
				var pointA = new L.LatLng(buildingArr[i].LineObjects[j].startPoint.lat,buildingArr[i].LineObjects[j].startPoint.lon);
				var pointB = new L.LatLng(buildingArr[i].LineObjects[j].endPoint.lat  ,buildingArr[i].LineObjects[j].endPoint.lon);
				pointList.push(pointA);
				pointList.push(pointB);
			}
			var firstPolygon = new L.Polygon(pointList,{
				fillColor:'green',
				opacity: 0.5,
				smoothFactor: 1
			})
			firstPolygon.addTo(map);
		}

	});
});




// var pointA = new L.LatLng(lineArr[0].startPoint.lon, lineArr[0].startPoint.lat);
// var pointB = new L.LatLng(lineArr[1].startPoint.lon, lineArr[1].startPoint.lat);
// var pointList = [pointA, pointB];

// var firstpolyline = new L.Polyline(pointList, {
// 	color: 'blue',
// 	weight: 7,
// 	opacity: 0.5,
// 	smoothFactor: 1
// });
// firstpolyline.addTo(map);