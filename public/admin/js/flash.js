// Flash Toast Notifications
(function () {
  var container = document.getElementById("flashContainer");
  if (!container) return;

  // Auto-dismiss existing flash toasts
  var toasts = container.querySelectorAll(".flash-toast");
  toasts.forEach(function (toast) {
    // Trigger slide-in animation
    setTimeout(function () {
      toast.classList.add("flash-show");
    }, 50);

    // Auto-dismiss after 3 seconds
    setTimeout(function () {
      dismissToast(toast);
    }, 3000);
  });

  // Close button handler
  container.addEventListener("click", function (e) {
    if (e.target.classList.contains("flash-close")) {
      var toast = e.target.closest(".flash-toast");
      if (toast) dismissToast(toast);
    }
  });

  function dismissToast(toast) {
    toast.classList.add("flash-hide");
    setTimeout(function () {
      toast.remove();
    }, 300);
  }
})();

// Global function for AJAX responses to show flash messages
function showFlashMessage(type, message) {
  var container = document.getElementById("flashContainer");
  if (!container) return;

  var iconClass = type === "success" ? "fa-check-circle" : "fa-exclamation-circle";
  var toastClass = type === "success" ? "flash-success" : "flash-error";

  var toast = document.createElement("div");
  toast.className = "flash-toast " + toastClass;
  toast.innerHTML =
    '<i class="fas ' + iconClass + ' flash-icon"></i>' +
    '<span class="flash-text">' + message + '</span>' +
    '<button class="flash-close" type="button">&times;</button>';

  container.appendChild(toast);

  // Trigger animation
  setTimeout(function () {
    toast.classList.add("flash-show");
  }, 50);

  // Auto-dismiss
  setTimeout(function () {
    toast.classList.add("flash-hide");
    setTimeout(function () {
      toast.remove();
    }, 300);
  }, 3000);
}
