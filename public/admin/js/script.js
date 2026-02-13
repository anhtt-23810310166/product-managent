// Admin Sidebar Toggle
(function () {
  const sider = document.getElementById("adminSider");
  const overlay = document.getElementById("siderOverlay");
  const toggleBtn = document.getElementById("siderToggle");

  if (!sider || !toggleBtn) return;

  function openSider() {
    sider.classList.add("open");
    if (overlay) overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeSider() {
    sider.classList.remove("open");
    if (overlay) overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  toggleBtn.addEventListener("click", function () {
    if (sider.classList.contains("open")) {
      closeSider();
    } else {
      openSider();
    }
  });

  if (overlay) {
    overlay.addEventListener("click", closeSider);
  }

  // Close sidebar on Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sider.classList.contains("open")) {
      closeSider();
    }
  });
})();
