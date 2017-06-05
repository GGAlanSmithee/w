// import recast from 'recast'
// import {recastConfig, maxAgents} from './config'

export const Recast = (Game) => {
    Game.prototype.recast = {
        init: function() {
            console.log(this.target, 'init recast..')
        }
    }
}