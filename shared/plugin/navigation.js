import recast from 'recast'
import {CylinderGeometry, MeshBasicMaterial, Mesh, Object3D} from 'three'
import {recastConfig} from '../../config'

const {agentRadius, agentHeight} = recastConfig

export const Navigation = (Game) => {
    Game.prototype.addNavmeshAgent = function(color) {
        var id = recast.addAgent({
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
    
        const agentGeometry = new CylinderGeometry(agentRadius, agentRadius, agentHeight, 16)
        const agentBody = new Mesh(agentGeometry, new MeshBasicMaterial({ color: '#FF0000' }))
        agentBody.position.y = agentHeight/2
        agentBody.castShadow = true
        agentBody.receiveShadow = false
        
        const agent = new Object3D()
        agent.add(agentBody)
        
        this.scene.add(agent)
        
        return {id, agent}
    }
}