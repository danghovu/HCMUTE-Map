const LineObject = require('./LineObject.js');
const PointObject = require('./PointObject.js');
class BuildingObject{
	constructor(){
		this.lineObjects=[];
		arguments[0].lineObjects.forEach((item) => {
		  // Todo...
		  
		  item = new LineObject(item);
		  this.lineObjects.push(item);
		});
		if(arguments[0].center)
			this.center = new PointObject({lat:arguments[0].center.lat,lon:arguments[0].center.lon});
		else
			this.center = null;
		this.name = arguments[0].name;
		this.sign = arguments[0].sign;
		this.id = arguments[0].id;
	}

}
module.exports = BuildingObject;