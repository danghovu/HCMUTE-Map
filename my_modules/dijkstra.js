
const INFINITY = Number.MAX_VALUE;
class Dijkstra{
	constructor(pointArr,roadArr,buildingArr){
		this.source=null;
		this.destination=null;
		this.sourceDestinationCouple=[];// dùng để lưu các cặp source node và destination node được dùng để xét
		this.doneSet = new Set();//chứa các node đã xử lý xong
		this.unDoneSet = new Set();//chứa các node hiện tại đang xử lý
		this.nodeBeforeThisOne = new Map();//map dùng để chỉ ra node trước node hiện tại mà có đường đi tới node đó nhỏ nhất từ nguồn
		this.distanceToThisNode = new Map(); //có dạng (key=>value) với key là đỉnh, value là khoảng cách tới đỉnh đó tính từ nguồn
		this.idToNode = new Map(); // map id cua node tới 1 node thật sự chứa id đó
		this.buildingArr=buildingArr;
		this.roadArr =roadArr;
		this.pointArr=pointArr;
	}
	resetAll(){
		this.doneSet.clear();
		this.unDoneSet.clear();
		this.nodeBeforeThisOne.clear();
		this.pointArr.forEach((item) => {//khởi tạo các giá trị đàu
		  // Todo...
		  this.distanceToThisNode.set(item.id,INFINITY);

		})
	}

	findNodeByName(name){ //tìm tòa nhà có tên được đưa vào
		var size = this.buildingArr.length;
		var nodeSet = new Set(); // array các node thuộc tòa nhà cần tìm mà có tiếp xúc trực tiếp với đường đi
		for(var i =0 ; i< size;i++){
			if(this.buildingArr[i].name.toLowerCase()==name.toLowerCase()){
				var sizeOfLineObjects =this.buildingArr[i].lineObjects.length;
				for(var j = 0; j<sizeOfLineObjects;j++){
					for(var k = 0;k<this.roadArr.length;k++)
					{
						if(this.roadArr[k].startPoint.id===this.buildingArr[i].lineObjects[j].startPoint.id||this.roadArr[k].endPoint.id===this.buildingArr[i].lineObjects[j].startPoint.id)
							{
								nodeSet.add(this.buildingArr[i].lineObjects[j].startPoint.id);
								this.idToNode.set(this.buildingArr[i].lineObjects[j].startPoint.id,this.buildingArr[i].lineObjects[j].startPoint);
							}
						else if(this.roadArr[k].startPoint.id===this.buildingArr[i].lineObjects[j].endPoint.id||this.roadArr[k].endPoint.id===this.buildingArr[i].lineObjects[j].endPoint.id)
							{
								nodeSet.add(this.buildingArr[i].lineObjects[j].endPoint.id);
								this.idToNode.set(this.buildingArr[i].lineObjects[j].endPoint.id,this.buildingArr[i].lineObjects[j].endPoint);
							}
					}	
				}
				var nodeArr = [];
				nodeSet.forEach((item) => {
				  	nodeArr.push(this.idToNode.get(item));
				});
				return nodeArr;
			}
		}
		return null;
	};
	
