var assert = require( 'assert' );
var IRIS = require( './../src/iris.js' );

function hexStringAlmostEqual( str1, str2 ) {

	var r1 = parseInt( str1.substr( 0, 2 ), 16 );
	var g1 = parseInt( str1.substr( 2, 2 ), 16 );
	var b1 = parseInt( str1.substr( 4, 2 ), 16 );
	var r2 = parseInt( str2.substr( 0, 2 ), 16 );
	var g2 = parseInt( str2.substr( 2, 2 ), 16 );
	var b2 = parseInt( str2.substr( 4, 2 ), 16 );
	return Math.abs( r1 - r2 ) <= 4 &&
		Math.abs( g1 - g2 ) <= 4 &&
		Math.abs( b1 - b2 ) <= 4;

}

describe( 'hello:', function () {

	it( 'creates IRIS', function () {

		assert.equal( typeof IRIS === 'object', true );

	} );

} );

describe( 'IRIS.Node:', function () {

	var node = new IRIS.Node( 'node' );
	it( 'create Node object', function () {

		assert.ok( node.isNode );

	} );

} );

describe( 'IRIS.Element:', function () {

	var el = new IRIS.Element( 'el' );
	it( 'create Element object', function () {

		assert.ok( el.isElement );

	} );

} );

describe( 'IRIS.Element vals:', function () {

	var el_1 = new IRIS.Element( 'a' );
	var el_2 = new IRIS.Element( 'b', 0 );
	var el_3 = new IRIS.Element( 'c', {

		'val_x': 1,
		'val_y': 2

	} );

	it( 'element has a default value tagged "val"', function () {

		assert.equal( el_1.val, undefined );

	} );

	it( 'a single val can be passed to the constructor', function () {

		assert.equal( el_2.val, 0 );

	} );

	it( 'element can have multiple value properties', function() {

		assert.equal( el_3.val_x, 1 );
		assert.equal( el_3.val_y, 2 );

	} );

} );

describe( 'IRIS.Node and Element interactions:', function () {

	var node_a = new IRIS.Node( 'node_a' );
	var node_b = new IRIS.Node( 'node_b' );
	var el_a_1 = new IRIS.Element( 'a_1', 0 );
	var el_a_2 = new IRIS.Element( 'a_2', 0 );
	var el_b_1 = new IRIS.Element( 'b_1', 0 );
	var el_b_2 = new IRIS.Element( 'b_2', {

		val_x: 0,
		val_y: 0

	} );

	// addElement

	node_a.addElement( el_a_1 );
	node_a.addElement( el_a_2 );
	node_b.addElement( el_b_1 );
	node_b.addElement( el_b_2 );

	it( '#addElement', function () {

		assert.equal( Object.keys( node_a.els ).length, 2 );

	} );

	// add element update method

	var el_a_2_update_counter = 0;
	el_a_2.update = function ( updatedEl ) {

		el_a_2_update_counter ++;

		if ( updatedEl.tag === 'a_1' )
			this.val = updatedEl.val;

	}.bind( el_a_2 );

	var el_b_2_update_counter = 0;
	el_b_2.update = function( updatedEl ) {

		el_b_2_update_counter ++;

		if ( updatedEl.tag === 'b_1' ) {

			this.val_x = updatedEl.val;
			this.val_y = updatedEl.val;

		}

	}.bind( el_b_2 );

	// addOutEdge

	node_a.addOutEdge( 'sync_b', function ( node ) {

		// parameter node is the triggering node
		// this is bound to node_b
		if ( node.tag === 'node_a' )
			this.els[ 'b_1' ].val = node.els[ 'a_1' ].val;
		// this will trigger b_2 val change

	}.bind( node_b ) );

	it( '#addOutEdge', function () {

		assert.equal( Object.keys( node_a.outEdges ).length, 1 );

	} );

	// setting el val will trigger other els update, and outEdge callback

	var new_el_a_1_value = 5;
	node_a.els[ 'a_1' ].val = new_el_a_1_value;
	it( 'element val is modified', function () {

		assert.equal( el_a_1.val, new_el_a_1_value );

	} );
	it( 'sibling element is updated', function () {

		assert.equal( el_a_2.val, new_el_a_1_value );

	} );
	it( 'outEdge callback is executed', function () {

		assert.equal( el_b_1.val, new_el_a_1_value );

	} );
	it( 'value change in outEdge callback triggers the other element sibling updates', function() {

		assert.equal( el_b_2.val_x, new_el_a_1_value );
		assert.equal( el_b_2.val_y, new_el_a_1_value );

	} );
	it( 'check update counters', function () {

		assert.equal( el_a_2_update_counter, 1 );
		assert.equal( el_b_2_update_counter, 1 );

	} );

} );

