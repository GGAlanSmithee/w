// http://digestingduck.blogspot.se/2009/08/recast-settings-uncovered.html
const agentRadius     = 0.5                       // agent capsule  radius
const agentHeight     = 4.0                       // agent capsule  height
const cellSize        = agentRadius / 2           // voxelization cell size
const cellHeight      = cellSize / 2              // voxelization cell height
const agentMaxClimb   = Math.ceil(agentHeight/2)  // how high steps agents can climb, in voxels
const agentMaxSlope   = 40.0                      // maximum slope angle, in degrees
const regionMinSize   = 8.0                       // minimum isolated region size that is still kept
const regionMergeSize = 20.0                      // how large regions can be merged
const edgeMaxLen      = 12.0                      // maximum edge length, in voxels
const edgeMaxError    = 1.3                       // how loosely the simplification is done

// const cellSize        =  0.3
// const cellHeight      =  0.2 
// const agentHeight     =  2.0 
// const agentRadius     =  0.4
// const agentMaxClimb   =  0.9 
// const agentMaxSlope   = 30.0
// const regionMinSize   =  8.0
// const regionMergeSize = 20.0
// const edgeMaxLen      = 12.0
// const edgeMaxError    =  1.3 
    
const recastConfig = {
    agentRadius,
    agentHeight,
    cellSize,
    cellHeight,
    agentMaxClimb,
    agentMaxSlope,
    regionMinSize,
    regionMergeSize,
    edgeMaxLen,
    edgeMaxError
}

const maxAgents = 1

const navmeshTypes = {
    solo: 'solo',
    tiled: 'tiled'
}

const levelConfig = {
    navmeshType: navmeshTypes.solo,
    navMesh: 'assets/ground'
}

export {recastConfig, maxAgents, levelConfig, navmeshTypes}