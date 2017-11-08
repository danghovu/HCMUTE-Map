 class PointObject {//vĩ độ , kinh độ 
  constructor(){
  	this.lat= arguments[0].lat;
  	this.lon= arguments[0].lon;
    this.id = this.toString();
  }
  isEqual(point2){
      if(this.lat===point2.lat&&this.lon===point2.lon)
        return 1;
      return 0;
    }
  getDistanceFromLatLonInKm(point2) {
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

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }
  toString(){
    return this.lat.toString()+this.lon.toString();
  }
};


module.exports = PointObject;