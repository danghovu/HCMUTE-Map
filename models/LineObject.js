function LineObject(startPoint,endPoint){
	this.startPoint=startPoint; // theo vĩ độ , vĩ độ
	this.endPoint=endPoint;   // theo vĩ độ , vĩ độ

};
LineObject.prototype.getDistanceFromLatLonInKm = function(point1,point2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(point2.lat-point1.lat);  // deg2rad below
  var dLon = deg2rad(point2.lon-point1.lon); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(point1.lat)) * Math.cos(deg2rad(point2.lat)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

LineObject.prototype.deg2rad=function(deg) {
  return deg * (Math.PI/180);
}
LineObject.prototype.getDistance = function(){
	this.distance = this.getDistanceFromLatLonInKm(this.startPoint,this.endPoint);
	return this.distance;
};

module.exports = LineObject;