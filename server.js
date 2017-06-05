const path = require('path')
const express = require('express')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const appConfig = require('./webpack-dev-client.config')

const app = express()
const server = require('http').Server(app)

app.use(express.static(path.resolve(__dirname, 'public')))

const compiler = webpack(appConfig)
app.use(webpackDevMiddleware(compiler, { noInfo: true, lazy: false, hot: true, publicPath: appConfig.output.publicPath }))
app.use(webpackHotMiddleware(compiler))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, `index.html`))
})

server.listen(process.env.PORT || 8080, err => {
    console.log(`listening on port ${server.address().port}`)
})