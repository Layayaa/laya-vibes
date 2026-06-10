(function () {
  const state = window.PixelDesk;
  const layer = document.getElementById("window-layer");
  const taskButtons = document.getElementById("task-buttons");
  const template = document.getElementById("window-template");

  function syncTaskbar() {
    taskButtons.innerHTML = "";
    [...state.windows.values()].forEach((win) => {
      const btn = document.createElement("button");
      btn.className = "task-item";
      if (win.minimized) btn.dataset.minimized = "true";
      btn.textContent = win.title;
      btn.addEventListener("click", () => {
        if (win.minimized) {
          restoreWindow(win.id);
        } else if (state.activeId === win.id) {
          minimizeWindow(win.id);
        } else {
          focusWindow(win.id);
        }
      });
      taskButtons.appendChild(btn);
    });
  }

  function focusWindow(id) {
    const win = state.windows.get(id);
    if (!win) return;
    state.activeId = id;
    state.zIndex += 1;
    win.el.style.zIndex = String(state.zIndex);
    [...layer.querySelectorAll(".window")].forEach((el) => el.classList.remove("active"));
    win.el.classList.add("active");
    syncTaskbar();
  }

  function positionWindow(el, options = {}) {
    const width = options.width || Math.min(820, Math.max(320, window.innerWidth - 120));
    const height = options.height || Math.min(560, Math.max(260, window.innerHeight - 170));
    const x = options.x ?? Math.max(24, (window.innerWidth - width) / 2 + (Math.random() * 40 - 20));
    const y = options.y ?? Math.max(20, (window.innerHeight - height - 58) / 2 + (Math.random() * 30 - 15));
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
    el.style.left = `${Math.max(8, Math.min(x, window.innerWidth - width - 8))}px`;
    el.style.top = `${Math.max(8, Math.min(y, window.innerHeight - height - 70))}px`;
  }

  function makeDraggable(win) {
    const bar = win.el.querySelector(".window-titlebar");
    let drag = null;
    let pending = null;
    let frame = 0;

    function applyPendingPosition() {
      frame = 0;
      if (!pending || !drag) return;
      win.el.style.left = `${pending.x}px`;
      win.el.style.top = `${pending.y}px`;
    }

    bar.addEventListener("pointerdown", (event) => {
      if (event.target.closest(".window-controls")) return;
      if (win.maximized) return;
      focusWindow(win.id);
      drag = {
        dx: event.clientX - win.el.offsetLeft,
        dy: event.clientY - win.el.offsetTop,
      };
      win.el.classList.add("dragging");
      bar.setPointerCapture(event.pointerId);
    });
    bar.addEventListener("pointermove", (event) => {
      if (!drag) return;
      const x = event.clientX - drag.dx;
      const y = event.clientY - drag.dy;
      pending = {
        x: Math.max(0, Math.min(x, window.innerWidth - win.el.offsetWidth)),
        y: Math.max(0, Math.min(y, window.innerHeight - 58 - win.el.offsetHeight)),
      };
      if (!frame) frame = requestAnimationFrame(applyPendingPosition);
    });
    const endDrag = () => {
      drag = null;
      pending = null;
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      win.el.classList.remove("dragging");
    };
    bar.addEventListener("pointerup", endDrag);
    bar.addEventListener("pointercancel", endDrag);
    bar.addEventListener("pointerleave", endDrag);
  }

  function createWindow({ id, title, icon = "■", body, width, height }) {
    if (state.windows.has(id)) {
      restoreWindow(id);
      focusWindow(id);
      return state.windows.get(id);
    }

    const fragment = template.content.cloneNode(true);
    const el = fragment.querySelector(".window");
    el.dataset.windowId = id;
    el.querySelector(".window-title-text").textContent = title;
    el.querySelector(".window-icon").textContent = icon;
    el.querySelector(".window-body").appendChild(body);
    layer.appendChild(fragment);

    const win = {
      id,
      title,
      el: layer.querySelector(`[data-window-id="${id}"]`),
      minimized: false,
      maximized: false,
      prev: null,
    };

    positionWindow(win.el, { width, height });
    win.el.style.zIndex = String(++state.zIndex);
    state.windows.set(id, win);
    focusWindow(id);
    makeDraggable(win);

    const close = win.el.querySelector(".close");
    const minimize = win.el.querySelector(".minimize");
    const maximize = win.el.querySelector(".maximize");

    [close, minimize, maximize].forEach((btn) => {
      if (btn) btn.addEventListener("pointerdown", (event) => event.stopPropagation());
    });
    if (close) close.addEventListener("click", (event) => {
      event.stopPropagation();
      closeWindow(id);
    });
    if (minimize) minimize.addEventListener("click", (event) => {
      event.stopPropagation();
      minimizeWindow(id);
    });
    if (maximize) maximize.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleMaximizeWindow(id);
    });

    syncTaskbar();
    return win;
  }

  function closeWindow(id) {
    const win = state.windows.get(id);
    if (!win) return;
    win.el.remove();
    state.windows.delete(id);
    if (state.activeId === id) state.activeId = null;
    syncTaskbar();
  }

  function deleteWindow(id) {
    const win = state.windows.get(id);
    if (!win) return;
    if (win.el.classList.contains("deleting")) return;
    win.el.classList.add("deleting");
    const remove = win.el.querySelector(".delete");
    if (remove) remove.disabled = true;
    setTimeout(() => closeWindow(id), 180);
  }

  function minimizeWindow(id) {
    const win = state.windows.get(id);
    if (!win) return;
    win.minimized = true;
    win.el.style.display = "none";
    if (state.activeId === id) state.activeId = null;
    syncTaskbar();
  }

  function restoreWindow(id) {
    const win = state.windows.get(id);
    if (!win) return;
    win.minimized = false;
    win.el.style.display = "flex";
    focusWindow(id);
  }

  function toggleMaximizeWindow(id) {
    const win = state.windows.get(id);
    if (!win) return;
    if (!win.maximized) {
      win.prev = {
        left: win.el.style.left,
        top: win.el.style.top,
        width: win.el.style.width,
        height: win.el.style.height,
      };
      win.el.classList.add("maximized");
      win.el.style.left = "0px";
      win.el.style.top = "0px";
      win.el.style.width = "100%";
      win.el.style.height = "calc(100% - 58px)";
      win.maximized = true;
    } else {
      win.el.classList.remove("maximized");
      if (win.prev) {
        win.el.style.left = win.prev.left;
        win.el.style.top = win.prev.top;
        win.el.style.width = win.prev.width;
        win.el.style.height = win.prev.height;
      }
      win.maximized = false;
    }
    focusWindow(id);
  }

  window.WindowManager = {
    createWindow,
    closeWindow,
    deleteWindow,
    focusWindow,
    minimizeWindow,
    restoreWindow,
    toggleMaximizeWindow,
    syncTaskbar,
  };
})();
