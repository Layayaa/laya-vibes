/* ===== NPC Dialog System ===== */
window.NpcDialog = (function () {
  var activeDialog = null;

  function show(options) {
    // options: { name, segments, portrait, onDone, reward }
    if (activeDialog) activeDialog.remove();

    var overlay = document.createElement("div");
    overlay.className = "npc-dialog-overlay";

    var box = document.createElement("div");
    box.className = "npc-dialog-box";

    var nameTag = document.createElement("div");
    nameTag.className = "npc-dialog-name";
    nameTag.textContent = options.name || "???";
    box.appendChild(nameTag);

    if (options.portrait) {
      var portrait = document.createElement("div");
      portrait.className = "npc-dialog-portrait";
      if (options.portrait.style) {
        Object.assign(portrait.style, options.portrait.style);
      }
      box.appendChild(portrait);
    }

    var textEl = document.createElement("p");
    textEl.className = "npc-dialog-text";
    box.appendChild(textEl);

    var nextIndicator = document.createElement("div");
    nextIndicator.className = "npc-dialog-next hidden";
    box.appendChild(nextIndicator);

    var closeBtn = document.createElement("button");
    closeBtn.className = "npc-dialog-close";
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", function () { dismiss(); });
    box.appendChild(closeBtn);

    if (options.reward) {
      var reward = document.createElement("div");
      reward.className = "npc-dialog-reward";
      reward.textContent = options.reward;
      box.appendChild(reward);
    }

    overlay.appendChild(box);
    var desktop = document.getElementById("desktop");
    desktop.appendChild(overlay);
    activeDialog = { overlay: overlay, box: box, options: options };

    var segIdx = 0;
    var segments = options.segments || [];

    function dismiss() {
      if (activeDialog) {
        if (activeDialog._typingTimer) clearTimeout(activeDialog._typingTimer);
        activeDialog.overlay.remove();
        activeDialog = null;
      }
      if (typeof options.onDone === "function") options.onDone();
    }

    function typeSegment() {
      if (segIdx >= segments.length) {
        // All done
        box.classList.add("done");
        nextIndicator.classList.add("hidden");
        return;
      }

      box.classList.remove("done");
      var text = segments[segIdx];
      var charIdx = 0;
      textEl.innerHTML = "";
      nextIndicator.classList.add("hidden");

      function tick() {
        if (charIdx < text.length) {
          textEl.textContent = text.slice(0, charIdx + 1);
          charIdx += 1;
          activeDialog._typingTimer = setTimeout(tick, 35);
        } else {
          // Done typing this segment
          textEl.innerHTML = window.escapeHtml(text) + '<span class="typing-cursor"></span>';
          if (segIdx < segments.length - 1) {
            nextIndicator.classList.remove("hidden");
          } else {
            box.classList.add("done");
          }
        }
      }

      tick();
    }

    // Click anywhere on box to advance
    box.addEventListener("click", function (event) {
      if (event.target === closeBtn) return;
      if (activeDialog && activeDialog._typingTimer) {
        // Skip typing animation
        clearTimeout(activeDialog._typingTimer);
        activeDialog._typingTimer = null;
        textEl.innerHTML = window.escapeHtml(segments[segIdx]) + '<span class="typing-cursor"></span>';
        if (segIdx < segments.length - 1) {
          nextIndicator.classList.remove("hidden");
        } else {
          box.classList.add("done");
        }
      } else if (segIdx < segments.length - 1) {
        segIdx += 1;
        typeSegment();
      } else {
        dismiss();
      }
    });

    // Start first segment
    typeSegment();

    return { dismiss: dismiss };
  }

  return { show: show };
})();
