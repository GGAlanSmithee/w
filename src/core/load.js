import {OBJLoader, Mesh, DoubleSide} from 'three'
import recast from 'recast'

const loader = new OBJLoader()

const loadObj = (name) => {
    return new Promise((resolve, reject) => {
        loader.load(name, (object) => {
            resolve(object)
        })
    }).then(object => {
        object.traverse((child) => {
            if (child instanceof Mesh) {
                child.material.side = DoubleSide
            }
        })
        
        return object
    }).catch(err => {
        console.error(err)
    })
}

const loadNavmesh = (name) => {
    return new Promise((resolve, reject) => {
        recast.OBJLoader(name, () => {
            // recast.buildTiled()
            recast.buildSolo()
            
            resolve()
        })
    }).then(() => {
        return true
    }).catch(err => {
        console.error(err)
    })
}

export {loadObj, loadNavmesh}