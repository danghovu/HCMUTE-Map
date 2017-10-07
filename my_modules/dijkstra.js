const LineObject = require('../models/LineObject.js');
const BuildingObject = require('../models/BuildingObject.js');
const PointObject = require('../models/PointObject.js');


const INFINITY = Number.MAX_VALUE;
function Dijkstra(pointArr,lineArr,buildingArr){
	var source;
	var destination;
	var doneSet = new Set();//chứa các node đã xử lý xong
	var unDoneSet = new Set();//chứa các node hiện tại đang xử lý
	var nodeBeforeThisOne = new Map();//map dùng để chỉ ra node trước node hiện tại mà có đường đi tới node đó nhỏ nhất từ nguồn
	var distanceToThisNode = new Map(); //có dạng (key=>value) với key là đỉnh, value là khoảng cách tới đỉnh đó tính từ nguồn
	var idToNode = new Map(); // map id cua node tới 1 node thật sự chứa id đó
	this.clonePointArr = pointArr.slice();
	this.cloneLineArr= lineArr.slice();
	this.cloneBuildingArr= buildingArr.slice();
	var count=0;
	this.resetAll = function(){
		doneSet.clear();
		unDoneSet.clear();
		nodeBeforeThisOne.clear();
		pointArr.forEach((item) => {//khởi tạo các giá trị đàu
		  // Todo...
		  distanceToThisNode.set(item.id,INFINITY);

		})
	}

	this.findNodeByName = function(name){ //tìm tòa nhà có tên được đưa vào
		size = buildingArr.length;
		for(var i =0 ; i< size;i++){
			if(buildingArr[i].name==name)
				return buildingArr[i];
		}
	};
	
	this.compareDistance=function(distance1,distance2){ // so sánh khoảng cách
		if(distance1===INFINITY||distance1>distance2)
			return 1;
		else if(distance2===INFINITY||distance2>distance1)
			return -1;
		else if(distance1===distance2)
			return 0;

	}
	this.findNeighbors = function(node){//tìm tất cả các điểm có nối trực tiếp với Node truyền vào và điểm còn lại trong đoạn thẳng đó (!=node) phải không nằm trong doneSet
		var neighbors=[];
		console.log("findNeighbors");
		console.log(node);
		lineArr.forEach((item) => {
		  	if((item.startPoint.isEqual(node)&&!doneSet.has(item.endPoint.id))||(item.endPoint.isEqual(node)&&!doneSet.has(item.startPoint.id))){
		  		neighbors.push(item);
		  		console.log(neighbors);
		  	}

		});

		return neighbors;//trả về tập các đoạn thẳng
	}
	this.calcNeighbors = function(node){//tính toán các tìm đường đi có trọng số ngắn nhất từ node tới các điểm có nối trực tiếp

		var neighbors=this.findNeighbors(node);

		neighbors.forEach((item) => {
		  	let tempDistance = item.getDistance();
		  	//console.log(tempDistance);
		  	var processingNode=item.startPoint;//lấy điểm trong đoạn thẳng đang xét khác với node 
		  	
		  	if(node.isEqual(item.startPoint))
		  		processingNode = item.endPoint;
		  	console.log("processing:");
		  	console.log(processingNode);
		  	console.log(tempDistance);
		  	if(tempDistance+distanceToThisNode.get(node.id)<distanceToThisNode.get(processingNode.id))
		  	{
		  		nodeBeforeThisOne.set(processingNode.id,node.id);
		  		distanceToThisNode.set(processingNode.id,tempDistance+distanceToThisNode.get(node.id));
		  		unDoneSet.add(processingNode.id);
		  		idToNode.set(processingNode.id,processingNode);
		  	}
		});
	}
	this.findMinDistanceToNeighbor=function(idSet){ // tìm trong tập các điểm trong unDoneSet điểm nào có khoảng cách từ source ngắn nhất
		var min=null;
		var set = new Set();//set các point Object thực sự
		idSet.forEach((item) => { // chuyển từ set các id của cái point Object thành set các Object
		  	set.add(idToNode.get(item));
		});
		console.log("set");
		console.log(set.values());
		set.forEach((item) => {
		  	if(!min)
		  		min=item;
		  	else if(this.compareDistance(distanceToThisNode.get(min.id),distanceToThisNode.get(item.id))==1)
		  		min=item;
		});
		return min;
	}
	this.dijkstra = function(sourceName,destinationName){
		this.source=this.findNodeByName(sourceName).LineObjects[0].startPoint;
		this.destination=this.findNodeByName(destinationName).LineObjects[0].startPoint;
		if(sourceName===destinationName)
			return;

		

		this.resetAll();
		distanceToThisNode.set(this.source.id,0);
		unDoneSet.add(this.source.id);
		idToNode.set(this.source.id,this.source);
		while(!doneSet.has(this.destination.id)&&unDoneSet.size!==0)
		{
			let minNode = this.findMinDistanceToNeighbor(unDoneSet);
			
			unDoneSet.delete(minNode.id);
			console.log("minNode:"+minNode);
			this.calcNeighbors(minNode);

			doneSet.add(minNode.id);
		}
	}
	this.getPath=function(){
		if(this.source===this.destination)
			return [this.source.id];
		else if(!doneSet.has(this.destination.id)) // không có đường đi nối 2 điểm
			return null;
		
		var pointList=[];
		var nodeID =nodeBeforeThisOne.get(this.destination.id);
		console.log(nodeID);
		pointList.push(this.destination);
		while(nodeID!==this.source.id){
			
			pointList.push(idToNode.get(nodeID));
			nodeID=nodeBeforeThisOne.get(nodeID);
		}
		pointList.push(this.source);
		return pointList.reverse();
	}

}

module.exports = Dijkstra;