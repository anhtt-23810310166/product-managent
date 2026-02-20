// ===== Toast Notification Helper =====
function showToast(message, type) {
  type = type || "success";
  var container = document.getElementById("toastContainer");
  if (!container) return;

  var iconClass = type === "success" ? "fa-check-circle"
    : type === "error" ? "fa-exclamation-circle"
    : "fa-info-circle";

  var toast = document.createElement("div");
  toast.className = "toast-notification toast-" + type;
  toast.innerHTML =
    '<i class="fas ' + iconClass + ' toast-icon"></i>' +
    '<span class="toast-message">' + message + '</span>' +
    '<button class="toast-close" type="button">&times;</button>';

  container.appendChild(toast);

  // Trigger animation
  setTimeout(function () { toast.classList.add("show"); }, 10);

  // Close button
  toast.querySelector(".toast-close").addEventListener("click", function () {
    toast.classList.remove("show");
    toast.classList.add("hide");
    setTimeout(function () { toast.remove(); }, 400);
  });

  // Auto dismiss after 3s
  setTimeout(function () {
    toast.classList.remove("show");
    toast.classList.add("hide");
    setTimeout(function () { toast.remove(); }, 400);
  }, 3000);
}

// ===== Auto-dismiss server-rendered toasts =====
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".toast-notification.show").forEach(function (toast) {
    // Close button
    var closeBtn = toast.querySelector(".toast-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        toast.classList.remove("show");
        toast.classList.add("hide");
        setTimeout(function () { toast.remove(); }, 400);
      });
    }
    // Auto dismiss after 3s
    setTimeout(function () {
      toast.classList.remove("show");
      toast.classList.add("hide");
      setTimeout(function () { toast.remove(); }, 400);
    }, 3000);
  });
});

// ===== Quantity Controls (dùng chung cho detail + cart) =====
document.addEventListener("DOMContentLoaded", function () {
  // Quantity +/- buttons
  document.querySelectorAll(".quantity-minus").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var input = this.closest(".quantity-control").querySelector(".quantity-input");
      var val = parseInt(input.value) || 1;
      if (val > 1) {
        input.value = val - 1;
        // Trigger change for cart page
        input.dispatchEvent(new Event("change"));
      }
    });
  });

  document.querySelectorAll(".quantity-plus").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var input = this.closest(".quantity-control").querySelector(".quantity-input");
      var val = parseInt(input.value) || 1;
      var max = parseInt(input.getAttribute("max")) || 999;
      if (val < max) {
        input.value = val + 1;
        input.dispatchEvent(new Event("change"));
      }
    });
  });

  // ===== Cart Page AJAX =====
  var isCartPage = document.querySelector(".cart-wrapper");
  if (!isCartPage) return;

  // Format number with dots (Vietnamese style)
  function formatPrice(num) {
    return num.toLocaleString() + " ₫";
  }

  // Update badge on header
  function updateBadge(totalQty) {
    var badge = document.getElementById("miniCartBadge");
    if (badge) badge.textContent = totalQty;
  }

  // Update quantity via AJAX
  document.querySelectorAll(".cart-wrapper .quantity-input").forEach(function (input) {
    input.addEventListener("change", function () {
      var productId = this.dataset.productId;
      var quantity = parseInt(this.value);
      if (quantity < 1) {
        this.value = 1;
        quantity = 1;
      }

      fetch("/cart/update/" + productId, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: quantity }),
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.success) {
            // Update item total
            var row = document.querySelector('.cart-item[data-product-id="' + productId + '"]');
            if (row) {
              row.querySelector(".cart-item-total").textContent = formatPrice(data.itemTotal);
            }
            // Update cart total
            var totalEl = document.getElementById("cartTotalPrice");
            if (totalEl) totalEl.textContent = formatPrice(data.cartTotal);
            // Update badge
            updateBadge(data.cartTotalQuantity);

          } else {
            showToast(data.message || "Lỗi cập nhật", "error");
          }
        })
        .catch(function (err) {
          console.error("Update error:", err);
          showToast("Lỗi kết nối!", "error");
        });
    });
  });

  // Remove item via AJAX
  document.querySelectorAll(".cart-remove-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var productId = this.dataset.productId;

      if (!confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) return;

      fetch("/cart/remove/" + productId, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.success) {
            // Remove row from DOM
            var row = document.querySelector('.cart-item[data-product-id="' + productId + '"]');
            if (row) row.remove();

            // Update cart total
            var totalEl = document.getElementById("cartTotalPrice");
            if (totalEl) totalEl.textContent = formatPrice(data.cartTotal);

            // Update badge
            updateBadge(data.cartTotalQuantity);

            // Toast
            showToast("Đã xóa sản phẩm khỏi giỏ hàng!", "success");

            // If cart is empty, reload to show empty state
            if (data.cartTotalQuantity === 0) {
              setTimeout(function () { window.location.reload(); }, 1000);
            }
          } else {
            showToast(data.message || "Lỗi xóa sản phẩm", "error");
          }
        })
        .catch(function (err) {
          console.error("Remove error:", err);
          showToast("Lỗi kết nối!", "error");
        });
    });
  });
});
