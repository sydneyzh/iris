var _utils = {

	getType: function ( o ) {

		return Object.prototype.toString.call( o ).slice( 8, - 1 );

	},
	isObject: function ( o ) {

		return this.getType( o ) === 'Object';

	},
	checkNum: function ( num, min, max ) {

		if ( ( typeof num === 'number' ) && ( ! isNaN( num ) && ( num >= min ) && ( num <= max ) ) )

		     return true;

		else {

			console.error( 'Invalid value', num );
			return false;

		}

	},
	matchHexString: function () {

		var patt = /[0-9a-fA-F]{6}/;

		return function( str ) {

			var res = patt.exec( str );
			if ( res === null ) {

				console.error( 'Invalid hex string', str );
				return null;

			} else

				return res[ 0 ];

		};

	}(),
	num2HexString: function( num ) {

		var res = Math.round( num ).toString( 16 );
		if ( res.length === 1 ) res = '0' + res;
		return res;

	}

};

var _math = {

	generateUUID: function () {

		// http://www.broofa.com/Tools/Math.uuid.htm

		var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split( '' );
		var uuid = new Array( 36 );
		var rnd = 0, r;

		return function generateUUID() {

			for ( var i = 0; i < 36; i ++ ) {

				if ( i === 8 || i === 13 || i === 18 || i === 23 ) {

					uuid[ i ] = '-';

				} else if ( i === 14 ) {

					uuid[ i ] = '4';

				} else {

					if ( rnd <= 0x02 ) rnd = 0x2000000 + ( Math.random() * 0x1000000 ) | 0;
					r = rnd & 0xf;
					rnd = rnd >> 4;
					uuid[ i ] = chars[ ( i === 19 ) ? ( r & 0x3 ) | 0x8 : r ];

				}

			}

			return uuid.join( '' );

		};

	}()

};

var IRIS = IRIS || {};

IRIS.Node = function ( tag ) {

	this.isNode = true;

	this.tag = tag || ( console.error( 'Missing node tag.' ) );

	Object.defineProperty( this, 'els', {

		enumerable: true,
		value: {}

	} );

	Object.defineProperty( this, 'edges', {

		enumerable: true,
		value: {}

	} );

	var _stopElChangePropagation = false;
	Object.defineProperty( this, '_stopElChangePropagation', {

		enumerable: true,
		set: function ( stopPropagation ) {

			_stopElChangePropagation = stopPropagation;

		},
		get: function () {

			return _stopElChangePropagation;

		}

	} );

};
IRIS.Node.prototype = {

	constructor: IRIS.Node,
	addElement: function ( el ) {

		if ( ! el.isElement ) console.error( el, 'is not an Element.' );
		if ( this.els[ el.tag ] !== undefined ) console.error( el, 'tag already exists.' );
		this.els[ el.tag ] = el;

		// set this to el.node
		el._node = this;

		return this;

	},
	addEdge: function ( tag, callback ) {

		if ( typeof callback !== 'function' ) console.error( callback, 'is not a function.' );
		if ( this.edges[ tag ] !== undefined ) console.error( 'tag', tag, 'already exists.' );

		this.edges[ tag ] = callback;

		return this;

	},
	_syncElements: function ( updatedEl ) {

		// fail safe
		if ( this._stopElChangePropagation === true ) return;

		// this method iterate through the child elements except the updatedEl
		// to call their own update methods.
		// a reference of the updatedEl is passed as parameter

		// setting _stopElChangePropagation to be true to prevent loops
		this._stopElChangePropagation = true;

		for ( var key in this.els ) {

			if ( key !== updatedEl.tag && this.els[ key ].update !== undefined )

				this.els[ key ].update( updatedEl );

		}

		// trigger callbacks on the edges
		this._forward();

		// setting _stopElChangePropagation back to false
		this._stopElChangePropagation = false;

	},
	_forward: function () {

		// execute the callbacks
		// reference of this node is passed as parameter
		for ( var key in this.edges ) {

			this.edges[ key ]( this );

		}

	}

};

