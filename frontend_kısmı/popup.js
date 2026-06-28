const SIBER_SOZLUK = {
    "homograph": {
        baslik: "Kritik Uyarı: Sahte Karakter (IDN Homograph) Tuzağı!",
        aciklama: "Girdiğiniz adres görsel olarak orijinali gibi görünse de aslında Latin alfabesi yerine farklı bir alfabeye (örn. Kiril, Yunanca) ait görsel ikiz karakterler içermektedir. Tarayıcınız arka planda Punycode (xn--) tabanlı sahte bir siteye yönlendirilmiştir.",
        risk: "Bu, sizi aldatmak için tasarlanmış sinsi bir saldırıdır. Orijinal site sanarak girdiğiniz bu sayfada şifreleriniz doğrudan saldırganın eline geçer.",
        tavsiye: "Birincil Önlem: Adresi her zaman adres çubuğuna elle yazın veya önceden kaydettiğiniz yer işaretlerini (bookmarks) kullanın. 2FA (İki Faktörlü Doğrulama) mutlaka aktif edin."
    },
    "typosquatting": { 
        baslik: "Risk: Typosquatting (Yazım Hatası Tuzağı)",
        aciklama: "Girdiğiniz adres, orijinal adresi taklit ediyor. Bu yöntem, kullanıcıların domain yazarken yapabileceği küçük hatalardan (harf eksikliği, klavye komşuluğu) faydalanır.",
        risk: "Bu siteye devam etmeniz durumunda şifreleriniz gizlice saldırgana iletilebilir (Keylogger) veya bilgisayarınızdaki dosyalar şifrelenip rehin alınabilir (Ransomware).",
        tavsiye: "Parola Yönetimi: Her site için farklı ve güçlü bir parola belirleyin. Sık kullandığınız sitelere Google araması yerine yer imlerinizden ulaşın."
    },
    "whois_new": {
        baslik: "İtibar Analizi Uyarısı: Yeni Kayıtlı Alan Adı",
        aciklama: "Bu alan adı çok kısa bir süre önce tescil edilmiş ve hiçbir trafiği yok. Güvenilir kurumlar genellikle yıllardır aynı domaini kullanır.",
        risk: "Geçici olarak açılmış bir dolandırıcılık (Phishing) sayfası olma ihtimali çok yüksektir. Bilgisayarınız zombi ağa (Botnet) dahil edilebilir.",
        tavsiye: "Sitenin iletişim bilgilerini doğrulamadan kesinlikle işlem yapmayın. Tarayıcınızın ve işletim sisteminizin güncel olduğundan emin olun."
    },
    "ssl_missing": {
        baslik: "Dikkat: Bağlantınız Şifreli Değil (HTTPS Yok)!",
        aciklama: "Bağlantı SSL/TLS sertifikası kullanmıyor. Kullanıcı ile sunucu arasındaki tüm trafik 'düz metin' (clear-text) olarak akmaktadır.",
        risk: "Man-in-the-Middle (MiTM - Ortadaki Adam) Saldırısı! Aynı ağdaki bir saldırgan, Sniffing (paket koklama) yöntemiyle parolalarınızı veya kredi kartı bilgilerinizi yoldayken okuyabilir.",
        tavsiye: "Bu sayfada gizli bilgilerinizi KESİNLİKLE paylaşmayın. Siteyi derhal terk edin."
    },
    "high_entropy": {
        baslik: "Sezgisel (Heuristic) Analiz: Şüpheli URL Yapısı",
        aciklama: "URL'de anlamsız karakter dizileri tespit edildi. Global sistemlerde bu, otomatik oluşturulan zararlı sitelerin bir işaretidir.",
        risk: "Kullanıcıdan habersiz çalışan otomatik dosya indirme (Drive-by Download) tehlikesi bulunmaktadır.",
        tavsiye: "Bağlantının sizi götürdüğü asıl adresi teyit etmeden hiçbir butona tıklamayın."
    },
    "shortened_link": {
        baslik: "Dikkat: Maskelenmiş Bağlantı Tespiti",
        aciklama: "Bu bir yönlendirme linki. Saldırganlar, güvenlik filtrelerini atlatmak ve asıl hedeflerini gizlemek için URL kısaltma servislerini kullanabilir.",
        risk: "Gerçek hedef bir Ransomware dağıtım sunucusu veya sahte bir bankacılık arayüzü olabilir.",
        tavsiye: "Bağlantının sizi götürdüğü asıl adresi (aşağıda) kontrol edin."
    }
};



