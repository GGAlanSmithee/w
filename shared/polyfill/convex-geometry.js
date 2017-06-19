/**
 * @author Mugen87 / https://github.com/Mugen87
 */

const polyfillConvextGeometry = three => {

	// ConvexGeometry

	function ConvexGeometry( points ) {

		three.Geometry.call( this )

		this.type = 'ConvexGeometry'

		this.fromBufferGeometry( new ConvexBufferGeometry( points ) )
		this.mergeVertices()

	}

	ConvexGeometry.prototype = Object.create( three.Geometry.prototype )
	ConvexGeometry.prototype.constructor = ConvexGeometry

	// ConvexBufferGeometry

	function ConvexBufferGeometry( points ) {

	  three.BufferGeometry.call( this )

		this.type = 'ConvexBufferGeometry'

	  // buffers

	  var vertices = []
	  var normals = []

	  // execute QuickHull

		if ( three.QuickHull === undefined ) {

			console.error( 'three.ConvexBufferGeometry: ConvexBufferGeometry relies on three.QuickHull' )

		}

	  var quickHull = new three.QuickHull().setFromPoints( points )

	  // generate vertices and normals

	  var faces = quickHull.faces

	  for ( var i = 0; i < faces.length; i ++ ) {

	    var face = faces[ i ]
	    var edge = face.edge

	    // we move along a doubly-connected edge list to access all face points (see HalfEdge docs)

	    do {

	      var point = edge.head().point

	      vertices.push( point.x, point.y, point.z )
	      normals.push( face.normal.x, face.normal.y, face.normal.z )

	      edge = edge.next

	    } while ( edge !== face.edge )

	  }

	  // build geometry

	  this.addAttribute( 'position', new three.Float32BufferAttribute( vertices, 3 ) )
	  this.addAttribute( 'normal', new three.Float32BufferAttribute( normals, 3 ) )

	}

	ConvexBufferGeometry.prototype = Object.create( three.BufferGeometry.prototype )
	ConvexBufferGeometry.prototype.constructor = ConvexBufferGeometry

	// export

	three.ConvexGeometry = ConvexGeometry
	three.ConvexBufferGeometry = ConvexBufferGeometry

}

export default polyfillConvextGeometry