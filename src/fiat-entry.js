import { initFiatScene } from './fiat-scene.js'

function boot() {
  initFiatScene()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot)
} else {
  boot()
}
