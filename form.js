
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("bookingForm");
  const totalDisplay = document.getElementById("total");

  const basePrices = {
    standard: [90, 115, 140, 165, 190, 215, 240, 265, 290],
    deep:     [120, 145, 170, 195, 220, 245, 270, 295, 320],
    move:     [150, 180, 210, 240, 270, 300, 330, 360, 390],
    post:     [100, 130, 160, 190, 220, 250, 280, 310, 340],
  };

  const roomRates = {
    standard: { bed: 10, bath: 10, half: 5 },
    deep:     { bed: 20, bath: 20, half: 10 },
    move:     { bed: 20, bath: 20, half: 10 },
    post:     { bed: 15, bath: 15, half: 10 },
  };

  const extrasPrices = { fridge: 30, oven: 30, cabinets: 30, pet: 20 };

  function getBasePrice(serviceType, sqftRange) {
    const index = [
      "0-999", "1000-1500", "1501-2000", "2001-2500", "2501-3000",
      "3001-3500", "3501-4000", "4001-4500", "4501-5000"
    ].indexOf(sqftRange);
    return basePrices[serviceType]?.[index] ?? 0;
  }

  function calculateTotal() {
    const serviceType = form.serviceType.value;
    const sqft = form.squareFeet.value;
    const bedrooms = parseInt(form.bedrooms.value || 0);
    const bathrooms = parseInt(form.bathrooms.value || 0);
    const halfBaths = parseInt(form.halfBaths.value || 0);

    const base = getBasePrice(serviceType, sqft);
    const rates = roomRates[serviceType] || { bed: 0, bath: 0, half: 0 };

    let total = base;
    total += bedrooms * rates.bed;
    total += bathrooms * rates.bath;
    total += halfBaths * rates.half;

    const extras = form.querySelectorAll("input[name='extras']:checked");
    extras.forEach(extra => {
      total += extrasPrices[extra.value] || 0;
    });

    totalDisplay.textContent = `$${total.toFixed(2)}`;
  }

  form.addEventListener("change", calculateTotal);
  form.addEventListener("input", calculateTotal);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());
    payload.extras = [...form.querySelectorAll("input[name='extras']:checked")].map(e => e.value);
    payload.total = totalDisplay.textContent;

    fetch("https://hooks.zapier.com/hooks/catch/your_webhook_url_here", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(res => res.ok ? alert("Booking submitted!") : alert("Error submitting form."))
      .catch(() => alert("Failed to connect to booking system."));
  });
});