IRIS.Element = function ( tag, vals ) {

	this.isElement = true;

	this.tag = tag || ( console.error( 'Missing element tag.' ) );

	// an element can be attached to a parent node
	var _node;
	Object.defineProperty( this, '_node', {

		enumerable: true,
		set: function ( node ) {

			if ( ! node.isNode ) console.error( node, 'is not a Node.' );
			if ( _node !== undefined ) console.warn( 'Element', this.tag, 'node is overwritten.' );
			_node = node;

		},
		get: function () {

			return _node;

		}

	} );

	// an element can have an update method
	// this method specifies how to react on sibling element changes
	var _update;
	Object.defineProperty( this, 'update', {

		enumerable: true,
		set: function ( method ) {

			if ( this.update !== undefined )
				console.log( 'Element', this.tag, 'update method is overwritten.' );

			if ( method === undefined )
				_update = undefined;

			else if ( typeof method !== 'function' )
				console.error( method, 'is not a function.' );

			else _update = method;

		},
		get: function () {

			return _update;

		}

	} );

	var scope = this;
	function addVal( tag, val ) {

		if ( scope[ tag ] !== undefined ) console.error( 'Duplicated val tag:', tag );

		var _val = val;
		Object.defineProperty( scope, tag, {

			enumerable: true,
			set: function ( value ) {

				// when the element value is changed, it propagates to its parent node
				// unless the propagation is mutted
				_val = value;
				if ( scope._node !== undefined && scope._node._stopElChangePropagation === false )
					scope._node._syncElements( scope );

			},
			get: function () {

				return _val;

			}
		} );

	}

	// add vals
	if ( _utils.isObject( vals ) ) {

		// add multiple properties
		for ( var key in vals ) {

			addVal( key, vals[ key ] );

		}

	} else {

		// add a property 'val'
		addVal( 'val', vals );

	}

};

// color conversion functions
// https://www.cs.rit.edu/~ncs/color/t_convert.html

IRIS.RGBElement = function ( tag, r, g, b ) {

	IRIS.Element.call( this, tag, { r: r, g: g, b: b } );
	this.update = this._rgbUpdate;

};

Object.assign( IRIS.RGBElement.prototype, IRIS.Element.prototype, {

	// rgb 0~255
	// h 0~360, sv 0~100
	// hexString 000000~ffffff
	_rgbUpdate: function( updatedEl ) {

		if ( updatedEl.tag.endsWith( 'hsv' ) ) {

			// hsv to rgb

			var h = updatedEl.h;
			var s = updatedEl.s / 100;
			var v = updatedEl.v / 100;
			var i, f, p, q, t;

			if ( s === 0 ) {

				v *= 255;
				this.r = v;
				this.g = v;
				this.b = v;
				return;

			}

			h /= 60;
			i = Math.floor( h );
			f = h - i;
			p = v * ( 1 - s );
			q = v * ( 1 - s * f );
			t = v * ( 1 - s * ( 1 - f ) );

			switch ( i ) {

			case 0:
				this.r = v;
				this.g = t;
				this.b = p;
				break;

			case 1:
				this.r = q;
				this.g = v;
				this.b = p;
				break;

			case 2:
				this.r = p;
				this.g = v;
				this.b = t;
				break;

			case 3:
				this.r = p;
				this.g = q;
				this.b = v;
				break;

			case 4:
				this.r = t;
				this.g = p;
				this.b = v;
				break;

			default:
				this.r = v;
				this.g = p;
				this.b = q;
				break;

			}

			this.r *= 255;
			this.g *= 255;
			this.b *= 255;

			// trigger hexUpdate
			// pass rgb as updatedEl
			var hexEl = this._node._hexString;
			hexEl.update( this );

		} else if ( updatedEl.tag.endsWith( 'hex' ) ) {

			// hexString to rgb
			this.r = parseInt( updatedEl.val.substr( 0, 2 ), 16 );
			this.g = parseInt( updatedEl.val.substr( 2, 2 ), 16 );
			this.b = parseInt( updatedEl.val.substr( 4, 2 ), 16 );

			// trigger hsvUpdate
			// pass rgb as updatedEl
			var hsvEl = this._node._hsv;
			hsvEl.update( this );

		}

	}

} );

IRIS.HSVElement = function ( tag, h, s, v ) {

	IRIS.Element.call( this, tag, { h: h, s: s, v: v } );
	this.update = this._hsvUpdate;

};

Object.assign( IRIS.HSVElement.prototype, IRIS.Element.prototype, {

	_hsvUpdate: function ( updatedEl ) {

		if ( updatedEl.tag.endsWith( 'rgb' ) ) {

			// rgb to hsv
			var r = updatedEl.r / 255;
			var g = updatedEl.g / 255;
			var b = updatedEl.b / 255;

			var min, max, delta;

			min = Math.min( r, g, b );
			max = Math.max( r, g, b );
			this.v = 100 * max;

			delta = max - min;

			if ( max !== 0 )
				this.s = 100 * delta / max;
			else {

				this.s = 0;
				this.h = 0;
				return;

			}

			if ( r === max )
				this.h = ( g - b ) / delta;
			else if ( g === max )
				this.h = 2 + ( b - r ) / delta;
			else
				this.h = 4 + ( r - g ) / delta;

			this.h *= 60;
			if ( this.h < 0 )
				this.h += 360;

		}

	}

} );

IRIS.HexStringElement = function ( tag, val ) {

	IRIS.Element.call( this, tag, val );
	this.update = this._hexStringUpdate;

};

