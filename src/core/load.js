/*global window*/

import {OBJLoader, Mesh, DoubleSide} from 'three'
import MTLLoader from 'three-mtl-loader'
import recast from 'recast'
import {navmeshTypes} from '../config'

const mtlLoader = new MTLLoader()
// mtlLoader.setBaseUrl('/path/to/assets/');
const loader = new OBJLoader()

const loadObj = (name, receiveShadow = true, castShadow = false) => {
    return new Promise((resolve, reject) => {
        mtlLoader.load(`${name}.mtl`, materials => {
            loader.setMaterials(materials)
            loader.load(`${name}.obj`, object => {
                resolve(object)
            })
        })
    }).then(object => {
        object.traverse((child) => {
            if (child instanceof Mesh) {
                console.log(child)
                child.material.side = DoubleSide
                child.receiveShadow = receiveShadow
                child.castShadow    = castShadow
            }
        })
        
        return object
    }).catch(err => {
        console.error(err)
    })
}

const loadNavmesh = (type = navmeshTypes.tiled, name, useCache = false) => {
    const {localStorage} = window
    
    if (localStorage[name]) {
        return 
    }
    
    return new Promise((resolve, reject) => {
        if (useCache) {
            recast.loadTileCache(`${name}.bin`, recast.cb(() => {
                resolve()
            }))
        } else {
            recast.OBJLoader(`${name}.obj`, r => {
                if (type === navmeshTypes.solo) {
                    recast.buildSolo()
                } else if (navmeshTypes.tiled) {
                    recast.buildTiled()
                } else {
                    throw new Error('loadNavmesh: [type] must be either `solo` or `tiled')
                }
                
                resolve()
            })
        }
    }).then(() => {
        return true
    }).catch(err => {
        console.error(err)
    })
}

export {loadObj, loadNavmesh}