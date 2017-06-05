import * as three from 'three'
import polyfillOBJLoader from 'three-obj-loader'
import polyfillQuickHull from './quick-hull'
import polyfillConvexGeometry from './convex-geometry'

polyfillOBJLoader(three)
polyfillQuickHull(three)
polyfillConvexGeometry(three)