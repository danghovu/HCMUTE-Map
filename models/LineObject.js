const PointObject= require('./PointObject.js');
class LineObject{
	constructor(){
		this.startPoint = new PointObject({lon:arguments[0].startPoint.lon,lat:arguments[0].startPoint.lat});// theo vĩ độ , vĩ độ
  		this.endPoint = new PointObject({lon:arguments[0].endPoint.lon,lat:arguments[0].endPoint.lat});// theo vĩ độ , vĩ độ
	}
  	getDistance (){
	  //console.log(this.startPoint);
		this.distance = this.startPoint.getDistanceFromLatLonInKm(this.endPoint);
		return this.distance;
	}
};



// function LineObject(){
//   this.startPoint = new PointObject({lon:arguments[0].startPoint.lon,lat:arguments[0].startPoint.lat});// theo vĩ độ , vĩ độ
//   this.endPoint = new PointObject({lon:arguments[0].endPoint.lon,lat:arguments[0].endPoint.lat});// theo vĩ độ , vĩ độ
// };

// LineObject.prototype.getDistance = function(){
//   //console.log(this.startPoint);
// 	this.distance = this.startPoint.getDistanceFromLatLonInKm(this.endPoint);
// 	return this.distance;
// };

// function LineObject(startPoint,endPoint){
//   this.startPoint = new PointObject(startPoint.lon,startPoint.lat);// theo vĩ độ , vĩ độ
//   this.endPoint = new PointObject(endPoint.lon,endPoint.lat);// theo vĩ độ , vĩ độ
//   // this.startPoint=startPoint; // theo vĩ độ , vĩ độ
//   // this.endPoint=endPoint;   // theo vĩ độ , vĩ độ

// };

module.exports = LineObject;