import recast from 'recast'

export const addZone = (intersection) => {
    if (intersection === undefined) {
	    return
	}
	
// 	const geometry = intersection.object.geometry
	const point = intersection.point
	
	recast.setPolyFlags(point.x, point.y, point.z, 1, 1, 1, recast.FLAG_DISABLED)
	
	recast.queryPolygons(point.x, point.y, point.z, 1, 1, 1,
                         1,
                         recast.cb(polygons => {
                             console.log(polygons)
                         }))
}