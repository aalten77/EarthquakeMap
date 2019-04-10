/**
 * This is a data visualization of Earthquake data from 1 month. This project is based off of Daniel Shiffman's
 * coding challenge #57 - Mapping Earthquake Data.
 *
 * Data collected from USGS Earthquake Hazards Program: https://earthquake.usgs.gov/earthquakes/feed/v1.0/csv.php
 *
 */

//holders for image and canvas
var mapimg;
var myCanvas;

//center of image coordinates
var center_lat = 0;
var center_lng = 0;

//zoom level of static map tile
var zoom = 1;

//holder for loaded geojson file
var earthquakes = new Array();

//constants for color gradient
let c1, c2, c1_solid, c2_solid;
let magScaler, diaScaler;

//link to query geojson data - ref: https://earthquake.usgs.gov/fdsnws/event/1/
//TODO: change query dynamically using time slider
//var link = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2019-03-01&endtime=2019-03-31&minmagnitude=3.5&minlatitude=-90&minlongitude=-180&maxlatitude=90&maxlongitude=180";
var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";

//holder to make HTTP requests
var xhr = new XMLHttpRequest();

/**
 * Make HTTP Request to link for geojson of earthquakes. Store the features as a featureObj in earthquakes array.
 *
 * @author Ai-Linh Alten <ai-linh.alten@sjsu.edu>
 */
function createFeatures(obj){
    let bbox = obj['bbox'];
    //console.log(bbox);
    var myArr = obj['features'];
    for(var i = 0; i < myArr.length; i++){

        //store lat, lng, mag, and time
        //ref on geojson obj - https://earthquake.usgs.gov/data/comcat/data-eventterms.php#time
        let datetime = new Date(myArr[i]['properties']['time']); //time is in milliseconds from 1970-01-01T00:00:00.000Z
        let featureObj = {
            lat: myArr[i]['geometry']['coordinates'][1],
            lng: myArr[i]['geometry']['coordinates'][0],
            mag: myArr[i]['properties']['mag'],
            time: datetime.toString(),
            title: myArr[i]['properties']['title']
        };
        earthquakes.push(featureObj);
    }

    // sort earthquakes from greatest to least magnitude
    earthquakes.sort(function(a, b){
        return b.mag - a.mag;
    });

    console.log(earthquakes);
}

/**
 *  Preload Google Map Static API and earthquake data.
 *  @author Ai-Linh Alten <ai-linh.alten@sjsu.edu>
 */
function preload(){
    var mapWidth = 640;//windowWidth.toString();
    var mapHeight = 640;//windowHeight.toString();
    mapimg = loadImage('https://maps.googleapis.com/maps/api/staticmap?key=AIzaSyCd5K9E5VpqLyvugDgNfOkH2N4Ky-Bx4X8&center=0,0&zoom=1&format=png&maptype=roadmap&style=element:geometry%7Ccolor:0x212121&style=element:labels.icon%7Cvisibility:off&style=element:labels.text.fill%7Ccolor:0x757575&style=element:labels.text.stroke%7Ccolor:0x212121&style=feature:administrative%7Celement:geometry%7Ccolor:0x757575&style=feature:administrative.country%7Celement:labels.text.fill%7Ccolor:0x9e9e9e&style=feature:administrative.land_parcel%7Cvisibility:off&style=feature:administrative.locality%7Celement:labels.text.fill%7Ccolor:0xbdbdbd&style=feature:poi%7Celement:labels.text.fill%7Ccolor:0x757575&style=feature:poi.park%7Celement:geometry%7Ccolor:0x181818&style=feature:poi.park%7Celement:labels.text.fill%7Ccolor:0x616161&style=feature:poi.park%7Celement:labels.text.stroke%7Ccolor:0x1b1b1b&style=feature:road%7Celement:geometry.fill%7Ccolor:0x2c2c2c&style=feature:road%7Celement:labels.text.fill%7Ccolor:0x8a8a8a&style=feature:road.arterial%7Celement:geometry%7Ccolor:0x373737&style=feature:road.highway%7Celement:geometry%7Ccolor:0x3c3c3c&style=feature:road.highway.controlled_access%7Celement:geometry%7Ccolor:0x4e4e4e&style=feature:road.local%7Celement:labels.text.fill%7Ccolor:0x616161&style=feature:transit%7Celement:labels.text.fill%7Ccolor:0x757575&style=feature:water%7Celement:geometry%7Ccolor:0x000000&style=feature:water%7Celement:labels.text.fill%7Ccolor:0x3d3d3d&size='+mapWidth+'x'+mapHeight);
    print(windowWidth);
    print(windowHeight);

    //TODO: figure out why this doesn't load the earthquakes array on page load...
    xhr.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200){
            var geojsonObject = JSON.parse(this.responseText);
            createFeatures(geojsonObject);
        }
    };

    xhr.open("GET", link, true);
    xhr.send();
    //earthquakes = loadStrings('all_month_current.csv');
}