document.addEventListener('DOMContentLoaded', async () => {
    const statusBox = document.getElementById('status-badge');
    const detailsContainer = document.getElementById('details-container');
    
  
    statusBox.innerText = "🔍 Analiz Ediliyor...";
    statusBox.className = "loading";

    try {
       
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        let currentUrl = tab.url;

       
        const response = await fetch("http://127.0.0.1:5000/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: currentUrl })
        });

        const data = await response.json();
        raporuOlustur(data, detailsContainer, statusBox);

    } catch (error) {
        statusBox.innerText = "❌ Bağlantı Hatası";
        statusBox.className = "danger";
        detailsContainer.innerHTML = "<p>Python sunucusuna (app.py) ulaşılamadı. Sunucunun çalıştığından emin olun.</p>";
    }
});


function raporuOlustur(data, container, statusBox) {
    container.innerHTML = ""; 
    let riskBulundu = false;

   
    if (data.risk === "Yüksek" && data.analiz.includes("Karakter Farkı")) {
        container.appendChild(uyariKartiOlustur(SIBER_SOZLUK["homograph"]));
        riskBulundu = true;
    }

    
    if (data.whois_info && data.whois_info.is_new) {
        let ageDict = SIBER_SOZLUK["whois_new"];
        ageDict.aciklama = `Bu site sadece ${data.whois_info.age_days} günlük! Siber saldırganlar oltalama sitelerini hızlıca açıp kapatırlar.`;
        container.appendChild(uyariKartiOlustur(ageDict));
        riskBulundu = true;
    }

   
    if (data.ssl_info && !data.ssl_info.has_ssl) {
        container.appendChild(uyariKartiOlustur(SIBER_SOZLUK["ssl_missing"]));
        riskBulundu = true;
    }

    
    if (data.entropy_score > 4.5) { 
        container.appendChild(uyariKartiOlustur(SIBER_SOZLUK["high_entropy"]));
        riskBulundu = true;
    }

    
    if (data.was_shortened) {
        let shortDict = SIBER_SOZLUK["shortened_link"];
        shortDict.tavsiye = `Gerçek Hedef: ${data.real_url}`;
        container.appendChild(uyariKartiOlustur(shortDict));
        riskBulundu = true;
    }

    
    if (riskBulundu) {
        statusBox.innerText = "⚠️ TEHLİKE TESPİT EDİLDİ";
        statusBox.className = "danger";
    } else {
        statusBox.innerText = "✅ GÜVENLİ GÖRÜNÜYOR";
        statusBox.className = "safe";
        container.innerHTML = `<p style="padding:10px; color:#2e7d32;">Sistemlerimiz bu adreste belirgin bir güvenlik tehdidi tespit etmedi. Yine de kişisel bilgilerinizi paylaşırken dikkatli olun.</p>`;
    }
}


function uyariKartiOlustur(sozlukMaddesi) {
    const card = document.createElement('div');
    card.className = "warning-card"; 
    
    card.innerHTML = `
        <h4 class="card-title">${sozlukMaddesi.baslik}</h4>
        <p class="card-desc"><strong>Neden Riskli?</strong> ${sozlukMaddesi.aciklama}</p>
        <p class="card-risk"><strong>Tehlike:</strong> ${sozlukMaddesi.risk}</p>
        <p class="card-tip">🛡️ <strong>Çözüm:</strong> ${sozlukMaddesi.tavsiye}</p>
    `;
    return card;
}