describe( 'IRIS.Color', function () {

	describe( '#constructor and color conversion', function () {

		describe( 'init with hex string', function () {

			var c = new IRIS.Color( '3548c8' );

			it( 'got hexString', function () {

				assert.equal( c._hexString.val, '3548c8' );

			} );

			it( 'got rgb', function () {

				assert.equal( c._rgb.r, 53 );
				assert.equal( c._rgb.g, 72 );
				assert.equal( c._rgb.b, 200 );

			} );

			it( 'got hsv', function () {

				assert.ok( Math.abs( c._hsv.h - 233 ) <= 1 );
				assert.ok( Math.abs( c._hsv.s - 74 ) <= 1 );
				assert.ok( Math.abs( c._hsv.v - 78 ) <= 1 );

			} );

		} );

		describe( 'init with rgb', function () {

			var c = new IRIS.Color( 'rgb', 53, 72, 200 );

			it( 'got hexString', function () {

				assert.equal( c._hexString.val, '3548c8' );

			} );

			it( 'got rgb', function () {

				assert.equal( c._rgb.r, 53 );
				assert.equal( c._rgb.g, 72 );
				assert.equal( c._rgb.b, 200 );

			} );

			it( 'got hsv', function () {

				assert.ok( Math.abs( c._hsv.h - 233 ) <= 1 );
				assert.ok( Math.abs( c._hsv.s - 74 ) <= 1 );
				assert.ok( Math.abs( c._hsv.v - 78 ) <= 1 );

			} );

		} );

		describe( 'init with hsv', function () {

			var c = new IRIS.Color( 'hsv', 233, 74, 78 );

			it( 'got hexString', function () {

				assert.ok( hexStringAlmostEqual( c._hexString.val, '3548c8' ) );

			} );

			it( 'got rgb', function () {

				assert.ok( Math.abs( c._rgb.r - 53 ) <= 4 );
				assert.ok( Math.abs( c._rgb.g - 72 ) <= 4 );
				assert.ok( Math.abs( c._rgb.b - 200 ) <= 4 );

			} );

			it( 'got hsv', function () {

				assert.equal( c._hsv.h, 233 );
				assert.equal( c._hsv.s, 74 );
				assert.equal( c._hsv.v, 78 );

			} );


		} );

	} );

	describe( 'setters and getters', function () {

		var c = new IRIS.Color();

		it( '#set and get red', function () {

			c.setRed( 53 );
			assert.equal( 53, c.getRed() );

		} );
		it( '#set and get green', function () {

			c.setGreen( 72 );
			assert.equal( 72, c.getGreen() );

		} );
		it( '#set and get blue', function () {

			c.setBlue( 200 );
			assert.equal( 200, c.getBlue() );

		} );
		it( '#set and get RGB', function () {

			c.setRGB( 1, 2, 3 );
			var out = [];
			c.getRGB( out );
			assert.equal( 1, out[ 0 ] );
			assert.equal( 2, out[ 1 ] );
			assert.equal( 3, out[ 2 ] );

		} );
		it( '#set and get hue', function () {

			c.setHue( 233 );
			assert.equal( c.getHue(), 233 );

		} );
		it( '#set and get saturation', function () {

			c.setSaturation( 74 );
			assert.equal( c.getSaturation(), 74 );

		} );
		it( '#get and get value', function () {

			c.setValue( 78 );
			assert.equal( c.getValue(), 78 );

		} );
		it( '#get and get HSV', function () {

			c.setHSV( 1, 2, 3 );
			var out = [];
			c.getHSV( out );
			assert.ok( out[ 0 ], 233 );
			assert.ok( out[ 1 ], 74 );
			assert.ok( out[ 2 ], 3 );

		} );
		it( '#get and get hexString', function () {

			c.setHexString( '123abc' );
			assert.equal( '123abc', c.getHexString() );

		} );

	} );

} );
