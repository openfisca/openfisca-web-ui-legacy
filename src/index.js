import app from './app'

// Polyfills
var raf = require('raf')
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = raf
}

app.init()
