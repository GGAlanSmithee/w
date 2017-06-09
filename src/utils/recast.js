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

    // how to break the vertices up..?
    var geometry = new ConvexGeometry(vertices.map(v => new Vector3(v.x, v.y, v.z)))

    var child = SceneUtils.createMultiMaterialObject(geometry, materials)
    parent.add(child)
    
    return parent
}

export {createMeshFromVertices}