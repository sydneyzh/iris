iris
========

Store and convert color variables with `IRIS.Color()`

## Feature ##

Hands-free instant syncing of internal `RGB`, `HSV`, and `hex string` color representations.

## Usage ##

### constructors ###

``` javascript
var color = new IRIS.Color();
var red = new IRIS.Color( 'ff0000' );
var green = new IRIS.Color( 'g', 255 );
var blue = new IRIS.Color( 'hsv', 240, 100, 100 );
```

### getters and setters ###

``` javascript
var color = new IRIS.Color();
color.setHSV( 233, 74, 78 );
color.getRed(); // 51.714
color.getHexString(); // 3445c7
```

## Reference ##

### Data Ranges

+ `r`, `g`, `b` are numbers from 0 to 255

+ `h` is a number from 0 to 360

+ `s` and `v` are numbers from 0 to 100

+ `hexString` is a string representing the colors from `'000000'` to `'ffffff'`

\*The setters do not wrap input values. If an out-of-range value is detected, an error will be reported to the console.\*

### IRIS.Color
#### Public Methods
+ `set( type, x, y, z )`

  `type` can be `'r'`, `'red'`, `'g'`, `'green'`, `'b'`, `'blue'`, `'h'`, `'hue'`, `'s'`, `'saturation'`, `'v'`, `'value'`, `'hexString'`

+ `setRed( val )`

+ `setGreen( val )`

+ `setBlue( val )`

+ `setHue( val )`

+ `setSaturation( val )`

+ `setValue( val )`

+ `setHexString( val )`

+ `setRGB( r, g, b )`

+ `setHSV( h, s, v )`

+ `getRed()`

+ `getGreen()`

+ `getBlue()`

+ `getHue()`

+ `getSaturation()`

+ `getValue()`

+ `getHexString()`

+ `getRGB()`

  returns an array `[ r, g, b ]`

+ `getRGB( out )`

  sets the `out` array with `r, g, b`

+ `getHSV()`

  returns an array `[ h, s, v ]`

+ `getHSV( out )`

  sets the `out` array with `h, s, v`

## Bonus ##

Two infrastructure classes -- `IRIS.Element` and `IRIS.Node` can be use to implement graph data structures. Details are explained as comments in the source code.

## Demos hosted on Codepen ##

- [iris - chained reaction - 1D](https://codepen.io/sydneyzh/pen/jwQGMg)

- [iris - chained reaction - 2D](https://codepen.io/sydneyzh/pen/awQRVJ)

- [iris - chained reaction - 2D Animation](https://codepen.io/sydneyzh/pen/Ogadxr)
