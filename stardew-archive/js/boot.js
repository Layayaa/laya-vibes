// Boot animation is driven by desktop.js runBootSequence().
// This file reserved for future: boot sound, sprite preloading.
(function () {
  // Preload critical sprites silently
  var preload = [
    "assets/sprites/stardewPanorama.png",
    "assets/icons/diamond.png",
    "assets/icons/prismatic-shard.png",
    "assets/icons/terminal-device.png",
  ];
  preload.forEach(function (src) {
    var img = new Image();
    img.src = src;
  });
})();