	compareDistance(distance1,distance2){ // so sánh khoảng cách
		if(distance1===INFINITY||distance1>distance2)
			return 1;
		else if(distance2===INFINITY||distance2>distance1)
			return -1;
		else if(distance1===distance2)
			return 0;

	}
	findNeighbors(node){//tìm tất cả các điểm có nối trực tiếp với Node truyền vào và điểm còn lại trong đoạn thẳng đó (!=node) phải không nằm trong doneSet
		var neighbors=[];
		this.roadArr.forEach((item) => {
		  	if((item.startPoint.isEqual(node)&&!this.doneSet.has(item.endPoint.id))||(item.endPoint.isEqual(node)&&!this.doneSet.has(item.startPoint.id))){
		  		neighbors.push(item);
		  	}

		});

		return neighbors;//trả về tập các đoạn thẳng
	}
	calcNeighbors(node){//tính toán các tìm đường đi có trọng số ngắn nhất từ node tới các điểm có nối trực tiếp

		var neighbors=this.findNeighbors(node);

		neighbors.forEach((item) => {
		  	let tempDistance = item.getDistance();
		  	var processingNode=item.startPoint;//lấy điểm trong đoạn thẳng đang xét khác với node 
		  	
		  	if(node.isEqual(item.startPoint))
		  		processingNode = item.endPoint;
		  	if(tempDistance+this.distanceToThisNode.get(node.id)<this.distanceToThisNode.get(processingNode.id))
		  	{
		  		this.nodeBeforeThisOne.set(processingNode.id,node.id);
		  		this.distanceToThisNode.set(processingNode.id,tempDistance+this.distanceToThisNode.get(node.id));
		  		this.unDoneSet.add(processingNode.id);
		  		this.idToNode.set(processingNode.id,processingNode);
		  	}
		});
	}
	findMinDistanceToNeighbor(idSet){ // tìm trong tập các điểm trong unDoneSet điểm nào có khoảng cách từ source ngắn nhất
		var min=null;
		var set = new Set();//set các point Object thực sự
		idSet.forEach((item) => { // chuyển từ set các id của cái point Object thành set các Object
		  	set.add(this.idToNode.get(item));
		});
		set.forEach((item) => {
		  	if(!min)
		  		min=item;
		  	else if(this.compareDistance(this.distanceToThisNode.get(min.id),this.distanceToThisNode.get(item.id))==1)
		  		min=item;
		});
		return min;
	}
	run(sourceName,destinationName){
		if(sourceName===destinationName)
			return -1;
		else if((sourceName.toLowerCase()==='Tòa nhà A1'.toLowerCase() 
			&&(/^tòa nhà a2|3|4|5$/.test(destinationName.toLowerCase())))
			||((/^tòa nhà a2|3|4|5$/.test(sourceName.toLowerCase()))
			)&&destinationName.toLowerCase()==='Tòa nhà A1'.toLowerCase())
			{
				return 1;// chỉ trong trường hợp các tóa nhà a1 a2 a3 a4 a5
			}
		var sourceArr =this.findNodeByName(sourceName);
		
		var destinationArr = this.findNodeByName(destinationName);
		if(sourceArr&&destinationArr)
		{
			var pathLength=[];
			var tempNodeArr = [];		// Array chứa các đường đi từ các node với nhau 
										// vì 1 tòa nhà gồm nhiều node , ta chỉ dùng thuật toán tìm đường đối với
										// những node nào có trực tiếp nối với đường đi
			
			for(let i = 0;i<sourceArr.length;i++)
			{
				for(let j = 0 ; j<destinationArr.length;j++){
					if(!this.coreDijkstra(sourceArr[i],destinationArr[j])) // không tìm ra đường đi
					{
						pathLength.push(null);
						tempNodeArr.push(null);
					}
					else
					{
						pathLength.push(this.distanceToThisNode.get(this.destination.id));
						var newMap = new Map(this.nodeBeforeThisOne);
						tempNodeArr.push(newMap);
					}

					this.sourceDestinationCouple.push([this.source,this.destination]);
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
			this.nodeBeforeThisOne=tempNodeArr[minIndex];
			return this.getPath(this.sourceDestinationCouple[minIndex][0],this.sourceDestinationCouple[minIndex][1]);
		}
		return null;
	}
	coreDijkstra(source,des){
		this.source=source;
		this.destination=des;
				
		this.resetAll();

		this.distanceToThisNode.set(this.source.id,0);
		this.unDoneSet.add(this.source.id);

		this.idToNode.set(this.source.id,this.source);
		while(!this.doneSet.has(this.destination.id)&&this.unDoneSet.size!==0)
		{
			let minNode = this.findMinDistanceToNeighbor(this.unDoneSet);					
			this.unDoneSet.delete(minNode.id);
			this.calcNeighbors(minNode);
			this.doneSet.add(minNode.id);

		}
		if(!this.doneSet.has(this.destination.id)) // không có đường đi nối 2 điểm
			return false;
		return true; // có tìm ra đường giữa 2 node
	}
	getPath(source,destination){		
		var pointList=[];
		var nodeID =this.nodeBeforeThisOne.get(destination.id);
		pointList.push(destination);
		while(nodeID!==source.id){
			
			pointList.push(this.idToNode.get(nodeID));
			nodeID=this.nodeBeforeThisOne.get(nodeID);
		}
		pointList.push(source);
		return pointList.reverse();
	}

}

module.exports = Dijkstra;