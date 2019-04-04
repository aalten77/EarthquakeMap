var mapimg;

var center_lat = 0;
var center_lng = 0;

var lat = 31.2304;
var lng = 121.4737;

var zoom = 1;

var earthquakes;

function preload(){
    var mapWidth = 640;//windowWidth.toString();
    var mapHeight = 640;//windowHeight.toString();
    mapimg = loadImage('https://maps.googleapis.com/maps/api/staticmap?key=AIzaSyCd5K9E5VpqLyvugDgNfOkH2N4Ky-Bx4X8&center=0,0&zoom=1&format=png&maptype=roadmap&style=element:geometry%7Ccolor:0x212121&style=element:labels.icon%7Cvisibility:off&style=element:labels.text.fill%7Ccolor:0x757575&style=element:labels.text.stroke%7Ccolor:0x212121&style=feature:administrative%7Celement:geometry%7Ccolor:0x757575&style=feature:administrative.country%7Celement:labels.text.fill%7Ccolor:0x9e9e9e&style=feature:administrative.land_parcel%7Cvisibility:off&style=feature:administrative.locality%7Celement:labels.text.fill%7Ccolor:0xbdbdbd&style=feature:poi%7Celement:labels.text.fill%7Ccolor:0x757575&style=feature:poi.park%7Celement:geometry%7Ccolor:0x181818&style=feature:poi.park%7Celement:labels.text.fill%7Ccolor:0x616161&style=feature:poi.park%7Celement:labels.text.stroke%7Ccolor:0x1b1b1b&style=feature:road%7Celement:geometry.fill%7Ccolor:0x2c2c2c&style=feature:road%7Celement:labels.text.fill%7Ccolor:0x8a8a8a&style=feature:road.arterial%7Celement:geometry%7Ccolor:0x373737&style=feature:road.highway%7Celement:geometry%7Ccolor:0x3c3c3c&style=feature:road.highway.controlled_access%7Celement:geometry%7Ccolor:0x4e4e4e&style=feature:road.local%7Celement:labels.text.fill%7Ccolor:0x616161&style=feature:transit%7Celement:labels.text.fill%7Ccolor:0x757575&style=feature:water%7Celement:geometry%7Ccolor:0x000000&style=feature:water%7Celement:labels.text.fill%7Ccolor:0x3d3d3d&size='+mapWidth+'x'+mapHeight);
    print(windowWidth);
    print(windowHeight);

    earthquakes = loadStrings('all_month.csv');
}

function webMercatorX(lng){
    lng = radians(lng);
    var a = (128 / Math.PI) * pow(2, zoom); //use 128 since googleMaps uses 128x128 tiles
    var b = lng + Math.PI;
    return a * b;
}

function webMercatorY(lat){
    lat = radians(lat);
    var a = (128 / Math.PI) * pow(2, zoom);
    var b = Math.tan(Math.PI / 4 + lat / 2);
    var c = Math.PI - Math.log(b);
    return a * c;
}

function setup(){
    createCanvas(640, 640);
    translate(width/2, height/2);
    imageMode(CENTER);
    image(mapimg, 0,0);

    var centerX = webMercatorX(center_lng);
    var centerY = webMercatorY(center_lat);

    for (var i = 0; i < earthquakes.length; i++){
        var data = earthquakes[i].split(/,/); //regular expression for a single comma
        //console.log(data);
        var lat = data[1];
        var lng = data[2];
        var mag = data[4];

        mag = Math.pow(10, mag);
        mag = Math.sqrt(mag);

        var magMax = Math.sqrt(Math.pow(10,10));

        var x = webMercatorX(lng) - centerX;
        var y = webMercatorY(lat) - centerY;

        var diameter = map(mag, 0, magMax, 0, 180);
        stroke(255, 0, 255);
        fill(255, 0, 255, 200);
        ellipse(x, y, diameter, diameter);
    }


}

