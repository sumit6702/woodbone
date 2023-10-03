  // This is your test publishable API key.
  const stripe = Stripe(
    "pk_test_51NhGQXSE3VYygnJx2q16yxj36NnhyMoPUnfC4wX4eqjcFDjfg7C4zdnXIycbzYCCan7hGFFTDKXYh0Hr4UgYEquH00EAumMGdt"
  );

  /* ------------------- The items the customer wants to buy ------------------ */
  const items = [{ id: "xl-tshirt" }];
  const total = document.querySelector("input[name='totalprice']").value;
  const userEmail = document.querySelector("input[name='useremail']").value;
  const userdefaultAdd = document.querySelector("input[name='userdefaultAdd']").value;
  const userInfo = document.querySelector("input[name='userInfo']").value;
  const userproductsId = document.querySelectorAll("input[name='userproductsId']");
  const userproductsname = document.querySelectorAll("input[name='userproductsname']");
  const userproductsPrice = document.querySelectorAll("input[name='userproductsPrice']");
  const userquantity = document.querySelectorAll("input[name='userquantity']");

  const products = Array.from(userproductsId).map((element, index) => ({
    productId: element.value,
    productName: userproductsname[index].value,
    productQuantity: Number(userquantity[index].value),
    productPrice: Number(userproductsPrice[index].value),
  }));
  const metadata = {
    totalprice: total,
    useremail: userEmail,
    userAddress:userdefaultAdd,
    userproducts: JSON.stringify(products),
    userid:userInfo,
    items: products.productName,
  };

  async function postData(url = "", data) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }


  /* --------------------------- Stripe Payment Code -------------------------- */
  initialize();
  checkStatus();
  document.querySelector("#payment-form").addEventListener("submit", handleSubmit);

  let emailAddress = "";
  async function initialize() {
    const response = await fetch("/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metadata }),
    });
    const { clientSecret } = await response.json();

    const appearance = {
      theme: "flat",
      variables: {
        colorPrimary: '#00d1ce',
      },
    };
    elements = stripe.elements({ appearance, clientSecret });

    const linkAuthenticationElement = elements.create("linkAuthentication");
    linkAuthenticationElement.mount("#link-authentication-element");

    linkAuthenticationElement.on("change", (event) => {
      emailAddress = event.value.email;
    });

    const paymentElementOptions = {
      layout: "tabs",
    };

    const paymentElement = elements.create("payment", paymentElementOptions);
    paymentElement.mount("#payment-element");

  }
  const currentLocation = window.location;
  const baseUrl = `${currentLocation.protocol}//${currentLocation.hostname}:${currentLocation.port}`;
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${baseUrl}/orders?metadata=${encodeURIComponent(JSON.stringify(metadata))}`,
        receipt_email: metadata.useremail,
      },
    });
    if (error.type === "card_error" || error.type === "validation_error") {
      showMessage(error.message);
    } else {
      showMessage("An unexpected error occurred.");
    }
  
    setLoading(false);
  }

  // Fetches the payment intent status
  async function checkStatus() {
    console.log()
    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      console.log("No Client Secret!");
      return;
    }

    const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

    switch (paymentIntent.status) {
      case "succeeded":
        postData("/payment_Sucessfull", metadata).then((data) => {
          console.log(data);
        });
        console.log("succeeded!");
        break;
      case "processing":
        showMessage("Your payment is processing.");
        console.log("Your payment is processing.");
        break;
      case "requires_payment_method":
        showMessage("Your payment was not successful, please try again.");
        break;
      default:
        showMessage("Something went wrong.");
        break;
    }
  }

  // ------- UI helpers -------

  function showMessage(messageText) {
    const messageContainer = document.querySelector("#payment-message");

    messageContainer.classList.remove("hidden");
    messageContainer.textContent = messageText;

    setTimeout(function () {
      messageContainer.classList.add("hidden");
      messageContainer.textContent = "";
    }, 4000);
  }

  // Show a spinner on payment submission
  function setLoading(isLoading) {
    if (isLoading) {
      // Disable the button and show a spinner
      document.querySelector("#submit").disabled = true;
      document.querySelector("#spinner").classList.remove("hidden");
      document.querySelector("#button-text").classList.add("hidden");
    } else {
      document.querySelector("#submit").disabled = false;
      document.querySelector("#spinner").classList.add("hidden");
      document.querySelector("#button-text").classList.remove("hidden");
    }
  }
