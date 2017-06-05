const agentRadius   = 0.5
const agentHeight   = 4.0
const cellSize      = agentRadius / 2
const cellHeight    = cellSize / 2
const agentMaxClimb = Math.ceil(agentHeight/2)
const agentMaxSlope = 30.0

const recastConfig = {
    agentRadius,
    agentHeight,
    cellSize,
    cellHeight,
    agentMaxClimb,
    agentMaxSlope
}

const maxAgents = 1

const levelConfig = {
    navMesh: 'assets/village.obj'
}

export {recastConfig, maxAgents, levelConfig}