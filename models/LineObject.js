const PointObject= require('./PointObject.js');
class LineObject{
	constructor(){
		this.startPoint = new PointObject({lon:arguments[0].startPoint.lon,lat:arguments[0].startPoint.lat});// theo vĩ độ , vĩ độ
  		this.endPoint = new PointObject({lon:arguments[0].endPoint.lon,lat:arguments[0].endPoint.lat});// theo vĩ độ , vĩ độ
	}
  	getDistance (){
		this.distance = this.startPoint.getDistanceFromLatLonInKm(this.endPoint);
		return this.distance;
	}
};

module.exports = LineObject;