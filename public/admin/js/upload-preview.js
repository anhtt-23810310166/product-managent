// Image upload preview
(function () {
  var uploadFile = document.getElementById("uploadFile");
  var uploadPreview = document.getElementById("uploadPreview");
  var uploadPlaceholder = document.getElementById("uploadPlaceholder");
  var uploadArea = document.getElementById("uploadArea");

  if (!uploadFile) return;

  uploadFile.addEventListener("change", function () {
    if (this.files && this.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        uploadPreview.src = e.target.result;
        uploadPreview.style.display = "block";
        uploadPlaceholder.style.display = "none";
      };
      reader.readAsDataURL(this.files[0]);
    }
  });

  // Drag & drop
  uploadArea.addEventListener("dragover", function (e) {
    e.preventDefault();
    this.classList.add("drag-over");
  });
  uploadArea.addEventListener("dragleave", function () {
    this.classList.remove("drag-over");
  });
  uploadArea.addEventListener("drop", function (e) {
    e.preventDefault();
    this.classList.remove("drag-over");
    if (e.dataTransfer.files.length) {
      uploadFile.files = e.dataTransfer.files;
      uploadFile.dispatchEvent(new Event("change"));
    }
  });
})();
