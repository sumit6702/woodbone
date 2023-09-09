$(".m-menu").hide();

$(function () {
  /* ---------------------------- SearchBar Styling --------------------------- */
  const form = $(".searchform");
  const formTrigger = $(".search-trigger");

  function handleFormToggle() {
    form.fadeToggle("slow", "linear");
    formTrigger.toggle();
  }

  function handleDocumentClick(event) {
    if (
      !form.is(event.target) &&
      form.has(event.target).length === 0 &&
      !formTrigger.is(event.target) &&
      formTrigger.has(event.target).length === 0
    ) {
      $("#SearchBar").val("");
      form.fadeOut("slow", "linear", function () {
        $(this).hide();
        formTrigger.show();
      });
    }
  }

  if (window.matchMedia("(min-width: 1024px)").matches) {
    form.hide();
    formTrigger.on("click", handleFormToggle);
    $(document).on("click", handleDocumentClick);
  }
});
/* -------------------------- Mobile Hamburger Menu ------------------------- */
/*
if (window.matchMedia("(max-width: 1024px)").matches) {}
*/
$(".nav-nested-links").hide(400);
$(".nav-links a").on("click", function (i) {
  $(this).siblings(".nav-nested-links").fadeToggle(450);
});

/* ----------------------- Product ACTION FUNCTIONING ----------------------- */
$(function () {
  if ($(window).width() > 1024) {
    productHoverEffect();
  }
});

function productHoverEffect() {
  const product = $(".product-wrapper");

  product.on(
    "mouseenter",
    ".product-link, .product-actions-links, .product-category",
    function () {
      const index = $(this)
        .closest(".product-wrapper")
        .find(".product-actions");
      index.css("opacity", "1");
    }
  );

  product.on(
    "mouseleave",
    ".product-link, .product-actions-links, .product-category",
    function () {
      const index = $(this)
        .closest(".product-wrapper")
        .find(".product-actions");
      index.css("opacity", "0");
    }
  );
}

/* ------------------------- Login page Functionalty ------------------------ */
$(function () {
  let loginForm = $("#loginForm input");
  let singupForm = $("#singupForm input");
  let singuppass = $("#singuppsw");
  let singupConfpass = $("#singupcfpsw");
  inputStyling(loginForm);
  inputStyling(singupForm);

  function inputStyling(input) {
    input.siblings("label").removeClass("centerlabel");
    input.siblings("label").addClass("toplabel");
    input.addClass("border-orange-300");
    input.on("focusin focusout input", function () {
      const inputValue = $(this).val();
      if (inputValue !== "") {
        $(this).siblings("label").removeClass("centerlabel");
        $(this).siblings("label").addClass("toplabel");
        $(this).addClass("border-orange-300");
      } else {
        $(this).siblings("label").removeClass("toplabel");
        $(this).siblings("label").addClass("centerlabel");
        $(this).removeClass("border-red-500");
      }
    });
  }

  // Validation for signup password
  singuppass.on("input", function () {
    let password = $(this).val();
    let passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!passwordRegex.test(password)) {
      $(this).addClass("border-red-500");
    } else {
      $(this).removeClass("border-red-500");
    }
  });

  // Validation for confirmation password
  singupConfpass.on("input", function () {
    let password = singuppass.val();
    let confirmPassword = $(this).val();

    if (password !== confirmPassword) {
      $(this).addClass("border-red-500");
    } else {
      $(this).removeClass("border-red-500");
    }
  });
});

