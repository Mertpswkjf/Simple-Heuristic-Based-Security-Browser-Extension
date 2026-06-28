
console.log("Siber Farkındalık Eklentisi: Analiz Başlatıldı...");

const currentUrl = window.location.href;


fetch("http://127.0.0.1:5000/analyze", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ url: currentUrl })
})
.then(response => response.json())
.then(data => {
    
    console.log("Backend Analiz Raporu:", data);

   
    if (data.risk !== "Düşük") {
        showWarningBanner(data);
    }
})
.catch(error => {
    console.error("Backend sunucusuna bağlanılamadı! (Lütfen app.py'nin çalıştığından emin olun):", error);
});


function showWarningBanner(data) {
    const banner = document.createElement("div");
    banner.style.cssText = "position:fixed; top:0; left:0; width:100%; background:red; color:white; text-align:center; padding:15px; z-index:999999; font-weight:bold; font-family:sans-serif;";
    banner.innerHTML = `⚠️ DİKKAT: ${data.risk} <br> <small>${data.analiz}</small>`;
    document.body.prepend(banner);
}

