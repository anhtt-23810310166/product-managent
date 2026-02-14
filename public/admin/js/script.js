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

// Change Status
(function () {
  const buttons = document.querySelectorAll(".btn-change-status");
  if (!buttons.length) return;

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      const currentStatus = this.getAttribute("data-status");
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const self = this;

      fetch(`/admin/products/change-status/${newStatus}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      })
        .then(function (response) { return response.json(); })
        .then(function (data) {
          if (data.code === 200) {
            // Update data attribute
            self.setAttribute("data-status", newStatus);

            // Update text and class
            if (newStatus === "active") {
              self.textContent = "Hoạt động";
              self.classList.remove("status-inactive");
              self.classList.add("status-active");
            } else {
              self.textContent = "Dừng hoạt động";
              self.classList.remove("status-active");
              self.classList.add("status-inactive");
            }
          } else {
            alert(data.message);
          }
        })
        .catch(function () {
          alert("Có lỗi xảy ra!");
        });
    });
  });
})();

// Check All
(function () {
  const checkAll = document.getElementById("checkAll");
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

// Batch Action Handler
(function () {
  var batchItems = document.querySelectorAll(".batch-action-item");
  if (!batchItems.length) return;

  batchItems.forEach(function (item) {
    item.addEventListener("click", function () {
      var action = this.getAttribute("data-action");
      var checkboxes = document.querySelectorAll(".checkbox-item:checked");

      if (checkboxes.length === 0) {
        alert("Vui lòng chọn ít nhất một sản phẩm!");
        return;
      }

      var ids = [];
      checkboxes.forEach(function (cb) {
        ids.push(cb.value);
      });

      var confirmMsg = "Bạn có chắc muốn thực hiện hành động này cho " + ids.length + " sản phẩm?";
      if (action === "delete") {
        confirmMsg = "Bạn có chắc muốn xoá " + ids.length + " sản phẩm đã chọn?";
      }

      if (!confirm(confirmMsg)) return;

      fetch("/admin/products/change-multi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: ids, type: action })
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.code === 200) {
            window.location.reload();
          } else {
            alert(data.message);
          }
        })
        .catch(function () {
          alert("Có lỗi xảy ra!");
        });
    });
  });
})();