Object.assign( IRIS.HexStringElement.prototype, IRIS.Element.prototype, {

	_hexStringUpdate: function ( updatedEl ) {

		if ( updatedEl.tag.endsWith( 'rgb' ) ) {

			// rgb to hexString
			this.val =
				_utils.num2HexString( updatedEl.r ) +
				_utils.num2HexString( updatedEl.g ) +
				_utils.num2HexString( updatedEl.b );

		}

	}

} );

IRIS.Color = function () {

	this._uuid = _math.generateUUID();
	IRIS.Node.call( this, this._uuid );

	this._rgb = new IRIS.RGBElement( this._uuid + '-rgb', 0, 0, 0 );
	this._hsv = new IRIS.HSVElement( this._uuid + '-hsv', 0, 0, 0 );
	this._hexString = new IRIS.HexStringElement( this._uuid + '-hex', '000000' );
	this.addElement( this._rgb ).addElement( this._hsv ).addElement( this._hexString );

	if ( arguments.length > 0 ) this.set.apply( this, arguments );

};

Object.assign( IRIS.Color.prototype, IRIS.Node.prototype, {

	setRed: function ( val ) {

		_utils.checkNum( val, 0, 255 );
		this._rgb.r = val;
		return this;

	},
	setGreen: function ( val ) {

		_utils.checkNum( val, 0, 255 );
		this._rgb.g = val;
		return this;

	},
	setBlue: function ( val ) {

		_utils.checkNum( val, 0, 255 );
		this._rgb.b = val;
		return this;

	},
	setHue: function ( val ) {

		_utils.checkNum( val, 0, 360 );
		this._hsv.h = val;
		return this;

	},
	setSaturation: function ( val ) {

		_utils.checkNum( val, 0, 100 );
		this._hsv.s = val;
		return this;

	},
	setValue: function ( val ) {

		_utils.checkNum( val, 0, 360 );
		this._hsv.v = val;
		return this;

	},
	setHexString: function ( val ) {

		val = _utils.matchHexString( val );
		this._hexString.val = val;
		return this;

	},
	setRGB: function ( r, g, b ) {

		_utils.checkNum( r, 0, 255 );
		_utils.checkNum( g, 0, 255 );
		_utils.checkNum( b, 0, 255 );
		this._stopElChangePropagation = true;
		this._rgb.r = r;
		this._rgb.g = g;
		this._stopElChangePropagation = false;
		this._rgb.b = b;
		return this;

	},
	setHSV: function ( h, s, v ) {

		_utils.checkNum( h, 0, 360 );
		_utils.checkNum( s, 0, 100 );
		_utils.checkNum( v, 0, 100 );
		this._stopElChangePropagation = true;
		this._hsv.h = h;
		this._hsv.s = s;
		this._stopElChangePropagation = false;
		this._hsv.v = v;
		return this;

	},
	set: function( type, x, y, z ) {

		if ( arguments.length === 1 || arguments[ 1 ] === undefined ) {

			x = type;
			type = 'hexString';

		}

		switch ( type ) {

		case 'red':
		case 'r':
			return this.setRed( x );

		case 'green':
		case 'g':
			return this.setGreen( x );

		case 'blue':
		case 'b':
			return this.setBlue( x );

		case 'hue':
		case 'h':
			return this.setHue( x );

		case 'saturation':
		case 's':
			return this.setSaturation( x );

		case 'value':
		case 'v':
			return this.setValue( x );

		case 'hexString':
			return this.setHexString( x );

		case 'rgb':
			return this.setRGB( x, y, z );

		case 'hsv':
			return this.setHSV( x, y, z );

		default:
			console.error( 'Cannot recognize type', type );
			return null;

		}

	},
	getRed: function () {

		return this._rgb.r;

	},
	getGreen: function () {

		return this._rgb.g;

	},
	getBlue: function () {

		return this._rgb.b;

	},
	getHue: function () {

		return this._hsv.h;

	},
	getSaturation: function () {

		return this._hsv.s;

	},
	getValue: function () {

		return this._hsv.v;

	},
	getHexString: function () {

		return this._hexString.val;

	},
	getRGB: function ( out ) {

		if ( ! Array.isArray( out ) ) out = [];

		out[ 0 ] = this._rgb.r;
		out[ 1 ] = this._rgb.g;
		out[ 2 ] = this._rgb.b;
		return out;

	},
	getHSV: function ( out ) {

		if ( ! Array.isArray( out ) ) out = [];

		out[ 0 ] = this._hsv.h;
		out[ 1 ] = this._hsv.s;
		out[ 2 ] = this._hsv.v;
		return out;

	}

} );

// UMD
( function ( root ) {

	if ( typeof define === 'function' && define.amd ) {

		// AMD
		define( [], function () {

			return IRIS;

		} );

	} else if ( typeof module !== 'undefined' && typeof exports === 'object' ) {

		// Node.js
		module.exports = IRIS;

	} else if ( root !== undefined ) {

		// Global variable
		root.IRIS = IRIS;

	}

} )( this );
