// ===== Admin Global Scripts =====
// Dùng chung cho toàn bộ admin

// Sidebar Toggle
(function () {
  var sider = document.getElementById("adminSider");
  var overlay = document.getElementById("siderOverlay");
  var toggleBtn = document.getElementById("siderToggle");

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

// Check All Checkbox
(function () {
  var checkAll = document.getElementById("checkAll");
  if (!checkAll) return;

  var checkboxItems = document.querySelectorAll(".checkbox-item");

  checkAll.addEventListener("change", function () {
    var isChecked = this.checked;
    checkboxItems.forEach(function (item) {
      item.checked = isChecked;
    });
  });

  checkboxItems.forEach(function (item) {
    item.addEventListener("change", function () {
      var allChecked = true;
      checkboxItems.forEach(function (cb) {
        if (!cb.checked) allChecked = false;
      });
      checkAll.checked = allChecked;
    });
  });
})();

// Batch Action Dropdown
(function () {
  var batchBtn = document.getElementById("batchActionBtn");
  var dropdown = document.getElementById("batchDropdown");
  if (!batchBtn || !dropdown) return;

  batchBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  document.addEventListener("click", function () {
    dropdown.classList.remove("show");
  });

  dropdown.addEventListener("click", function (e) {
    e.stopPropagation();
  });
})();

// Filter by Status
(function () {
  var filterStatus = document.getElementById("filterStatus");
  if (!filterStatus) return;

  var url = new URL(window.location.href);
  var currentStatus = url.searchParams.get("status") || "";
  filterStatus.value = currentStatus;

  filterStatus.addEventListener("change", function () {
    var value = this.value;
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
  var searchInput = document.getElementById("searchKeyword");
  if (!searchInput) return;

  var url = new URL(window.location.href);
  var currentKeyword = url.searchParams.get("keyword") || "";
  searchInput.value = currentKeyword;

  searchInput.addEventListener("keyup", function (e) {
    if (e.key === "Enter") {
      var value = this.value.trim();
      if (value) {
        url.searchParams.set("keyword", value);
      } else {
        url.searchParams.delete("keyword");
      }
      window.location.href = url.href;
    }
  });
})();

// Sort
(function () {
  var sortSelect = document.getElementById("sortSelect");
  if (!sortSelect) return;

  var url = new URL(window.location.href);
  var currentSortKey = url.searchParams.get("sortKey") || "";
  var currentSortValue = url.searchParams.get("sortValue") || "";
  if (currentSortKey && currentSortValue) {
    sortSelect.value = currentSortKey + "-" + currentSortValue;
  }

  sortSelect.addEventListener("change", function () {
    var value = this.value;
    if (value) {
      var parts = value.split("-");
      url.searchParams.set("sortKey", parts[0]);
      url.searchParams.set("sortValue", parts[1]);
    } else {
      url.searchParams.delete("sortKey");
      url.searchParams.delete("sortValue");
    }
    window.location.href = url.href;
  });
})();

// Pagination
(function () {
  var paginationLinks = document.querySelectorAll(".pagination-link[data-page]");
  if (!paginationLinks.length) return;

  paginationLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var page = this.getAttribute("data-page");
      var url = new URL(window.location.href);

      if (page && parseInt(page) > 0) {
        url.searchParams.set("page", page);
      } else {
        url.searchParams.delete("page");
      }

      window.location.href = url.href;
    });
  });
})();

// User Dropdown Toggle
(function () {
  var toggle = document.getElementById("userDropdownToggle");
  var dropdown = toggle ? toggle.closest(".admin-user-dropdown") : null;
  if (!toggle || !dropdown) return;

  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    dropdown.classList.toggle("open");
  });

  document.addEventListener("click", function () {
    dropdown.classList.remove("open");
  });
})();