/* --------------------------- SINGLE PRODUCT PAGE -------------------------- */
function initializeTabNavigation(tabLinksSelector, tabsArray) {
  let tabLinks = $(tabLinksSelector);

  // Function to show the specified tab
  function showTab(tabId) {
    tabsArray.forEach((tab) => {
      if ("#" + tabId === tab) {
        $(tab).show();
        let tabElement = $(tab)[0];
        tabElement.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        $(tab).hide();
      }
    });
  }

  tabLinks.on("click", function (e) {
    e.preventDefault();
    let clickedTab = $(this).attr("href").substring(1);
    showTab(clickedTab);
    history.pushState(
      null,
      null,
      window.location.pathname + "?tab=" + clickedTab
    );
  });

  let urlParams = new URLSearchParams(window.location.search);
  let tabParam = urlParams.get("tab");

  if (tabParam) {
    showTab(tabParam);
  } else {
    tabsArray.slice(1).forEach((tab) => $(tab).hide());
  }
}

initializeTabNavigation("#tab-navigation a", [
  "#tab-description",
  "#tab-info",
  "#tab-review",
]);

/* ------------------------------ OverView Page ----------------------------- */
$(function () {
  let currentRange = $("#overview_range .ov_range").eq(0);
  currentRange.addClass("lg:border-blue-500");
  $(".ovtext").text(currentRange.text());
  $("#overview_range .ov_range").on("click", function (e) {
    e.preventDefault();
    currentRange.removeClass("lg:border-blue-500");
    currentRange = $(this).addClass("lg:border-blue-500");
    $(".ovtext").text(currentRange.text());
    $("#overview_range").toggleClass("hidden");
  });
  $("#rangButton").on("click", function () {
    $("#overview_range").toggleClass("hidden");
  });
});

/* ------------------------------ Count Button ------------------------------ */
$(function () {
  $("#productqt").on("input", function (e) {
    let num = $(this).val();
    if (num > 10) {
      $(this).val(10);
    } else if (num < 0) {
      $(this).val(1);
    } else if (num == 0) {
      $(this).val("");
    }
    $(this).on("focusout", () => {
      if ($(this).val() == "") {
        $(this).val(1);
      }
    });
  });
});

/* ------------------------- Contact Form Validation ------------------------ */
$(document).ready(function () {
  $("#contact_form").submit(function (event) {
    $(".form-error").removeClass("border-red-500");

    var message = $("#contact_Message").val().trim();
    var name = $("#contact_Name").val().trim();
    var email = $("#contact_Email").val().trim();

    var isValid = true;

    if (message === "") {
      isValid = false;
      $("#contact_Message").addClass("border-red-500");
      $(".con-error").eq(0).removeClass("hidden");
    } else {
      $("#contact_Message").removeClass("border-red-500");
      $(".con-error").eq(0).addClass("hidden");
    }

    if (name === "") {
      isValid = false;
      $("#contact_Name").addClass("border-red-500");
      $(".con-error").eq(1).removeClass("hidden");
    } else {
      $("#contact_Name").removeClass("border-red-500");
      $(".con-error").eq(1).addClass("hidden");
    }

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === "" || !emailRegex.test(email)) {
      isValid = false;
      $("#contact_Email").addClass("border-red-500");
      $(".con-error").eq(2).removeClass("hidden");
    } else {
      $("#contact_Email").removeClass("border-red-500");
      $(".con-error").eq(2).addClass("hidden");
    }

    if (isValid) {
      location.reload();
    } else {
      isValid = true;
      event.preventDefault();
    }
  });

  $(".form-input").on("focus", function () {
    $(this).siblings("label").addClass("hidden");
  });

  $(".form-input").on("blur", function () {
    if ($(this).val() === "") {
      $(this).siblings("label").removeClass("hidden");
    } else {
      $(this).removeClass("border-red-500");
      $(this).siblings("span").addClass("hidden");
    }
  });
});

//link Disabler
$(document).ready(function () {
  function preventDefaultOnButton(className) {
    $("." + className).on("click", function (event) {
      event.preventDefault();
    });
  }
  preventDefaultOnButton("isDisable");
});

//doubleClick
function handleDoubleClick(link) {
  if ($(link).attr("data-double-click") === "1") {
    window.location.href = $(link).attr("href");
  } else {
    $(link).attr("data-double-click", "1");
    setTimeout(() => {
      $(link).removeAttr("data-double-click");
    }, 500);
  }
}
$(".double-Click").on("click", function (event) {
  handleDoubleClick(this);
  event.preventDefault();
});

