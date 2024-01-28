//console.log("Sending Analytics here ..");
const timeId = setInterval(
    () => console.log("Sending Analytics here .."),
    1000
  );
  const stopAnalyticsBtn = document.getElementById("stop-analytics-btn").addEventListener("click", stopAnalytics);
  function stopAnalytics() {
    clearInterval(timeId);
  }
  