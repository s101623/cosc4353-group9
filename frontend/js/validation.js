// Shared client-side validation for every QueueSmart form.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fieldLabel(input) {
  const label = document.querySelector('label[for="' + input.id + '"]');
  return label ? label.textContent.replace(":", "").trim() : input.name;
}

// validtion checks, returns errors
function checkField(input) {
  const value = input.value.trim();
  const label = fieldLabel(input);

  if (input.required && value === "") {
    return label + " is required.";
  }
  if (value === "") {
    return "";
  }

  const minLength = input.getAttribute("minlength");
  const maxLength = input.getAttribute("maxlength");
  if (minLength && value.length < Number(minLength)) {
    return label + " must be at least " + minLength + " characters.";
  }
  if (maxLength && value.length > Number(maxLength)) {
    return label + " must be at most " + maxLength + " characters.";
  }

  if (input.pattern && !new RegExp("^(?:" + input.pattern + ")$").test(value)) {
    return input.title || label + " is not in the right format.";
  }

  if (input.type === "email" && !EMAIL_PATTERN.test(value)) {
    return "Enter a valid email address (example: name@example.com).";
  }

  if (input.type === "number") {
    const number = Number(value);
    if (isNaN(number)) {
      return label + " must be a number.";
    }
    if (input.min !== "" && number < Number(input.min)) {
      return label + " must be at least " + input.min + ".";
    }
    if (input.max !== "" && number > Number(input.max)) {
      return label + " must be at most " + input.max + ".";
    }
  }

  if (input.type === "date") {
    // Date inputs give "YYYY-MM-DD", so string comparison works for min/max.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || isNaN(Date.parse(value))) {
      return label + " must be a valid date.";
    }
    if (input.min && value < input.min) {
      return label + " cannot be before " + input.min + ".";
    }
    if (input.max && value > input.max) {
      return label + " cannot be after " + input.max + ".";
    }
  }

  // Bounds for DOB input
  if (input.dataset.format === "mm/dd/yyyy") {
    const isoDate = mdyToIso(value);
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      return label + " must be in MM/DD/YYYY format.";
    }
    if (!isoDate) {
      return label + " must be a real date.";
    }
    const today = todayString();
    if (input.dataset.min && isoDate < input.dataset.min) {
      return label + " cannot be before " + isoToMdy(input.dataset.min) + ".";
    }
    if (input.dataset.max && isoDate > input.dataset.max) {
      return label + " cannot be after " + isoToMdy(input.dataset.max) + ".";
    }
    if (input.dataset.beforeToday !== undefined && isoDate >= today) {
      return label + " must be before today's date.";
    }
    const minAge = Number(input.dataset.minAge);
    if (minAge) {
      // The birthday that many years later must be today or earlier.
      const birthdayAtMinAge = (Number(isoDate.slice(0, 4)) + minAge) + isoDate.slice(4);
      if (birthdayAtMinAge > today) {
        return "You must be at least " + minAge + " years old to create an account.";
      }
    }
  }

  return "";
}

// "MM/DD/YYYY" to "YYYY-MM-DD", or "" if it isn't a real calendar date
function mdyToIso(value) {
  const parts = value.split("/");
  if (parts.length !== 3) {
    return "";
  }
  const month = Number(parts[0]);
  const day = Number(parts[1]);
  const year = Number(parts[2]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return "";
  }
  return parts[2] + "-" + parts[0] + "-" + parts[1];
}

function isoToMdy(value) {
  const parts = value.split("-");
  return parts[1] + "/" + parts[2] + "/" + parts[0];
}

// only accept digits, add / to MM/DD/YYY format
function attachDateMask(input) {
  input.addEventListener("input", function () {
    const digits = input.value.replace(/\D/g, "").slice(0, 8);
    let formatted = digits.slice(0, 2);
    if (digits.length > 2) formatted += "/" + digits.slice(2, 4);
    if (digits.length > 4) formatted += "/" + digits.slice(4);
    input.value = formatted;
  });
}

// Today as "YYYY-MM-DD" in local time, for dates that cannot be in the future.
function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}

function showFieldError(input, message) {
  const errorSpan = document.getElementById(input.id + "-error");
  if (errorSpan) {
    errorSpan.textContent = message;
  }
  input.setAttribute("aria-invalid", message ? "true" : "false");
}

// validates every input in the form and shows messages
function validateForm(form) {
  let isValid = true;
  const inputs = form.querySelectorAll("input, select, textarea");
  inputs.forEach(function (input) {
    const message = checkField(input);
    showFieldError(input, message);
    if (message) {
      isValid = false;
    }
  });
  return isValid;
}

// re-checks a field, clears errors while typing.
function attachLiveValidation(form) {
  const inputs = form.querySelectorAll("input, select, textarea");
  inputs.forEach(function (input) {
    if (input.dataset.format === "mm/dd/yyyy") {
      attachDateMask(input);
    }
    if (input.dataset.format === "digits") {
      // number-only fields (e.g. driver's license): drop anything that isn't a digit
      input.addEventListener("input", function () {
        input.value = input.value.replace(/\D/g, "");
      });
    }
    input.addEventListener("blur", function () {
      showFieldError(input, checkField(input));
    });
    input.addEventListener("input", function () {
      showFieldError(input, "");
    });
  });
}
