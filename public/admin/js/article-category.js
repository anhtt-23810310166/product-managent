// ===== Article Category Page Scripts =====

// Change Status
(function () {
  var buttons = document.querySelectorAll(".btn-change-status");
  if (!buttons.length) return;

  buttons.forEach(function (button) {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      var id = this.getAttribute("data-id");
      var currentStatus = this.getAttribute("data-status");
      var newStatus = currentStatus === "active" ? "inactive" : "active";
      var self = this;
      var row = this.closest("tr");

      fetch("/admin/article-category/change-status/" + newStatus + "/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      })
        .then(function (response) { return response.json(); })
        .then(function (data) {
          if (data.code === 200) {
            self.setAttribute("data-status", newStatus);
            if (newStatus === "active") {
              self.textContent = "Dừng hoạt động";
            } else {
              self.textContent = "Hoạt động";
            }

            if (row) {
              var badge = row.querySelector(".status-badge");
              if (badge) {
                if (newStatus === "active") {
                  badge.textContent = "Hoạt động";
                  badge.classList.remove("status-inactive");
                  badge.classList.add("status-active");
                } else {
                  badge.textContent = "Dừng hoạt động";
                  badge.classList.remove("status-active");
                  badge.classList.add("status-inactive");
                }
              }
            }
            if (!data.noChange) {
              showFlashMessage("success", data.message);
            }
          } else {
            showFlashMessage("error", data.message);
          }
        })
        .catch(function () {
          showFlashMessage("error", "Có lỗi xảy ra!");
        });
    });
  });
})();

// Single Delete
(function () {
  var deleteLinks = document.querySelectorAll(".hover-action-danger");
  if (!deleteLinks.length) return;

  deleteLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var id = this.getAttribute("data-id");
      if (!id) return;

      if (!confirm("Bạn có chắc muốn xoá danh mục này?")) return;

      fetch("/admin/article-category/delete/" + id, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.code === 200) {
            var row = link.closest("tr");
            if (row) row.remove();
            if (!data.noChange) {
              showFlashMessage("success", data.message);
            }
          } else {
            showFlashMessage("error", data.message);
          }
        })
        .catch(function () {
          showFlashMessage("error", "Có lỗi xảy ra!");
        });
    });
  });
})();
