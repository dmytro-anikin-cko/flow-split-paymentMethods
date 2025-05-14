let selectedMethod = null;
let component = null;
let checkout;
let paymentSession;

const flowContainer = document.getElementById("flow-container");
const sessionStatus = document.getElementById("session-status");
const loader = document.getElementById("loader");

(async () => {
  const createPaymentSession = async () => {
    try {
      const response = await fetch("/api/get-payment-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.json();
    } catch (error) {
      console.error("❌ Error fetching payment session:", error);
      loader.innerHTML = `<span class="text-red-600">❌ Network error while loading payment session.</span>`;
      return null;
    }
  };
  loader.classList.remove("hidden");
  paymentSession = await createPaymentSession();

  if (!paymentSession || !paymentSession.id) {
    loader.innerHTML = `<span class="text-red-600">❌ Failed to initialize a valid payment session.</span>`;
    return;
  }

  loader.classList.add("hidden");
  sessionStatus.textContent = `✅ Your Payment Session ID is: ${paymentSession.id}`;
  sessionStatus.classList.remove("hidden");
})();

const initFlow = async (method) => {
  // Guarding initFlow against missing session
  if (!paymentSession || !paymentSession.id) {
    alert("Payment session not ready yet. Please wait...");
    return;
  }
  // Clear previous component
  console.log("Old Component", component);
  if (component) {
    component.unmount();
  }

  checkout = await CheckoutWebComponents({
    publicKey: "pk_sbox_guri7tp655hvceb3qaglozm7gee",
    paymentSession,
    onError: (_, error) => console.error(error),
    environment: "sandbox",
  });

  component = checkout.create(method);

  console.log("New Component", component);

  if (await component.isAvailable()) {
    console.log("Available✅");
    component.mount(flowContainer);
  } else {
    console.log("Not Available❌");
    alert(`${method} is not available`);
  }
};

document.querySelectorAll('input[name="payment-method"]').forEach((input) => {
  input.addEventListener("change", async (e) => {
    selectedMethod = e.target.value;
    await initFlow(selectedMethod);
  });
});
