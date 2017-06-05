import {Object3D, Vector3, Face3, Mesh, SceneUtils, ShapeUtils, ConvexGeometry, Geometry, MeshBasicMaterial, FlatShading, DoubleSide} from 'three'

const dummyMaterial = new MeshBasicMaterial({
    color: 0x00FF00,
    shading: FlatShading,
    side: DoubleSide,
    transparent: true,
    opacity: 0.1,
    overdraw: true
})

const createMeshFromVertices = vertices => {
    var parent = new Object3D()

    var materials = [ dummyMaterial ]

    // for (var i = 0; i < vertices.length; ++i) {
    //     if (!vertices[i+6]) { break }

        var geometry = new ConvexGeometry(vertices.map(v => new Vector3(v.x, v.y, v.z)))
        //     [
        //     new Vector3(   vertices[i].x,   vertices[i].y,   vertices[i].z ), 
        //     new Vector3( vertices[i+1].x, vertices[i+1].y, vertices[i+1].z ),
        //     new Vector3( vertices[i+2].x, vertices[i+2].y, vertices[i+2].z ),
        //     new Vector3( vertices[i+3].x, vertices[i+3].y, vertices[i+3].z ),
        //     new Vector3( vertices[i+4].x, vertices[i+4].y, vertices[i+4].z ),
        //     new Vector3( vertices[i+5].x, vertices[i+5].y, vertices[i+5].z ),
        //     new Vector3( vertices[i+6].x, vertices[i+6].y, vertices[i+6].z )
        // ])

        var child = SceneUtils.createMultiMaterialObject(geometry, materials)
        parent.add(child)

    //     i += 6
    // }
    
    return parent
}

export {createMeshFromVertices}