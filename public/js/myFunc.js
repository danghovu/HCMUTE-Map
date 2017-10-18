function removeDrewRoute(){
			if(isDrew)
			{				
				removeDrewLine();
				removeDrewBuilding(drewBuilding[0]);
				removeDrewBuilding(drewBuilding[1]);
				isDrew =false;
			}
		}
		function removeDrewLine(){
			drewLine.forEach((item) => {
					map.removeLayer(item);
			});
		}
		function removeDrewBuilding(building){
			map.removeLayer(building);
			
		}

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
			return polyline;
		}

		function drawBuildingOutline(name,init){
			if(name==='ĐH Sư Phạm Kỹ Thuật TP.HCM')
				return;
			var pointList=[];
			for(var i =0 ; i< buildingArr.length;i++){

				if(buildingArr[i]['name'].toLowerCase()==name.toLowerCase()){
					for(var j = 0 ; j<buildingArr[i].LineObjects.length;j++){
						var pointA = new L.LatLng(buildingArr[i].LineObjects[j].startPoint.lat,buildingArr[i].LineObjects[j].startPoint.lon);
						var pointB = new L.LatLng(buildingArr[i].LineObjects[j].endPoint.lat  ,buildingArr[i].LineObjects[j].endPoint.lon);
						pointList.push(pointA);
						pointList.push(pointB);
					}

					console.log("abc"+pointList);

				}
			}
			if(pointList.length===0)
				return null;
			if((name=='Xưởng ĐT Ô Tô F7'||name=='P. Chuyên Đề K.CKĐ'||name=='Xường TT Chuyển giao CN'||name=='TT Tư Vấn TK CNC'||name=='Xưởng diesel-Kho Vật Tư TTKT Môi Trường'||name=='CLB Khoa Học Trẻ-Kho QT&QLDA'||name=='Xưởng nghiên cứu và phát triển')&&init)
			{
				var polygon = new L.Polygon(pointList,{
					fillColor:'#D9D0C9',
					color:'#CABEB2',
					opacity: 1,
					fillOpacity:1,
					weight:1
				});
				polygon.addTo(map);
				return polygon;
			}
			else if(name!=='Bỏ'){ 

				var polygon = new L.Polygon(pointList,{
					fillColor:'green',
					color:'blue',
					opacity: 1,
					fillOpacity:0.5,
					smoothFactor: 1
				});
				polygon.addTo(map);
				return polygon;
			}		
			else{ // vẽ những phần cần che

				var polygon = new L.Polygon(pointList,{
					fillColor:'#f1f0d8',
					color:'#f1f0d8',
					fillOpacity:1
				});
				polygon.addTo(map);	
				return polygon;
			}
		}