/*globals window, document*/

// https://stackoverflow.com/questions/15734049/invert-rotation-of-parent-in-the-child-so-the-child-appears-unrotated-in-the-wo

import {Mesh, MeshBasicMaterial, DoubleSide, FlatShading, AmbientLight, DirectionalLight, Vector2, CylinderGeometry, Object3D, Raycaster, Vector3} from 'three'
import recast from 'recast'
import Stats from 'stats.js'

import {recastConfig, maxAgents} from './config'
import {Game} from './core/game'
import {loadObj} from './core/load'
import {Recast as RecastPlugin} from './plugin/recast'

RecastPlugin(Game)

let game
let agentBodies = new Map()
let hidables = []

window.onload = async function() {
    const stats = new Stats()
    stats.showPanel(1) // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom)
    
    game = new Game(document.body)

    game.recast.init()
    
    await game.load()
    
    const tree = await loadObj('assets/tree.obj')
    
    for (let treeMesh of tree.children) {
        hidables.push(treeMesh.uuid)
    }
    
    console.log(tree)
    
    game.scene.add(tree)
    
    const light = new AmbientLight(0x404040)
    game.scene.add(light)
    
    const directionalLight = new DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(0, 1, 0)
    game.scene.add(directionalLight)

    const cameraTarget = new Object3D()
    game.scene.add(cameraTarget)
    
    const {agentRadius, agentHeight} = recastConfig
    
    let agent = null
    let agentBody = null
    for (let i = 0; i < maxAgents; ++i) {
        var agentId = recast.addAgent({
                          position: {
                              x: -25,
                              y: -1,
                              z: -5
                          },
                          radius: agentRadius,
                          height: agentHeight,
                          maxAcceleration: 0.5,
                          maxSpeed: 1.0,
                          updateFlags: 0,// recast.CROWD_OBSTACLE_AVOIDANCE & recast.CROWD_ANTICIPATE_TURNS & recast.CROWD_OPTIMIZE_TOPO & recast.CROWD_SEPARATION,
                          separationWeight: 20.0
                      })
    
        let agentGeometry = new CylinderGeometry(agentRadius, agentRadius, agentHeight, 16)
        agentBody = new Mesh(agentGeometry, new MeshBasicMaterial({ color: '#FF0000' }))
        agentBody.position.y = agentHeight/2
        
        agent = new Object3D()
        agent.add(agentBody)
        
        agentBodies.set(agentId, agent)
        game.scene.add(agent)
    }
    
    recast.vent.on('update', function (agents) {
        for (let agent of agents) {
            let agentBody = agentBodies.get(agent.idx)
            
            let angle = Math.atan2(-agent.velocity.z, agent.velocity.x)
            
            if (Math.abs(agentBody.rotation.y - angle) > 0) {
                agentBody.rotation.y = angle
            }
            
            agentBody.position.set(agent.position.x, agent.position.y, agent.position.z)
        }
    })
    
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('keyup', onKeyUp)
    document.addEventListener('mouseup', e => {
        if (e.which !== 1) { // left moues button
            return true
        }
        
        e.preventDefault()

        setAgentsTargetToCurrentMousePosition()

        return false
    }, false)
    
    let delta
    let oldTime
    let newTime
    
    (function loop() {
    	window.requestAnimationFrame(loop)
    	
    	newTime = Date.now()
    	
    	delta = newTime - oldTime
    	if (delta > 17) {
    	    delta = 17
    	}
    	
    	oldTime = newTime
    	
    	stats.begin()

    	game.render()
    	
    	let posBefore = new Vector3(agent.position.x, agent.position.y, agent.position.z)
    	
    	recast.crowdUpdate(delta / 100)
    	recast.crowdGetActiveAgents()
    	
    	let posAfter = new Vector3(agent.position.x, agent.position.y, agent.position.z)
    	
    	let agentDelta = posAfter.sub(posBefore)
    	
    	game.controls.target = new Vector3(agent.position.x, agent.position.y + 2, agent.position.z)
        game.camera.position.x += agentDelta.x
        game.camera.position.y += agentDelta.y
        game.camera.position.z += agentDelta.z
    	
     	hideBlockingObstacles(game.camera)
    	
    	stats.end()
    })()
}

