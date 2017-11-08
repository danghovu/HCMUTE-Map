$(document).ready(function() {
	var map ;
	var buildingArr;
	var relationArr;
	var drewLine=[];
	var drewBuilding=[];
	var drewPopup=[];
	var srcName ;
	var desName ; 
	map = new L.map('map',{zoomControl: false}).setView([10.85205,106.77171],19);

	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { 
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(map);
		new L.Control.Zoom({
			position: 'topright'
		}).addTo(map);
	var sourceBtn = $('#source');
	
	var destinationBtn = $('#destination');
	var deleteBtn = document.getElementById('deleteBtn');
	
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
		buildingArr=result.buildingArr;
		relationArr=result.relationArr;
		console.log(relationArr);
		buildingArr.forEach((item) => {
		  // Todo...
		  drawBuildingOutline({containerName:item.name},1);
		})
		createMenu(1);
		createMenu(0);
		

		deleteBtn.addEventListener('click',function(){
			sourceBtn.text('From : ');
			destinationBtn.text('To : ');
			map.closePopup(drewPopup[0]);
			map.closePopup(drewPopup[1]);
			removeDrewRoute()
		});
		deleteSrcBtn.addEventListener('click',function(){
			if(drewBuilding[0]){
				removeDrewLine();
				sourceBtn.text('From : ');
				map.removeLayer(drewBuilding[0]);
				drewBuilding[0]=null;
				map.closePopup(drewPopup[0]);
			}
		});
		deleteDesBtn.addEventListener('click',function(){
			if(drewBuilding[1])
			{
				destinationBtn.text('To : ');
				
				removeDrewLine();
				map.removeLayer(drewBuilding[1]);
				drewBuilding[1]=null;
				map.closePopup(drewPopup[1]);
			}
		});
	});
 
	
//Các function thao tác để vẽ đường đi
		function removeDrewRoute(){
			removeDrewLine();
			removeDrewBuilding(0);
			removeDrewBuilding(1);
		}
		function removeDrewLine(){
			if(drewLine.length>0)
				{
					drewLine.forEach((item) => {
					map.removeLayer(item);
				});
				drewLine=drewLine.splice();
			}
		}
		function removeDrewBuilding(index){
			console.log("Index :"+drewBuilding[index]);
			if(drewBuilding[index])
			{
				console.log("here");
				map.removeLayer(drewBuilding[index]);
				drewBuilding[index]=null;
				if(index)
					desName=null;
				else 
					srcName= null;
			}
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

		function drawBuildingOutline(buildingObject,init){ // init : có phải là hàm vẽ khởi tạo không
			if(buildingObject.containerName==='ĐH Sư Phạm Kỹ Thuật TP.HCM'||buildingObject.containerName==='Tòa nhà trung tâm')
				return;
			var pointList=[];
			var coordinate_center;
			for(var i =0 ; i< buildingArr.length;i++){

				if(buildingArr[i]['name'].toLowerCase()==buildingObject.containerName.toLowerCase()){
					for(var j = 0 ; j<buildingArr[i].lineObjects.length;j++){
						var pointA = new L.LatLng(buildingArr[i].lineObjects[j].startPoint.lat,buildingArr[i].lineObjects[j].startPoint.lon);
						var pointB = new L.LatLng(buildingArr[i].lineObjects[j].endPoint.lat  ,buildingArr[i].lineObjects[j].endPoint.lon);
						pointList.push(pointA);
						pointList.push(pointB);
					}

					coordinate_center=buildingArr[i].center;
					console.log(buildingArr[i].center);
				}
			}
			if(pointList.length===0)
				return null;
			if(init&&buildingObject.containerName!=='Bỏ')
			{
				//
				var polygon = new L.Polygon(pointList,{
					
					opacity: 1,
					fillOpacity:1,
					weight:1
				});
				if(buildingObject.containerName.toLowerCase().includes('sân')||buildingObject.containerName.toLowerCase().includes('công viên khu e')){
					polygon.setStyle({fillColor:'#CDEBB0',color:'#CDEBB0'})
				}
				else if (buildingObject.containerName.toLowerCase().includes('bãi')) {
					
					polygon.setStyle({fillColor:'#F7EFB7',color:'#EEE598'})
				}
				else{
					polygon.setStyle({fillColor:'#D9D0C9',
					color:'#CABEB2'})
				}
				polygon.bindPopup(buildingObject.containerName).addTo(map);
				return polygon;
			}
			else if(buildingObject.containerName!=='Bỏ'){ 
				console.log(coordinate_center);
				var content;
				var polygon = new L.Polygon(pointList,{
					fillColor:'green',
					color:'blue',
					opacity: 1,
					fillOpacity:0.5,
					smoothFactor: 1
				});
				polygon.addTo(map);
				if(!buildingObject.thisRoomSign)//Trường hợp không có container
				{
					content=buildingObject.containerName ;
				}
				else if(!buildingObject.level){ // trường hợp chỉ có container 1 lớp
					content = "<p>"+buildingObject.thisRoomSign+" - "+buildingObject.containerName+"<p>";
				}	
				else {

					content = "<p>"+buildingObject.thisRoomSign+"<p>"+"Tầng "+(buildingObject.level==0?"trệt":buildingObject.level+1)+" - " +buildingObject.containerName ;
				}
				var popup = L.popup()
					.setLatLng([coordinate_center.lat,coordinate_center.lon])
					.setContent(content);
				popup.openOn(map);
				polygon.on('click',(e)=>{
					popup.openOn(map);
				});
				return {polygon:polygon,popup:popup};
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

		function createMenu(isDes){ // tạo menu
			for(let i =0 ;i <relationArr.length;i++)
			{
				if(relationArr[i].categories.length >0) // trường hợp tòa nhà có các nhóm phòng ban
				{
					let newLi=$('<li></li>');
					let categoryDiv = $('<div></div>').addClass('category haveChild').text(relationArr[i].sign);
					categoryDiv.on('click', function(event) {
						$(this).parent().find('.sublist').toggleClass('open'); 
					});
					let subListDiv = $('<div></div>').addClass('subList');
					for(let j =0; j<relationArr[i].categories.length;j++){
						if(relationArr[i].categories[j].category!=='no') // category != no => phòng này thuộc nhóm phòng ban
						{
							let list_smallerDiv = $('<div></div>').addClass('list_smaller');
							let category_smallerDiv = $('<div></div>').addClass('category_smaller').text(relationArr[i].categories[j].category);
							category_smallerDiv.on('click', function(event) {//if cho nay
								$(this).parent().find('.sublist_smaller ').toggleClass('open');
							});
							let sublist_smallerDiv = $('<div></div>').addClass('sublist_smaller');
							for(let k = 0 ; k <relationArr[i].categories[j].room.length;k++)
							{
								let newDiv = $('<div></div>').text(relationArr[i].categories[j].room[k].sign);
								newDiv.on('click',  function(event) {
									handleClickDiv({containerName:relationArr[i].name,thisRoomSign:relationArr[i].categories[j].room[k].sign,level:relationArr[i].categories[j].room[k].level},isDes);
								});
								sublist_smallerDiv.append(newDiv);
							}

							list_smallerDiv.append(category_smallerDiv,sublist_smallerDiv);
							subListDiv.append(list_smallerDiv);
						}
						else// phòng này thuộc trực tiếp vào tòa nhà
						{
							for(let k = 0 ; k < relationArr[i].categories[j].room.length ;k++)
							{
								let newDiv = $('<div></div>').text(relationArr[i].categories[j].room[k].sign);
								newDiv.on('click',  function(event) {
									handleClickDiv({containerName:relationArr[i].name,thisRoomSign:relationArr[i].categories[j].room[k].sign,level:relationArr[i].categories[j].room[k].level},isDes);
								});
								subListDiv.append(newDiv);
							}
						}
					}

					newLi.append(categoryDiv,subListDiv);
					if(isDes)
						$('ul.destination.list').append(newLi);
					else
						$('ul.source.list').append(newLi);
				}
				else // tòa nhà này không có bất kỳ nhóm phòng ban nhỏ nào
				{

					let newLi = $('<li></li>');
					let content="";
					if(relationArr[i].sign)
					{
						content=relationArr[i].sign + ' - ';
					}

					let newDiv = $('<div></div>').addClass('category').text(content+relationArr[i].name);
					newDiv.on('click',function(event) {
						handleClickDiv({containerName:relationArr[i].name,containerSign:relationArr[i].sign},isDes);
					});
					newLi.append(newDiv);
					if(isDes)
						$('ul.destination.list').append(newLi);
					else
						$('ul.source.list').append(newLi);
				}
			}
		}
		function handleClickDiv(popupContentObj,isDes){
			var returnObject = drawBuildingOutline(popupContentObj,null,isDes);
			removeDrewLine();//xóa đường nối giữa 2 địa điểm trước , không làm gì nếu chưa chọn xong 2 điểm
			if(returnObject.polygon && !isDes)
			{
				removeDrewBuilding(0);
				srcName=popupContentObj.containerName;
				drewBuilding[0]=returnObject.polygon;
				drewPopup[0]=returnObject.popup;
				if(popupContentObj.thisRoomSign)
					sourceBtn.text("From : "+popupContentObj.thisRoomSign);
				else
					sourceBtn.text("From : "+popupContentObj.containerName);
			}
			else if (returnObject.polygon && isDes) {
				removeDrewBuilding(1);
				desName=popupContentObj.containerName;
				drewBuilding[1]=returnObject.polygon;
				drewPopup[1]=returnObject.popup;
				if(popupContentObj.thisRoomSign)
					destinationBtn.text("To : "+popupContentObj.thisRoomSign);
				else
					destinationBtn.text("To : "+popupContentObj.containerName);
			}
			else{
				alert('Không có địa điểm này');
			}
			if(drewBuilding[0]&&drewBuilding[1]){
				getPath();
			}
		}
		function getPath(){
			$.ajax({
				url:'/dijkstra?source='+encodeURIComponent(srcName)+'&destination='+encodeURIComponent(desName),
				type:'get',
				contentType:'application/json',
				success :function(result){
					var res=JSON.parse(result);
						if(res.success)
						{
							var path=res.path;
							if(path){
								for(var i = 0;i<path.length-1;i++){
									drewLine.push(drawLine(path[i],path[i+1]));
								}
							}					
						}
						else if(!res.success && res.err==2)
							alert(res.msg);
				},
				error: function (){
					alert('Server có vấn đề');
				}
			});
		}
});

