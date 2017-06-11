import {AmbientLight, DirectionalLight, DirectionalLightHelper, CameraHelper} from 'three'

export const Light = (Game) => {
    Game.prototype.addAmbientLight = function(color) {
        const ambientLight = new AmbientLight(color)
        
        this.scene.add(ambientLight)
        
        return ambientLight
    }
    
    Game.prototype.addDirectionalLight = function(color, intensity, castShadow, position, target) {
        const directionalLight = new DirectionalLight(color, intensity)
        
        directionalLight.castShadow = castShadow
        directionalLight.shadow.mapSize.width  =  4096
        directionalLight.shadow.mapSize.height =  4096
        
        directionalLight.shadow.bias           =  0.0001
        directionalLight.shadow.radius         =  1.1
        
        directionalLight.shadow.camera.top     = -100
        directionalLight.shadow.camera.right   =  100
        directionalLight.shadow.camera.bottom  =  100
        directionalLight.shadow.camera.left    = -100
        directionalLight.shadow.camera.near    =  0.5
        directionalLight.shadow.camera.far     =  500
        
        directionalLight.position.set(position.x, position.y, position.z)
        
        this.scene.add(directionalLight)
    
        directionalLight.target = target
        
        if (__DEV__) {
            const helper = new DirectionalLightHelper(directionalLight, 5)
            this.scene.add(helper)
            
            const shadowHelper = new CameraHelper(directionalLight.shadow.camera)
            this.scene.add(shadowHelper)
        }
        
        return directionalLight
    }
}