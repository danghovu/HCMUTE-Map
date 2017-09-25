var lineArr;
var pointArr;
$.get('http://localhost:4200/json', function(result) {
    lineArr=result[0];
    pointArr=result[1];
    console.log(1);
});
console.log(0);



$(document).ready(function() {
	
	console.log(lineArr);
	var map ;
	map = new L.map('map',{center:[10.85205,106.77171],zoom:18});
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { 
		attribution: '© OpenStreetMap' 
	}).addTo(map);
	map.on('click', function(e) {
		alert("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng);
		for(var i=0; i < lineArr.length;i++){
			var pointA = new L.LatLng(lineArr[i].startPoint.lon, lineArr[i].startPoint.lat);
			var pointB = new L.LatLng(lineArr[i].endPoint.lon, lineArr[i].endPoint.lat);
			var pointList = [pointA, pointB];

			var firstpolyline = new L.Polyline(pointList, {
				color: 'blue',
				weight: 7,
				opacity: 0.5,
				smoothFactor: 1
			});
			firstpolyline.addTo(map);
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