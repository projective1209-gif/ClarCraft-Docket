/* Searchable selections; native form values and validation remain authoritative. */
(() => {
  let active = null,
    nextId = 0,
    scheduled = false;
  const controls = new WeakMap();
  const normalise = (value) =>
    String(value)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase();
  function enhance(select) {
    if (select.multiple || select.size > 1) return;
    let control = controls.get(select);
    if (!control) {
      const label =
        select.getAttribute("aria-label") ||
        [...(select.closest("label")?.childNodes || [])]
          .filter((n) => n.nodeType === 3)
          .map((n) => n.textContent.trim())
          .join(" ")
          .trim() ||
        select.name ||
        "Selection";
      const wrapper = document.createElement("span");
      wrapper.className = "searchable-select";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "selection-trigger";
      button.setAttribute("aria-haspopup", "dialog");
      button.setAttribute("aria-expanded", "false");
      select.before(wrapper);
      wrapper.append(select, button);
      select.classList.add("select-native");
      select.tabIndex = -1;
      select.setAttribute("aria-hidden", "true");
      control = { button, label };
      controls.set(select, control);
      select.addEventListener("focus", () => button.focus());
      select.addEventListener("invalid", () => {
        button.focus();
        button.setAttribute("aria-invalid", "true");
      });
      select.addEventListener("change", () => {
        button.removeAttribute("aria-invalid");
        enhance(select);
      });
      button.addEventListener("click", (event) => {
        event.preventDefault();
        if (active?.select === select) active.close();
        else open(select, control);
      });
      button.addEventListener("keydown", (event) => {
        if (["ArrowDown", "ArrowUp"].includes(event.key)) {
          event.preventDefault();
          open(select, control);
        }
      });
    }
    const text = select.selectedOptions[0]?.textContent || "Select an option";
    if (control.button.textContent !== text) control.button.textContent = text;
    if (control.button.disabled !== select.disabled)
      control.button.disabled = select.disabled;
    control.button.setAttribute("aria-label", `${control.label}: ${text}`);
  }
  function open(select, { button, label }) {
    if (select.disabled) return;
    active?.close(false);
    const popup = document.createElement("div");
    popup.className = "selection-popup";
    popup.setAttribute("role", "dialog");
    popup.setAttribute("aria-label", `Choose ${label.toLowerCase()}`);
    const input = document.createElement("input");
    input.type = "search";
    input.placeholder = "Search…";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.setAttribute("aria-label", `Search ${label.toLowerCase()}`);
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "true");
    const list = document.createElement("div");
    list.className = "selection-options";
    list.id = `selection-list-${++nextId}`;
    list.setAttribute("role", "listbox");
    list.setAttribute("aria-label", `${label} options`);
    input.setAttribute("aria-controls", list.id);
    const count = document.createElement("div");
    count.className = "selection-count";
    count.setAttribute("role", "status");
    count.setAttribute("aria-live", "polite");
    popup.append(input, list, count);
    (select.closest("dialog") || document.body).append(popup);
    button.setAttribute("aria-expanded", "true");
    button.setAttribute("aria-controls", list.id);
    let matches = [],
      current = 0;
    const close = (restoreFocus = true) => {
      popup.remove();
      button.setAttribute("aria-expanded", "false");
      button.removeAttribute("aria-controls");
      if (active?.popup === popup) active = null;
      if (restoreFocus && button.isConnected) button.focus();
    };
    active = { select, popup, button, close };
    function choose(option) {
      if (!option || option.disabled) return;
      select.value = option.value;
      select.dispatchEvent(new Event("input", { bubbles: true }));
      select.dispatchEvent(new Event("change", { bubbles: true }));
      enhance(select);
      close();
    }
    function highlight() {
      [...list.children].forEach((node, index) =>
        node.classList.toggle("highlighted", index === current),
      );
      const node = list.children[current];
      if (node) {
        input.setAttribute("aria-activedescendant", node.id);
        const top = node.offsetTop - list.offsetTop;
        if (top < list.scrollTop) list.scrollTop = top;
        else if (top + node.offsetHeight > list.scrollTop + list.clientHeight)
          list.scrollTop = top + node.offsetHeight - list.clientHeight;
      } else input.removeAttribute("aria-activedescendant");
    }
    function draw() {
      const query = normalise(input.value.trim());
      matches = [...select.options].filter(
        (o) =>
          !o.hidden &&
          !o.disabled &&
          normalise(`${o.textContent} ${o.value}`).includes(query),
      );
      current = Math.max(
        0,
        matches.findIndex((o) => o.value === select.value),
      );
      list.replaceChildren();
      matches.forEach((option, index) => {
        const item = document.createElement("button");
        item.type = "button";
        item.tabIndex = -1;
        item.setAttribute("role", "option");
        item.setAttribute(
          "aria-selected",
          String(option.value === select.value),
        );
        item.id = `${list.id}-${index}`;
        item.textContent = option.textContent;
        item.addEventListener("mousedown", (event) => event.preventDefault());
        item.addEventListener("click", (event) => {
          event.preventDefault();
          choose(option);
        });
        list.append(item);
      });
      count.textContent = matches.length
        ? `${matches.length} option${matches.length === 1 ? "" : "s"} · ↑ ↓ to browse · Enter to select`
        : "No matching options. Try another search.";
      highlight();
    }
    input.addEventListener("input", draw);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close();
      } else if (event.key === "Tab") close();
      else if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        choose(matches[current]);
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        current = Math.max(
          0,
          Math.min(
            matches.length - 1,
            current + (event.key === "ArrowDown" ? 1 : -1),
          ),
        );
        highlight();
      }
    });
    draw();
    function position() {
      const rect = button.getBoundingClientRect(),
        below =
          (window.visualViewport?.height || innerHeight) - rect.bottom - 12,
        above = rect.top - 12;
      const upwards = below < 240 && above > below,
        space = Math.max(100, upwards ? above : below);
      popup.style.width = `${Math.min(Math.max(rect.width, 280), innerWidth - 24)}px`;
      const viewportHeight = window.visualViewport?.height || innerHeight;
      popup.style.maxHeight = `${Math.min(380, space, viewportHeight - 24)}px`;
      popup.style.left = `${Math.max(12, Math.min(rect.left, innerWidth - popup.offsetWidth - 12))}px`;
      const desiredTop = upwards
        ? rect.top - popup.offsetHeight - 6
        : rect.bottom + 6;
      popup.style.top = `${Math.max(12, Math.min(desiredTop, viewportHeight - popup.offsetHeight - 12))}px`;
    }
    active.position = position;
    position();
    input.focus({ preventScroll: true });
    highlight();
  }
  document.addEventListener(
    "pointerdown",
    (event) => {
      if (
        active &&
        !active.popup.contains(event.target) &&
        !active.button.contains(event.target)
      )
        active.close(false);
    },
    true,
  );
  document.addEventListener(
    "wheel",
    (event) => {
      if (active && !active.popup.contains(event.target)) active.close(false);
    },
    true,
  );
  window.addEventListener("resize", () => active?.position?.());
  window.visualViewport?.addEventListener("resize", () => active?.position?.());
  function scan() {
    scheduled = false;
    if (active && !active.select.isConnected) active.close(false);
    document.querySelectorAll("select").forEach(enhance);
  }
  new MutationObserver(() => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(scan);
    }
  }).observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["disabled"],
  });
  scan();
})();
