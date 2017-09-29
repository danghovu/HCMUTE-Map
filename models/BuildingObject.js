function BuildingObject(LineObjects,name,sign){
	this.LineObjects= LineObjects;
	this.name = name;
	this.sign = sign;
}

BuildingObject.prototype.getPerimeter = function (){
	var sum =0;
	for(let i = 0;i<this.LineObjects.length;i++){
		sum+= this.LineObjects[i].getDistance;
	}
	this.perimeter = sum;
	return this.perimeter;
}
module.exports = BuildingObject;