/*globals window, document*/

// https://stackoverflow.com/questions/15734049/invert-rotation-of-parent-in-the-child-so-the-child-appears-unrotated-in-the-wo

import {Mesh, MeshBasicMaterial, DoubleSide, FlatShading, Vector2, CylinderGeometry, Raycaster, Vector3} from 'three'
import MainLoop from 'mainloop'
import recast from 'recast'

import {maxAgents} from './config'
import {Game} from './core/game'
import {loadObj} from './core/load'
import StatsPlugin from './plugin/stats'
import {Light as LightPlugin} from './plugin/light'
import {Navigation as NavigationPlugin} from './plugin/navigation'

let game
let agents = new Map()

let hidables = []
let hiddenObjects = []

LightPlugin(Game)
NavigationPlugin(Game)

const heightRaycaster = new Raycaster()
const downDirection = new Vector3(0, -1, 0).normalize()

window.onload = async function() {
    game = new Game(document.body)

    if (__DEV__) {
        game.registerPlugin(new StatsPlugin())
    }

    await game.load()
    
    const tree = await loadObj('assets/tree')
    
    for (let treeMesh of tree.children) {
        hidables.push(treeMesh.uuid)
    }
    
    game.scene.add(tree)
    
    let agent = null
    for (let i = 0; i < maxAgents; ++i) {
        const {id: agentId, agent: navmeshAgent} = game.addNavmeshAgent()
        
        agents.set(agentId, navmeshAgent)
        
        agent = navmeshAgent
    }
    
    game.addAmbientLight(0x404040)
    const directionalLight = game.addDirectionalLight(0xffffff, 0.5, true, agent.position.clone().add(new Vector3(0, 10, 10)), agent)
    
    recast.vent.on('update', recastAgents => {
        for (let recastAgent of recastAgents) {
            let agent = agents.get(recastAgent.idx)
            
            let angle = Math.atan2(-recastAgent.velocity.z, recastAgent.velocity.x)
            
            if (Math.abs(agent.rotation.y - angle) > 0) {
                agent.rotation.y = angle
            }
            
            heightRaycaster.set(new Vector3(recastAgent.position.x, recastAgent.position.y+10, recastAgent.position.z), downDirection)
            
            const [intersection] = heightRaycaster.intersectObject(game.terrain, true)
            
            if (intersection) {
                const {point} = intersection
                
                agent.position.set(recastAgent.position.x, point.y, recastAgent.position.z)
            } else {
                agent.position.set(recastAgent.position.x, recastAgent.position.y, recastAgent.position.z)
            }
        }
    })
    
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('keyup', onKeyUp)
    document.addEventListener('mouseup', onMouseUp, {passive: true})
    
    setInterval(() => {
        showNonBlockingObstacles()
    }, 100)
    
    const update = (delta) => {
        let posBefore = new Vector3(agent.position.x, agent.position.y, agent.position.z)
    	
    	recast.crowdUpdate(delta / 100)
    	recast.crowdGetActiveAgents()
    	
    	let posAfter = new Vector3(agent.position.x, agent.position.y, agent.position.z)
    	
    	let agentDelta = posAfter.sub(posBefore)
    	
    	game.controls.target = new Vector3(agent.position.x, agent.position.y + 2, agent.position.z)
        game.camera.position.x += agentDelta.x
        game.camera.position.y += agentDelta.y
        game.camera.position.z += agentDelta.z
    	
    	directionalLight.position.set(agent.position.x, agent.position.y+10, agent.position.z+10)
    	
     	hideBlockingObstacles(game.camera)
    }
    
    const render = (/*interpolationPercentage*/) => {
        game.render()
    }
    
    MainLoop.setUpdate(update).setDraw(render).start()
}

const raycaster = new Raycaster()
const mouse     = new Vector2()

const onMouseMove = e => {
    const rect = e.target.getBoundingClientRect()
    
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    mouse.x = (mouseX / window.innerWidth) * 2 - 1
 	mouse.y = -(mouseY / window.innerHeight) * 2 + 1
}

const onKeyUp = e => {
    e.preventDefault()
	e.stopPropagation()
	
	if (e.keyCode === 49) { // 1
	    addDynamicObstacleAtCurrentMousePosition()
	} else if (e.keyCode === 50) { // 2
	    removeDynamicObstacle()
	}
}

const onMouseUp = e => {
    if (e.which !== 1) { // left moues button
        return true
    }

    setAgentsTargetToCurrentMousePosition()

    return false
}

const getMouseIntersection = () => {
    game.camera.updateMatrixWorld()
	
	raycaster.setFromCamera(mouse, game.camera)
	
	const [intersection] = raycaster.intersectObject(game.terrain, true)
	
	return intersection
}

const getMouseIntersectionPoint = () => {
    game.camera.updateMatrixWorld()
	
	raycaster.setFromCamera(mouse, game.camera)
	
	const [intersection] = raycaster.intersectObject(game.terrain, true)
	
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
	
	for (let agentId of agents.keys()) {
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

const hideBlockingObstacles = camera => {
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

    hiddenObjects.push(object)
    
 	material.visible = false
}

const showNonBlockingObstacles = camera => {
    game.camera.updateMatrixWorld()
	
	raycaster.setFromCamera(new Vector2(), game.camera)
	
	const intersections = raycaster.intersectObjects(hiddenObjects, true)
	
	if (intersections.length === 0) {
	    for (const hiddenObject of hiddenObjects) {
	        hiddenObject.material.visible = true
	    }
	    
	    hiddenObjects = []
	    
	    return
	} 
	
	let i = hiddenObjects.length
	while (i--) {
	    const hiddenObject = hiddenObjects[i]
	    
	    const blocking = !!intersections.find(i => i.object.uuid === hiddenObject.uuid)
	    
	    if (blocking) {
	        continue
        }
        
        hiddenObject.material.visible = true
        hiddenObjects.splice(i, 1)
	}
}