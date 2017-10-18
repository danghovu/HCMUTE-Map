var lineArr;
var pointArr;
var buildingArr;
var relationArr;
var drewLine=[];
var drewBuilding=[];
var isDrew =false;
var isSourceBtnPressed = false;
var isDestinationBtnPressed = false;
var isSubmitBtnPressed = false;
var srcName ;
var desName ; 


$(document).ready(function() {
	var map ;
	map = new L.map('map',{zoomControl: false}).setView([10.85205,106.77171],18);
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { 
			attribution: '© OpenStreetMap' 
		}).addTo(map);
		new L.Control.Zoom({
			position: 'topright'
		}).addTo(map);
	var sourceBtn = document.getElementById('sourceBtn');
	var destinationBtn = document.getElementById('destinationBtn');
	var submitBtn = document.getElementById('submitBtn');
	var deleteBtn = document.getElementById('deleteBtn');
	var srcInput = document.getElementById('srcInput');
	var desInput = document.getElementById('desInput');
	var deleteSrcBtn = document.getElementById('deleteSrcBtn');
	var deleteDesBtn = document.getElementById('deleteDesBtn');
	$('.category').on('click',function(event) {		
		$(this).parent().find('.sublist').toggleClass('open');
	});
	$('.category_smaller').on('click',  function(event) {
		$(this).parent().find('.sublist_smaller').toggleClass('open');
	});
	$('.choosen').on('click', function(event) {
		$(this).parent().find('li').toggleClass('open');
	});
	$.get('json', function(result) {
		result = JSON.parse(result)
		lineArr=result.lineArr;
		pointArr=result.pointArr;
		buildingArr=result.buildingArr;
		relationArr=result.relationArr;
		
		drawBuildingOutline('Bỏ');
		drawBuildingOutline('Xưởng ĐT Ô Tô F7',1);
		drawBuildingOutline('P. Chuyên Đề K.CKĐ',1);
		drawBuildingOutline('Xường TT Chuyển giao CN',1);
		drawBuildingOutline('TT Tư Vấn TK CNC',1);
		drawBuildingOutline('Xưởng diesel-Kho Vật Tư TTKT Môi Trường',1);
		drawBuildingOutline('CLB Khoa Học Trẻ-Kho QT&QLDA',1);
		drawBuildingOutline('Xưởng nghiên cứu và phát triển',1);
		drawBuildingOutline('Khoa đổi mới sáng tạo và khởi nghiệp',1);
		drawBuildingOutline('VP.BM.GDTC-TTKTTH',1);
		drawBuildingOutline('Xưởng in',1);

		createMenu();
		
		sourceBtn.addEventListener('click',function(){
			if(srcInput.value.trim()!='')
			{	
				var polygon = drawBuildingOutline(srcInput.value.trim());
				if(polygon)
				{
					drewBuilding[0]=polygon;
					isSourceBtnPressed = true;
					deleteSrcBtn.disabled=false;
					srcName = srcInput.value;

					if(isDestinationBtnPressed)
						submitBtn.disabled = false;
				}
				else{
					alert('Không có địa điểm này');
				}
				
			}else
			{
				alert('Phải nhập tên khác rỗng')
			}
		});
		destinationBtn.addEventListener('click',function(){
			if(desInput.value.trim()!='')
			{
				var polygon = drawBuildingOutline(desInput.value.trim());
				if(polygon){
					drewBuilding[1] = polygon;
					isDestinationBtnPressed =true;
					deleteDesBtn.disabled =false;
					desName = desInput.value;
					if(isSourceBtnPressed)
						submitBtn.disabled =false;
				}
				else{
					alert('Không có địa điểm này');
				}
			}
			else{
				alert('Phải nhập tên khác rỗng');
			}
		});
		submitBtn.addEventListener('click',function(){
			isSubmitBtnPressed =true;
			deleteBtn.disabled =false;
			isDrew=true;
			var xhttp = new XMLHttpRequest();
			xhttp.open("POST",'/dijkstra',true);
			xhttp.setRequestHeader('Content-type',"application/json");
			xhttp.onreadystatechange = function() {
			    if(xhttp.readyState == XMLHttpRequest.DONE && xhttp.status == 200) {
			    	var res=JSON.parse(this.response);
			       	if(res.success)
			       	{
			       		var path=res.path;
			       		for(var i = 0;i<path.length-1;i++){
			       			drewLine.push(drawLine(path[i],path[i+1]));
			       			
			       		}
			       	}
			    }
			}
			xhttp.send(JSON.stringify({source:srcInput.value,destination:desInput.value}));
		});
		deleteBtn.addEventListener('click',function(){
			if(isSubmitBtnPressed)
			{
				alert('deleteBtn');
				srcInput.value = '';	
				desInput.value = '';

				deleteBtn.disabled=true;
				submitBtn.disabled=true;
				deleteSrcBtn.disabled=true;
				deleteDesBtn.disabled = true;
				isSubmitBtnPressed =false;
				isSourceBtnPressed = false;
				isDestinationBtnPressed = false;
				removeDrewRoute()
				isDrew=false;
			}

		});
		deleteSrcBtn.addEventListener('click',function(){
			if(isSourceBtnPressed)
			{
				alert('deleteSrcBtn');
				isSourceBtnPressed =false;
				deleteSrcBtn.disabled =true;
				map.removeLayer(drewBuilding[0]);
			}
		});
		deleteDesBtn.addEventListener('click',function(){
			if(isDestinationBtnPressed)
			{
				alert('deleteDesBtn');
				isDestinationBtnPressed =false;
				deleteDesBtn.disabled =true;
				map.removeLayer(drewBuilding[1]);
			}
		});



	});
 
	
//Các function thao tác để vẽ đường đi
		function removeDrewRoute(){
			if(isDrew)
			{				
				removeDrewLine();
				console.log(drewBuilding);
				removeDrewBuilding(0);
				console.log(drewBuilding);
				removeDrewBuilding(1);
				console.log(drewBuilding);
				isDrew =false;
			}
		}
		function removeDrewLine(){
			drewLine.forEach((item) => {
					map.removeLayer(item);
			});
			drewLine=drewLine.splice();
		}
		function removeDrewBuilding(index){
			map.removeLayer(drewBuilding[index]);
			drewBuilding[index]=null;
		}

		function drawLine(pointA,pointB){
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
			var coordinate_center;
			for(var i =0 ; i< buildingArr.length;i++){

				if(buildingArr[i]['name'].toLowerCase()==name.toLowerCase()){
					for(var j = 0 ; j<buildingArr[i].LineObjects.length;j++){
						var pointA = new L.LatLng(buildingArr[i].LineObjects[j].startPoint.lat,buildingArr[i].LineObjects[j].startPoint.lon);
						var pointB = new L.LatLng(buildingArr[i].LineObjects[j].endPoint.lat  ,buildingArr[i].LineObjects[j].endPoint.lon);
						pointList.push(pointA);
						pointList.push(pointB);
					}

					coordinate_center=buildingArr[i].center;

				}
			}
			if(pointList.length===0)
				return null;
			if((name=='Xưởng ĐT Ô Tô F7'||name=='P. Chuyên Đề K.CKĐ'||name=='Xường TT Chuyển giao CN'||name=='TT Tư Vấn TK CNC'||name=='Xưởng diesel-Kho Vật Tư TTKT Môi Trường'
				||name=='CLB Khoa Học Trẻ-Kho QT&QLDA'||name=='Xưởng nghiên cứu và phát triển'||name=='Khoa đổi mới sáng tạo và khởi nghiệp'||name=='Xưởng in'||name=='VP.BM.GDTC-TTKTTH')&&init)
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
				console.log(coordinate_center);
				L.popup()
					.setLatLng([coordinate_center.lat,coordinate_center.lon])
					.setContent(name)
					.openOn(map);
				var polygon = new L.Polygon(pointList,{
					fillColor:'green',
					color:'blue',
					opacity: 1,
					fillOpacity:0.5,
					smoothFactor: 1
				});
				polygon.addTo(map);
				polygon.on('click',(e)=>{L.popup()
					.setLatLng([coordinate_center.lat,coordinate_center.lon])
					.setContent(name)
					.openOn(map);});
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

		function createMenu(){
			for(let i =0 ;i <relationArr.length;i++)
			{
				if(relationArr[i].sign =='A01')
				{
					let newLi=$('<li></li>');
					let categoryDiv = $('<div></div>').addClass('category').text(relationArr[i].sign);
					categoryDiv.on('click', function(event) {
						$(this).parent().find('.sublist').toggleClass('open');
					});
					let subListDiv = $('<div></div>').addClass('subList');
					for(let j =0; j<relationArr[i].category.length;j++){
						let list_smallerDiv = $('<div></div>').addClass('list_smaller');
						let category_smallerDiv = $('<div></div>').addClass('category_smaller').text(relationArr[i].category[j].category);
						category_smallerDiv.on('click', function(event) {
							$(this).parent().find('.sublist_smaller').toggleClass('open');
						});
						let sublist_smallerDiv = $('<div></div>').addClass('sublist_smaller');
						for(let k = 0 ; k <relationArr[i].category[j].room.length;k++)
						{
							let newDiv = $('<div></div>').text(relationArr[i].category[j].room[k].sign);
							newDiv.on('click',  function(event) {
								var polygon = drawBuildingOutline(srcInput.value.trim());
								if(polygon)
								{
									drewBuilding[0]=polygon;
									isSourceBtnPressed = true;
									deleteSrcBtn.disabled=false;
									srcName = srcInput.value;

									if(isDestinationBtnPressed)
										submitBtn.disabled = false;
								}
								else{
									alert('Không có địa điểm này');
								}
							});
							sublist_smallerDiv.append(newDiv);
						}

						list_smallerDiv.append(category_smallerDiv,sublist_smallerDiv);
						subListDiv.append(list_smallerDiv);
					}

					newLi.append(categoryDiv,subListDiv);
					$('ul.source.list').append(newLi);
				}
				else
					break;
			}
		}
});

