const LineObject = require('./LineObject.js');
class BuildingObject{
	constructor(){
		this.LineObjects=[];
		arguments[0].LineObjects.forEach((item) => {
		  // Todo...
		  
		  item = new LineObject(item);
		  this.LineObjects.push(item);
		});
		this.name = arguments[0].name;
		this.sign = arguments[0].sign;
	}
	getPerimeter(){
		var sum =0;
		for(let i = 0;i<this.LineObjects.length;i++){
			sum+= this.LineObjects[i].getDistance;
		}
		this.perimeter = sum;
		return this.perimeter;
	}
	//console.log(this);
}
// function BuildingObject(LineObjects,name,sign){
// 	LineObjects.forEach((item) => {
// 	  // Todo...
// 	  this.LineObjects= new LineObject(item);
// 	});
// 	this.name = name;
// 	this.sign = sign;
// }


// function BuildingObject(){
// 	this.LineObjects=[];
// 	arguments[0].LineObjects.forEach((item) => {
// 	  // Todo...
	  
// 	  item = new LineObject(item);
// 	  this.LineObjects.push(item);
// 	});
// 	this.name = arguments[0].name;
// 	this.sign = arguments[0].sign;
// 	//console.log(this);
// }
// // function BuildingObject(LineObjects,name,sign){
// // 	LineObjects.forEach((item) => {
// // 	  // Todo...
// // 	  this.LineObjects= new LineObject(item);
// // 	});
// // 	this.name = name;
// // 	this.sign = sign;
// // }
// BuildingObject.prototype.getPerimeter = function (){
// 	var sum =0;
// 	for(let i = 0;i<this.LineObjects.length;i++){
// 		sum+= this.LineObjects[i].getDistance;
// 	}
// 	this.perimeter = sum;
// 	return this.perimeter;
// }
module.exports = BuildingObject;