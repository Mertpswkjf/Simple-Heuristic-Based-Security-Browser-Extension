Simple Heuristic-Based Security Browser Extension

Projenin Amacı ve Felsefesi: "İnsanı Patch'lemek"
Günümüz siber güvenlik ekosisteminde, milyon dolarlık EDR, SIEM ve IDS çözümlerine rağmen en zayıf halka "insan faktörüdür".
Saldırganlar teknolojik güvenlik duvarlarını aşmak yerine, sosyal mühendislik ve oltalama (phishing) taktikleriyle doğrudan kullanıcıyı hedef almaktadır.

Bu proje; geleneksel imza tabanlı (kara liste) antivirüs mantığı yerine, sezgisel (heuristic) algoritmalarla çalışan yerel bir analiz altyapısı sunar.
Amacım sadece zararlı bir URL'i otomatik engellemek değil, tehlikenin arkasındaki matematiksel ve mantıksal riskleri kullanıcıya şeffaf bir şekilde göstererek "kullanıcının siber farkındalığını" artırmaktır.

Mimari Tasarım Yaklaşımı (Pasif Analiz Motoru)
Eklenti, aktif bir satır içi ağ engelleyici olarak değil, bir Pasif Güvenlik Danışmanı ve Uyarı Sistemi olarak kurgulanmıştır.
Sayfa yüklendiğinde URL yapısını arka planda yakalar ve tarayıcının doğal işleyişini/hızını kesmeden kullanıcıyı bilinçlendirmek adına sezgisel bir uyarı başlığı görüntüler.
Bu yaklaşım, kullanıcının tehlikeyi görerek öğrenmesini amaçlar.

Çok Katmanlı Sezgisel Mimari (Mühendislik Yaklaşımı)
Sistem, tarayıcı katmanından gelen her bir URL'i yerel Flask backend sunucusu üzerinden 4 farklı mantıksal filtreden geçirerek risk analizi yapar:

IDN Homograph ve Punycode Analizi: Saldırganların farklı alfabelerdeki görsel ikiz harfleri (Unicode) kullanarak marka taklidi yapmasını engeller 
Typosquatting ve Görsel Normalizasyon: Karakter benzerliği kullanılarak (Örn: rn-m ) oluşturulan sahte domainleri normalize eder ve Levenshtein Mesafesi algoritması ile marka taklidini tespit eder.
Shannon Entropisi (Rastgelelik Ölçümü): DGA (Domain Generation Algorithm) botları veya saldırganlar tarafından rastgele türetilen anlamsız, yüksek kararsızlığa sahip oltalama linklerini matematiksel formülle hesaplar.
Domain İtibarı (WHOIS & SSL): Sitenin aktif kalma süresini ve SSL sertifikasının geçerlilik durumunu kontrol ederek taze açılmış oltalama sitelerini yakalar.

Performans Optimizasyonu: Sistem yükünü optimize etmek amacıyla; eğer bir URL ilk katmanlarda kritik tehlike olarak işaretlenirse,
ağ trafiğini yormamak adına WHOIS ve SSL network sorguları otomatik olarak bypass edilir.


Kullanılan Teknolojiler & Bağımlılıklar
Front-End: Vanilla JavaScript (Chrome Extension Manifest v3), HTML5, CSS3
Back-End: Python 3.x, Flask, Flask-CORS
Algoritmalar: Levenshtein Distance, Shannon Entropy
Temel Kütüphaneler: python-whois, idna, requests



Mevcut Kısıtlar ve Proje Durumu
Bu çalışma, siber savunma mekanizmalarını test etmek ve kavram kanıtı sağlamak amacıyla geliştirilmiş bağımsız bir Kavram Kanıtı (PoC - Proof of Concept) ve MVP projesidir.
Projenin temel hedeflerine ulaşılmış ve anlık geliştirme süreci nihayete erdirilerek proje rafa kaldırılmıştır.

Ticari veya endüstriyel ölçekte büyük bir ağda kullanılmasını sınırlandıran mevcut kısıtları şunlardır:
Static Whitelist: Güvenilir alan adları yerel bir JSON dosyasında statik olarak tutulmaktadır.
Ölçeklenebilir bir üretim  ortamında bu listenin dinamik ve anlık güncellenen güvenli bir bulut istihbarat veritabanından çekilmesi mimari bir gerekliliktir.

Network Overhead: Filtreleri geçen temiz siteler için yapılan canlı WHOIS ve SSL sorguları senkronize (eş zamanlı) çalıştığı için,
ağ gecikmelerine veya timeout sürelerine bağlı performans kayıpları yaratabilir. Üretim seviyesinde asenkron çalışan bir arka plan önbellekleme (caching) mimarisi entegre edilmelidir.

Root Domain Parsing: URL üzerinden alan adı ayıklama mantığı temel seviyededir.
Gelişmiş oltalama senaryolarındaki karmaşık subdomain manipülasyonlarını (Örn: www.google.com.hacker.com) tam isabetle yakalamak için
sisteme ileri düzey Regex kuralları ve kök alan adı ayrıştırıcı kütüphaneler eklenmelidir.

Not: Bu projenin temel amacı son kullanıcıya yönelik ticari bir yazılım ürünü geliştirmek değil;
siber atak vektörlerinin zafiyet mantıklarının ve sezgisel savunma mekanizmalarının pratik koda dökülme süreçlerini simüle etmektir.



Kurulum ve Yerel Canlı Test
Proje, yerel bir analiz ortamı (sandbox) simülasyonu şeklinde kurgulanmıştır. Kaynak kodları cihazınızda test etmek için aşağıdaki adımları takip edebilirsiniz:

1. Backend Sunucusunun Ayağa Kaldırılması
Analiz motorunun çalışabilmesi için öncelikle Python bağımlılıklarının yüklenmesi ve Flask sunucusunun yerel ortamda (127.0.0.1:5000) başlatılması gerekir:
Repoyu yerel ortamınıza klonlayın ve proje dizinine giriş yapın.
Gerekli bağımlılıkları yükleyin: pip install Flask Flask-Cors python-whois idna requests
Sunucuyu çalıştırın: python app.py

2. Tarayıcı Eklentisinin (Front-End) Aktif Edilmesi
Geliştirilen pasif uyarı arayüzünü tarayıcıya entegre etmek için:
Chromium tabanlı tarayıcınızdan (Chrome, Brave, Edge vb.) chrome://extensions/ sayfasına gidin.
Sağ üst köşede yer alan "Geliştirici Modu" (Developer Mode) seçeneğini aktif hale getirin.
Sol üstte beliren "Paketlenmemiş öğe yükle" (Load unpacked) butonuna tıklayın.
Proje klasörünün içerisindeki, manifest.json dosyasının yer aldığı Front-End dizinini seçerek yüklemeyi tamamlayın.






