/*global window*/

import {WebGLRenderer, Scene, PerspectiveCamera, Vector3, MOUSE} from 'three'
import OrbitControls from 'orbit-controls-es6'
import recast from 'recast'

import {recastConfig, levelConfig} from '../config'
import {loadObj, loadNavmesh} from './load'
import {createMeshFromVertices}from './recast'

class Game {
    constructor(target) {
        this.target = target
        this.scene = null
        this.renderer = null
        this.camera = null
    }
    
    async load() {
        if (this.target === null) {
            throw 'Please set the game.target before initializing the game.'
        }
        
        this.renderer = new WebGLRenderer({antialias: true})
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.target.appendChild(this.renderer.domElement)
        
        recast.settings(recastConfig)
    
        recast.setGLContext(this.renderer.context)
    
        this.scene = new Scene()
        
        const [object] = await Promise.all([loadObj(levelConfig.navMesh), loadNavmesh(levelConfig.navMesh)])
        this.scene.add(object)
    
        recast.initCrowd(1000, 1.0)
        
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        this.camera.position.y = 25
        this.camera.lookAt(new Vector3(0, 0, 0))
        
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        
        this.controls.mouseButtons = {
            ORBIT: MOUSE.RIGHT,
            ZOOM: MOUSE.MIDDLE,
            PAN: MOUSE.LEFT
        }
        
        this.controls.update()
        
        this.controls.enabled = true
        this.controls.enablePan = false
        this.controls.enableKeys = false
        this.controls.maxDistance = 25
        this.controls.minDistance = 5
        
        // recast.getNavMeshVertices(recast.cb(vertices => {
        //     const navigationMesh = createMeshFromVertices( vertices, true )
        //     navigationMesh.name = 'NavigationMesh'
            
        //     console.log(vertices)
            
        //     this.scene.add(navigationMesh)

        //     // update();
        // }))
    }
    
    render() {
        this.renderer.render(this.scene, this.camera)
    }
}

export {Game}