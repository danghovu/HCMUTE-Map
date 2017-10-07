var lineArr;
var pointArr;
var buildingArr;
var path;

$(document).ready(function() {
	$.get('http://localhost:4200/json', function(result) {
    lineArr=result[0];
    pointArr=result[1];
    buildingArr=result[2];
    path=result[3];
    console.log(result[3]);
    var map ;
	map = new L.map('map').setView([10.85205,106.77171],18);
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { 
		attribution: '© OpenStreetMap' 
	}).addTo(map);
	map.on('click', function(e) {
		//alert("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng);
		for(let i = 0 ; i< path.length-1;i++){
			drawLine(path[i],path[i+1]);
		}
		drawBuildingOutline('Bãi giữ xe máy');
		drawBuildingOutline('Bãi giữ xe đạp');
	});


	var legend = L.Control.extend({
		options:{
    		position: 'topleft'
  		},
  		onAdd: function(map){
  			var div = L.DomUtil.create('button','selectBox');
			div.innerHTML='<p>Điểm bắt đầu</p><ul><li>1</li><li>2</li></ul>';
			div.style.width='200px';
			div.style.height='200px';
			div.onclick= div.ondblclick=L.DomEvent.stopPropagation;

			return div;
  		}
	});
	$('.selectBox .leaflet-control').click(function(){
		console.log("oK");
	})
	map.addControl(new legend());


    function drawLine(pointA,pointB){
    	console.log(pointA);
    	var pointA = new L.LatLng(pointA.lat,pointA.lon);
		var pointB = new L.LatLng(pointB.lat,pointB.lon);
    	var polyline = new L.Polyline([pointA,pointB], {
					color: 'blue',
					weight: 2,
					opacity: 1,
					smoothFactor: 1,
					dashArray: '10,10'
				});
		polyline.addTo(map);

    }

  	function drawBuildingOutline(name){
    	if(name==='ĐH Sư Phạm Kỹ Thuật TP.HCM')
				return;
		var pointList=[];
  		for(var i =0 ; i< buildingArr.length;i++){
			
			if(buildingArr[i]['name']==name){
				for(var j = 0 ; j<buildingArr[i].LineObjects.length;j++){
					var pointA = new L.LatLng(buildingArr[i].LineObjects[j].startPoint.lat,buildingArr[i].LineObjects[j].startPoint.lon);
					var pointB = new L.LatLng(buildingArr[i].LineObjects[j].endPoint.lat  ,buildingArr[i].LineObjects[j].endPoint.lon);
					pointList.push(pointA);
					pointList.push(pointB);
				}

				console.log("abc"+pointList);
				
			}
		}
		if(name!=='Bỏ'){ 

			var polygon = new L.Polygon(pointList,{
				fillColor:'green',
				color:'blue',
				opacity: 1,
				fillOpacity:0.5,
				smoothFactor: 1
			});
			polygon.addTo(map);
		}
		else{ // vẽ những phần cần che

			var polygon = new L.Polygon(pointList,{
				fillColor:'#f1f0d8',
				color:'#f1f0d8',
				fillOpacity:1
			});
			polygon.addTo(map);	
		}
    	
		

    }
    function drawCompleteRoute(){}

	drawBuildingOutline('Bỏ');
});
	
	
});

