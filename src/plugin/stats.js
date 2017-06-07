/*globals document*/

import DOMStats from 'stats.js'
    
class Stats {
    constructor() {
        this.stats = new DOMStats()
        this.stats.showPanel(1) // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.stats.dom)
    }
    
    onBeforeRender() {
        this.stats.begin()
    }
    
    onAfterRender() {
    	this.stats.end()
    }
}

export default Stats