$(document).ready(function () {
  const plus = $(".quantity_btn_plus");
  const minus = $(".quantity_btn_minus");

  plus.on("click", function () {
    const quantityInput = $(this).siblings(".quantity-input");
    const currentValue = parseInt(quantityInput.val(), 10);
    quantityInput.val(currentValue + 1);
    if (currentValue >= 4) {
      quantityInput.val(4);
    } else {
      quantityInput.val(currentValue + 1);
    }
  });

  minus.on("click", function () {
    const quantityInput = $(this).siblings(".quantity-input"); // Assuming the input is a sibling
    const currentValue = parseInt(quantityInput.val(), 10);
    if (currentValue > 1) {
      quantityInput.val(currentValue - 1);
    } else {
      quantityInput.val(1);
    }
  });
});

$(function () {
  $(".add_cart").on("click", function (event) {
    event.preventDefault();

    const productIndex = $(this).data("product-index");
    const productId = $(
      ".productId[data-product-index='" + productIndex + "']"
    ).val();
    const productName = $(
      ".productName[data-product-index='" + productIndex + "']"
    ).val();
    const quantity = $(
      ".quantity-input[data-product-index='" + productIndex + "']"
    ).val();

    const newHref = `/add-cart/${productId}/${productName}/${quantity}`;
    window.location.href = newHref;
  });
});

function formatPriceWithCommas(priceElement) {
  const rawPrice = parseInt($(priceElement).text());
  const formattedPrice = new Intl.NumberFormat("hi-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rawPrice);
  $(priceElement).text(formattedPrice);
}

$(function () {
  const priceElements = $(".indian_Price");
  priceElements.each(function () {
    formatPriceWithCommas(this);
  });
});

function formatDate(dateString) {
  const options = { year: "numeric", month: "short", day: "2-digit" };
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", options).replace(/ /g, "-");
}

// ALERT TIMEOUT
setTimeout(() => {
  const commentAlert = document.getElementById("Alert");
  if (commentAlert) {
    commentAlert.style.display = "none";
  }
}, 3000);

/* ------------------------------- NESTED MENU ------------------------------ */
function showActiveDiv(conts, links, actCont) {
  const hash = window.location.hash;
  if (hash) {
    conts.not(hash).hide();
    $(hash).show();
  } else {
    conts.hide();
    actCont.show();
  }

  window.addEventListener("hashchange", showActiveDiv);

  links.click(function (e) {
    e.preventDefault();
    const target = $(this).attr("href");
    conts.hide();
    $(target).show();
    window.location.hash = target;
  });
}
showActiveDiv($(".nestedItems"), $(".nested-links"), $("#adminprofile"));

/* ------------------------- EDIT BUTTON FORM ENABLE ------------------------ */
fromEdit($(".editbtn"), $("#adminprofile form"));
fromEdit($(".editbtn"), $("#adminsecurity form"));

function fromEdit(btn, form) {
  let formInputs = $(form).find("input");
  btn.on("click", function () {
    formInputs.removeAttr("disabled");
  });
  $(window).on("click", function (event) {
    let $target = $(event.target);
    if (!$target.is(btn) && !$target.closest(form).length) {
      formInputs.attr("disabled", true);
    }
  });
}

/* ----------------------------- FORM VALIDATION ---------------------------- */
formValidation($("#adminprofile form"));
formValidation($("#adminsecurity form"));
formValidation($("#adminperf div form"));

function formValidation(form) {
  form.on("submit", function (event) {
    let inputs = $(this).find("input");
    let isValid = true;
    inputs.each(function () {
      if ($(this).val() === "") {
        $(this).addClass("border-red-500");
        isValid = false;
        return false;
      } else {
        $(this).removeClass("border-red-500");
      }
    });

    if (isValid) {
      $(this).submit();
    } else {
      event.preventDefault();
    }
  });
}
