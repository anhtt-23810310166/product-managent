// ===== Role Page Scripts =====

// Delete Role
(function () {
  var deleteLinks = document.querySelectorAll(".btn-delete-role");
  if (!deleteLinks.length) return;

  deleteLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var id = this.getAttribute("data-id");
      if (!id) return;

      if (!confirm("Bạn có chắc muốn xóa nhóm quyền này?")) return;

      fetch("/admin/roles/delete/" + id, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.code === 200) {
            var row = link.closest("tr");
            if (row) row.remove();
            showFlashMessage("success", data.message);
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
