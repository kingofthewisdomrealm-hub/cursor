(function () {
  try {
    if (typeof window === "undefined") return;

    if (!window.__firefox__) {
      window.__firefox__ = { reader: {} };
    } else if (!window.__firefox__.reader) {
      window.__firefox__.reader = {};
    }

    // Suppress injected browser/extension errors from breaking the app overlay
    window.addEventListener(
      "error",
      function (event) {
        var msg = event.message || "";
        if (
          msg.indexOf("__firefox__") !== -1 ||
          msg.indexOf("firefox") !== -1
        ) {
          event.preventDefault();
          return true;
        }
      },
      true
    );
  } catch (e) {
    // ignore
  }
})();
