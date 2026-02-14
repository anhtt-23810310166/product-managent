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

// Sidebar Submenu Toggle
(function () {
  var toggles = document.querySelectorAll(".submenu-toggle");
  if (!toggles.length) return;

  toggles.forEach(function (toggle) {
    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      var parent = this.closest(".has-submenu");
      if (parent) {
        parent.classList.toggle("open");
      }
    });
  });
})();

// Filter by Status
(function () {
  const filterStatus = document.getElementById("filterStatus");
  if (!filterStatus) return;

  // Restore selected value from URL
  const url = new URL(window.location.href);
  const currentStatus = url.searchParams.get("status") || "";
  filterStatus.value = currentStatus;

  // On change, update URL and reload
  filterStatus.addEventListener("change", function () {
    const value = this.value;
    if (value) {
      url.searchParams.set("status", value);
    } else {
      url.searchParams.delete("status");
    }
    window.location.href = url.href;
  });
})();

// Search by Keyword
(function () {
  const searchInput = document.getElementById("searchKeyword");
  if (!searchInput) return;

  const url = new URL(window.location.href);
  const currentKeyword = url.searchParams.get("keyword") || "";
  searchInput.value = currentKeyword;

  // Search on Enter key
  searchInput.addEventListener("keyup", function (e) {
    if (e.key === "Enter") {
      const value = this.value.trim();
      if (value) {
        url.searchParams.set("keyword", value);
      } else {
        url.searchParams.delete("keyword");
      }
      window.location.href = url.href;
    }
  });
})();

// Sort Products
(function () {
  const sortSelect = document.getElementById("sortSelect");
  if (!sortSelect) return;

  const url = new URL(window.location.href);
  const currentSortKey = url.searchParams.get("sortKey") || "";
  const currentSortValue = url.searchParams.get("sortValue") || "";
  if (currentSortKey && currentSortValue) {
    sortSelect.value = currentSortKey + "-" + currentSortValue;
  }

  sortSelect.addEventListener("change", function () {
    const value = this.value;
    if (value) {
      const [sortKey, sortValue] = value.split("-");
      url.searchParams.set("sortKey", sortKey);
      url.searchParams.set("sortValue", sortValue);
    } else {
      url.searchParams.delete("sortKey");
      url.searchParams.delete("sortValue");
    }
    window.location.href = url.href;
  });
})();

// Pagination
(function () {
  const paginationLinks = document.querySelectorAll(".pagination-link[data-page]");
  if (!paginationLinks.length) return;

  paginationLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const page = this.getAttribute("data-page");
      const url = new URL(window.location.href);

      if (page && parseInt(page) > 0) {
        url.searchParams.set("page", page);
      } else {
        url.searchParams.delete("page");
      }

      window.location.href = url.href;
    });
  });
})();