/**
 * Converts longitude into Web Mercator X coordinate.
 * @author Daniel Shiffman <https://thecodingtrain.com>
 * @param {float} lng - Longitude in decimal degrees WGS84.
 * @returns {number}
 */
function webMercatorX(lng){
    lng = radians(lng);
    var a = (128 / Math.PI) * pow(2, zoom); //use 128 since googleMaps uses 128x128 tiles
    var b = lng + Math.PI;
    return a * b;
}

/**
 * Converts latitude into Web Mercator Y coordinate.
 * @author Daniel Shiffman <https://thecodingtrain.com>
 * @param {float} lat - Latitude in decimal degrees WGS84.
 * @returns {number}
 */
function webMercatorY(lat){
    lat = radians(lat);
    var a = (128 / Math.PI) * pow(2, zoom);
    var b = Math.tan(Math.PI / 4 + lat / 2);
    var c = Math.PI - Math.log(b);
    return a * c;
}

/**
 * Make canvas center of screen.
 * https://github.com/processing/p5.js/wiki/Positioning-your-canvas
 *
 * @author Ai-Linh Alten <ai-linh.alten@sjsu.edu>
 */
function centerCanvas() {
    var x = (windowWidth - width)/2;
    var y = (windowHeight - height)/2;
    //myCanvas.position(x, y);  Got an error on my machine at this line, so commented it out.  Works after.
}

/**
 *  Create P5 canvas and load 1 month earthquake data. Project data into Web Mercator coordinates.
 *  Data points based on magnitude of the earthquake.
 *  Google Map tile placed in middle of canvas. Map tile will always be 640x640.
 *
 *  @author Ai-Linh Alten <ai-linh.alten@sjsu.edu>
 *  @author Jason Do <jason.do@sjsu.edu>
 */
function setup(){
    //Define colors - https://uigradients.com/#AzurePop
    c1 = color('#89fffdbf'); //light blue w/ 75% transparency - ref: https://css-tricks.com/8-digit-hex-codes/
    c2 = color('#ef32d9bf'); //magenta w/ 75% transparency - ref: https://css-tricks.com/8-digit-hex-codes/
    c1_solid = color('#89fffd'); //light blue
    c2_solid = color('#ef32d9'); //magenta

    //canvas with image centerpoint as (0,0). Image is then translated to middle of canvas.
    myCanvas = createCanvas(windowWidth, windowHeight);
    centerCanvas();
    myCanvas.parent('myCanvas');

    textSize(15);
    noStroke();

    magScaler = createSlider(0, 10, 10);
    magScaler.position(20, 50);
    diaScaler = createSlider(1, 10, 1);
    diaScaler.position(20, 100);

    draw();
}

/**
 * Execute functions when window is resized.
 * @author Ai-Linh Alten <ai-linh.alten@sjsu.edu>
 */
function windowResized() {
    centerCanvas();
    //resizeCanvas(windowWidth, windowHeight);
    setup();
}

/**
 * Redraws the canvas on update.
 * @author Jason Do <jason.do@sjsu.edu>
 */
function draw() {
    //console.log("updating");
    const context = canvas.getContext('2d');
    context.clearRect(-width / 2, -height / 2, canvas.width, canvas.height);

    //TODO: not sure if this translate is necessary - Ai-Linh
    translate(width / 2, height / 2);
    imageMode(CENTER);
    image(mapimg, 0, 0);
    //console.log("updating");

    var centerX = webMercatorX(center_lng);
    var centerY = webMercatorY(center_lat);
    var magcap = magScaler.value();
    var scale = diaScaler.value();
    // console.log(magcap);
    // console.log(scale);
    //
    // console.log(earthquakes.length);

    //iterate line by line through CSV to get data
    for (var i = 0; i < earthquakes.length; i++) {
        //var data = earthquakes[i].split(/,/); //regular expression for a single comma
        //console.log(data);
        var lat = earthquakes[i]['lat'];
        var lng = earthquakes[i]['lng'];
        var mag = earthquakes[i]['mag'];
        var truemag = parseFloat(earthquakes[i]['mag']);

        //color gradient mapping based on magnitude
        let inter = map(mag, 0, 10, 0, 1);
        let c = lerpColor(c1, c2, inter);
        let c_solid = lerpColor(c1_solid, c2_solid, inter);

        // convert magnitude to logarithmic scale to get diameter of circle
        mag = Math.pow(10, mag);
        mag = Math.sqrt(mag);

        //largest magnitude in logarithmic scale
        var magMax = Math.sqrt(Math.pow(10, 10));

        // new coordinate offset from center of image
        var x = webMercatorX(lng) - centerX;
        var y = webMercatorY(lat) - centerY;

        //draw circle
        var diameter = map(mag, 0, magMax, 0, 180);
        // console.log(magcap);
        // console.log(truemag);
        // console.log("updating");
        if (truemag < magcap) {
            stroke(c_solid);
            fill(c);
            ellipse(x, y, diameter * scale, diameter * scale);
        }
        else {
            // console.log(truemag);
        }
    }
}