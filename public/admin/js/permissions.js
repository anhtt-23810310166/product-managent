// Permissions Page Logic
const tablePermissions = document.querySelector("[table-permissions]");

if (tablePermissions) {
  // --- Submit Form ---
  const form = document.querySelector("[data-permissions-form]");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const result = [];
      const ths = tablePermissions.querySelectorAll("thead tr:first-child th");
      // ths[0] = "Tính năng", ths[1..n] = roles
      const roleHeaders = Array.from(ths).slice(1);

      roleHeaders.forEach((th, index) => {
        const permissions = [];

        const dataRows = tablePermissions.querySelectorAll("tbody tr[data-name]");
        dataRows.forEach((row) => {
          const inputs = row.querySelectorAll("input[type='checkbox']");
          if (inputs[index] && inputs[index].checked) {
            permissions.push(row.getAttribute("data-name"));
          }
        });

        // Lấy id từ data-records
        const divRecords = document.querySelector("[data-records]");
        const roles = JSON.parse(divRecords.getAttribute("data-records"));

        result.push({
          id: roles[index]._id,
          permissions: permissions,
        });
      });

      const hiddenInput = form.querySelector("input[name='permissions']");
      hiddenInput.value = JSON.stringify(result);

      form.submit();
    });
  }

  // --- Check All ---
  const checkAllInputs = tablePermissions.querySelectorAll("input.check-all");
  checkAllInputs.forEach((input, index) => {
    input.addEventListener("click", () => {
      const isChecked = input.checked;
      const dataRows = tablePermissions.querySelectorAll("tbody tr[data-name]");

      dataRows.forEach((row) => {
        const inputs = row.querySelectorAll("input[type='checkbox']");
        if (inputs[index]) {
          inputs[index].checked = isChecked;
        }
      });
    });
  });
}
