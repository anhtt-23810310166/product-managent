// ===== Role Page Scripts =====

// Batch Action Handler (chỉ xoá hàng loạt)
(function () {
  var batchItems = document.querySelectorAll(".batch-action-item");
  if (!batchItems.length) return;

  batchItems.forEach(function (item) {
    item.addEventListener("click", function () {
      var action = this.getAttribute("data-action");
      var checkboxes = document.querySelectorAll(".checkbox-item:checked");

      if (checkboxes.length === 0) {
        alert("Vui lòng chọn ít nhất một nhóm quyền!");
        return;
      }

      var ids = [];
      checkboxes.forEach(function (cb) {
        ids.push(cb.value);
      });

      if (action === "delete") {
        if (!confirm("Bạn có chắc muốn xoá " + ids.length + " nhóm quyền đã chọn?")) return;

        // Xóa từng item bằng DELETE
        var promises = ids.map(function (id) {
          return fetch("/admin/roles/delete/" + id, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
          }).then(function (res) { return res.json(); });
        });

        Promise.all(promises)
          .then(function (results) {
            var successCount = results.filter(function (r) { return r.code === 200; }).length;
            if (successCount > 0) {
              showFlashMessage("success", "Xoá " + successCount + " nhóm quyền thành công!");
            }
            setTimeout(function () {
              window.location.reload();
            }, 1000);
          })
          .catch(function () {
            showFlashMessage("error", "Có lỗi xảy ra!");
          });
      }
    });
  });
})();

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
