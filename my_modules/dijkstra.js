const LineObject = require('../models/LineObject.js');
const BuildingObject = require('../models/BuildingObject.js');
const PointObject = require('../models/PointObject.js');


const INFINITY = Number.MAX_VALUE;
function Dijkstra(pointArr,lineArr,roadArr,buildingArr){
	var source;
	var destination;
	var sourceDestinationCouple=[];// dùng để lưu các cặp source node và destination node được dùng để xét
	var doneSet = new Set();//chứa các node đã xử lý xong
	var unDoneSet = new Set();//chứa các node hiện tại đang xử lý
	var nodeBeforeThisOne = new Map();//map dùng để chỉ ra node trước node hiện tại mà có đường đi tới node đó nhỏ nhất từ nguồn
	var distanceToThisNode = new Map(); //có dạng (key=>value) với key là đỉnh, value là khoảng cách tới đỉnh đó tính từ nguồn
	var idToNode = new Map(); // map id cua node tới 1 node thật sự chứa id đó
	
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
		var nodeSet = new Set(); // array các node thuộc tòa nhà cần tìm mà có tiếp xúc trực tiếp với đường đi
		for(var i =0 ; i< size;i++){
			if(buildingArr[i].name.toLowerCase()==name.toLowerCase()){
				sizeOfLineObjects =buildingArr[i].LineObjects.length;
				for(var j = 0; j<sizeOfLineObjects;j++){
					// console.log(buildingArr[i].LineObjects.length);

					for(var k = 0;k<roadArr.length;k++)
					{
						if(roadArr[k].startPoint.id===buildingArr[i].LineObjects[j].startPoint.id||roadArr[k].endPoint.id===buildingArr[i].LineObjects[j].startPoint.id)
							{
								nodeSet.add(buildingArr[i].LineObjects[j].startPoint.id);
								idToNode.set(buildingArr[i].LineObjects[j].startPoint.id,buildingArr[i].LineObjects[j].startPoint);
							}
						else if(roadArr[k].startPoint.id===buildingArr[i].LineObjects[j].endPoint.id||roadArr[k].endPoint.id===buildingArr[i].LineObjects[j].endPoint.id)
							{
								nodeSet.add(buildingArr[i].LineObjects[j].endPoint.id);
								idToNode.set(buildingArr[i].LineObjects[j].endPoint.id,buildingArr[i].LineObjects[j].endPoint);
							}
					}	
				}
				var nodeArr = [];
				nodeSet.forEach((item) => {
				  	nodeArr.push(idToNode.get(item));
				});
				return nodeArr;
			}
		}
		return null;
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
		// console.log("findNeighbors");
		// console.log(node);
		roadArr.forEach((item) => {
		  	if((item.startPoint.isEqual(node)&&!doneSet.has(item.endPoint.id))||(item.endPoint.isEqual(node)&&!doneSet.has(item.startPoint.id))){
		  		neighbors.push(item);
		  		// console.log(neighbors);
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
		  	// console.log("processing:");
		  	// console.log(processingNode);
		  	// console.log(tempDistance);
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
		// console.log("set");
		// console.log(set.values());
		set.forEach((item) => {
		  	if(!min)
		  		min=item;
		  	else if(this.compareDistance(distanceToThisNode.get(min.id),distanceToThisNode.get(item.id))==1)
		  		min=item;
		});
		return min;
	}
	this.run = function(sourceName,destinationName){
		if(sourceName===destinationName)
			return -1;
		var sourceArr =this.findNodeByName(sourceName);
		
		// console.log(sourceArr);
		// console.log("i:"+sourceArr.length);
		var destinationArr = this.findNodeByName(destinationName);
		
		var pathLength=[];
		var tempNodeArr = [];		// Array chứa các đường đi từ các node với nhau 
									// vì 1 tòa nhà gồm nhiều node , ta chỉ dùng thuật toán tìm đường đối với
									// những node nào có trực tiếp nối với đường đi
		// console.log(sourceArr[0]);
		// console.log("====================");
		// console.log(sourceArr[2]);
		// console.log("====================");
		// console.log(sourceArr[3]);
		for(let i = 0;i<sourceArr.length;i++)
		{
			for(let j = 0 ; j<destinationArr.length;j++){
				//Dijkstra bắt đầu từ đây

				// this.source=sourceArr[i];
				// this.destination=destinationArr[j];
				
				// // this.source=this.findNodeByName(sourceName);
				// // this.destination=this.findNodeByName(destinationName);
				
				// this.resetAll();
				// // console.log("i:"+sourceArr.length);
				// distanceToThisNode.set(this.source.id,0);
				// unDoneSet.add(this.source.id);
				// // console.log(unDoneSet);
				// idToNode.set(this.source.id,this.source);
				// while(!doneSet.has(this.destination.id)&&unDoneSet.size!==0)
				// {
				// 	let minNode = this.findMinDistanceToNeighbor(unDoneSet);
					
				// 	unDoneSet.delete(minNode.id);
				// 	// console.log("minNode:"+minNode);
				// 	this.calcNeighbors(minNode);

				// 	doneSet.add(minNode.id);
				// 	// console.log(doneSet);
				// }
				if(!this.coreDijkstra(sourceArr[i],destinationArr[j])) // không tìm ra đường đi
				{
					pathLength.push(null);
					tempNodeArr.push(null);
				}
				else
				{
					pathLength.push(distanceToThisNode.get(this.destination.id));
					var newMap = new Map(nodeBeforeThisOne);
					tempNodeArr.push(newMap);
					console.log("Lengh:"+pathLength[j]);
					console.log(this.getPath(sourceArr[i],destinationArr[j]));
					console.log("=========================");
				}

				sourceDestinationCouple.push([this.source,this.destination]);
			}			
		}
		//Sau khi dùng dijkstra để tìm đường đi ngắn nhất giữa các node trong 2 tòa nhà , ta tìm đường nào ngắn nhất trong các đường vừa tìm ra
		var minIndex=-1;//lưu index của đường ngắn nhất

		for(var i=0;i<pathLength.length;i++){ //tìm phần tử đầu tiên khác null (có nghĩa là tìm đoạn đường đầu tiên nối 2 điểm)
			if(pathLength[i]!==null){
				minIndex=i;
				break;
			}
		}
		if(minIndex===-1)
			return null;
		for(var i = 1 ; i<pathLength.length;i++){
			if(pathLength[i]!==null&&pathLength[i]<pathLength[minIndex])
				minIndex=i;
		}
		nodeBeforeThisOne=tempNodeArr[minIndex];
		// console.log(nodeBeforeThisOne);
		return this.getPath(sourceDestinationCouple[minIndex][0],sourceDestinationCouple[minIndex][1]);
	}
	this.coreDijkstra = function (source,des){
		this.source=source;
		this.destination=des;
				
		// this.source=this.findNodeByName(sourceName);
		// this.destination=this.findNodeByName(destinationName);
				
		this.resetAll();
		// console.log("i:"+sourceArr.length);
		distanceToThisNode.set(this.source.id,0);
		unDoneSet.add(this.source.id);
		// console.log(unDoneSet);
		idToNode.set(this.source.id,this.source);
		while(!doneSet.has(this.destination.id)&&unDoneSet.size!==0)
		{
			let minNode = this.findMinDistanceToNeighbor(unDoneSet);
					
			unDoneSet.delete(minNode.id);
					// console.log("minNode:"+minNode);
			this.calcNeighbors(minNode);

			doneSet.add(minNode.id);
			// console.log(doneSet);
		}
		if(!doneSet.has(this.destination.id)) // không có đường đi nối 2 điểm
			return null;
		return true; // có tìm ra đường giữa 2 node
	}
	this.getPath=function(source,destination){		
		var pointList=[];
		var nodeID =nodeBeforeThisOne.get(destination.id);
		// console.log(nodeID);
		pointList.push(destination);
		while(nodeID!==source.id){
			
			pointList.push(idToNode.get(nodeID));
			nodeID=nodeBeforeThisOne.get(nodeID);
		}
		pointList.push(source);
		return pointList.reverse();
	}

}

module.exports = Dijkstra;