const raycaster = new Raycaster()
const mouse = new Vector2()

function onMouseMove(e) {
    const rect = e.target.getBoundingClientRect()
    
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    mouse.x = (mouseX / window.innerWidth) * 2 - 1
 	mouse.y = -(mouseY / window.innerHeight) * 2 + 1
}

function onKeyUp(e) {
    e.preventDefault()
	e.stopPropagation()
	
	if (e.keyCode === 49) { // 1
	   // setAgentsTargetToCurrentMousePosition()
	} else if (e.keyCode === 50) { // 2
	    addDynamicObstacleAtCurrentMousePosition()
	} else if (e.keyCode === 51) { // 3
	    removeDynamicObstacle()
	} else if (e.keyCode === 52) { // 4
	   addZone()
 	}
}

const getMouseIntersection = () => {
    game.camera.updateMatrixWorld()
	
	raycaster.setFromCamera(mouse, game.camera)
	
	const [intersection] = raycaster.intersectObject(game.scene, true)
	
	return intersection
}

const getMouseIntersectionPoint = () => {
    game.camera.updateMatrixWorld()
	
	raycaster.setFromCamera(mouse, game.camera)
	
	const [intersection] = raycaster.intersectObject(game.scene, true)
	
	if (intersection === undefined) {
	    return null
	}
	
    return intersection.point
}

function setAgentsTargetToCurrentMousePosition() {
	const point = getMouseIntersectionPoint()
	
	console.log(point)
	
	if (point === null) {
	    return
	}
	
	for (let agentId of agentBodies.keys()) {
	    recast.crowdRequestMoveTarget(agentId, point.x, point.y, point.z)
	}
}

function addDynamicObstacleAtCurrentMousePosition() {
    const point = getMouseIntersectionPoint()
	
	if (point === null) {
	    return
	}
	
	var radius = 1 + Math.random() * 5
	
    var obstacleMesh = new Mesh(new CylinderGeometry(radius, radius, 2),
                                new MeshBasicMaterial({
                                    color: 0xff0000,
                                    shading: FlatShading,
                                    side: DoubleSide,
                                    transparent: true,
                                    opacity: 0.8,
                                    overdraw: true
                                }))

    obstacleMesh.position.set(point.x, point.y, point.z)
    game.scene.add(obstacleMesh)
    
    recast.addTempObstacle(point.x, point.y, point.z, radius)
}

function removeDynamicObstacle() {
    const intersection = getMouseIntersection()
	
	if (intersection === undefined) {
	    return
	}
	
	const point = intersection.point
	
	if (point === null) {
	    return
	}
	
    recast.removeTempObstacle(point.x, point.y, point.z, 0, 0, 0)
    game.scene.remove(intersection.object)
}

function hideBlockingObstacles(camera) {
    game.camera.updateMatrixWorld()
	
	raycaster.setFromCamera(new Vector2(), game.camera)
	
	const [intersection] = raycaster.intersectObject(game.scene, true)
	
	if (intersection === null) {
	    return
	}
	
 	const {object} = intersection
	const {material, uuid} = object
	
	if (!material.visible) {
	    return
	}
	
 	if (hidables.find(h => h == uuid) == null)  {
 	    return
 	}

 	material.visible = false
}

function addZone() {
    const intersection = getMouseIntersection()
	
	if (intersection === undefined) {
	    return
	}
	
	const geometry = intersection.object.geometry
	const point = intersection.point
	
 	console.log(geometry)
	
	recast.setPolyFlags(point.x, point.y, point.z, 1, 1, 1, recast.FLAG_DISABLED)
	
// 	recast.queryPolygons(point.x, point.y, point.z, 1, 1, 1,
//                          1,
//                          recast.cb(polygons => {
//                              console.log(polygons)
//                             //  for (const polygon of polygons) {
//                             //      console.log(polygon)
//                             //  }
//                             //  for (var i = 0; i < polygons.length; i++) {
//                                  // removing
//                                  // if ( event.ctrlKey ) {

//                                  //     editor.currentZone.removePolygon( polygons[i] );

//                                  // // adding
//                                  // } else if ( event.shiftKey ) {

//                                  //     editor.currentZone.addPolygon( polygons[i] );
//                                  // }
//                             //  }
//                          }))
}