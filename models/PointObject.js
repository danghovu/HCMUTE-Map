 function PointObject () {//vĩ độ , kinh độ 
 	// console.log(arguments);

	this.lat= arguments[0].lat;
	this.lon= arguments[0].lon;
  this.id = this.toString();
	this.visited=false;
	this.isEqual = function(point2){
		if(this.lat===point2.lat&&this.lon===point2.lon)
			return 1;
		return 0;
	}
};

//  function PointObject (lon,lat) {//vĩ độ , kinh độ 
// 	this.lat= lat;
// 	this.lon= lon;
// 	this.visited=false;
// };

PointObject.prototype.getDistanceFromLatLonInKm = function(point2) {
  var R = 6371; // bk trai dat (km)
  var dLat = this.deg2rad(point2.lat-this.lat);  
  var dLon = this.deg2rad(point2.lon-this.lon); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.deg2rad(this.lat)) * Math.cos(this.deg2rad(point2.lat)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; 
  return Math.abs(d);
}

PointObject.prototype.deg2rad=function(deg) {
  return deg * (Math.PI/180);
}
PointObject.prototype.toString=function(){
  return this.lat.toString()+this.lon.toString();
}
module.exports = PointObject;