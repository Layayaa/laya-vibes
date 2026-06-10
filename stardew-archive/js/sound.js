/* ===== Sound Manager ===== */
window.SoundManager = (function () {
  var enabled = false;
  var sounds = {};
  var ctx = null;

  function init() {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      ctx = null;
    }
  }

  function setEnabled(val) {
    enabled = val;
    var state = window.PixelDesk;
    state.settings.sound = val;
    try {
      localStorage.setItem("laya-stardew-settings", JSON.stringify(state.settings));
    } catch (e) {}
  }

  function isEnabled() {
    return enabled && ctx !== null;
  }

  // Simple pixel blip sound using oscillator
  function playTone(freq, duration, type) {
    if (!isEnabled()) return;
    type = type || "square";
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = 0.08;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  function click() { playTone(800, 0.08); }
  function open() { playTone(600, 0.06); setTimeout(function () { playTone(900, 0.08); }, 80); }
  function close() { playTone(500, 0.06); setTimeout(function () { playTone(300, 0.1); }, 80); }
  function affinity() { playTone(523, 0.1); setTimeout(function () { playTone(659, 0.1); }, 120); setTimeout(function () { playTone(784, 0.15); }, 240); }
  function levelUp() {
    playTone(523, 0.12);
    setTimeout(function () { playTone(659, 0.12); }, 150);
    setTimeout(function () { playTone(784, 0.12); }, 300);
    setTimeout(function () { playTone(1047, 0.25); }, 450);
  }
  function boot() { playTone(440, 0.15); setTimeout(function () { playTone(660, 0.2); }, 200); }

  init();

  return {
    setEnabled: setEnabled,
    isEnabled: isEnabled,
    click: click,
    open: open,
    close: close,
    affinity: affinity,
    levelUp: levelUp,
    boot: boot
  };
})();
