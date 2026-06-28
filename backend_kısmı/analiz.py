import idna
import json

def visual_normalization(url, mapping):
  
    for search, replace in mapping.items():
        url = url.replace(search, replace)
    return url

def calculate_levenshtein(s1, s2):
   
    if len(s1) < len(s2):
        return calculate_levenshtein(s2, s1)
    if len(s2) == 0:
        return len(s1)
        
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]

def analyze_url(user_url, whitelist, norm_rules):
   
    is_homograph = False
    display_url = user_url
    
 
    if "xn--" in user_url:
        try:
            display_url = idna.decode(user_url)
            is_homograph = True
        except:
            pass 

  
    normalized_url = visual_normalization(display_url, norm_rules)


    for target in whitelist:
        
       
        if is_homograph and display_url == target:
            return {
                "risk": "Kritik: Sahte Karakter (Unicode) Tuzağı!",
                "analiz": f"Girdiğiniz adres görsel olarak {target} gibi görünse de farklı bir alfabeye (Unicode) ait.",
                "neden": "Sinsi bir Homograph saldırısıdır. Kullanıcıyı aldatmak için görsel ikiz karakterler kullanılmıştır."
            } 

        if normalized_url == target:
            if display_url != target:
                return {
                    "risk": "Tehlike: Görsel Karakter Tuzağı (Typosquatting)",
                    "analiz": f"Girdiğiniz {display_url} adresi, orijinal {target} markasını taklit ediyor.",
                    "neden": "Karakter benzerliği (Örn: 0-o, rn-m, 1-l) kullanılarak oluşturulmuş sahte adres."
                }
            else:
                
                return {"risk": "Düşük", "analiz": "Güvenli site."}

        
        if len(target) > 5:
            distance = calculate_levenshtein(normalized_url, target)
            
            if 1 <= distance <= 2:
                return {
                    "risk": "Tehlike: Typosquatting (Yazım Hatası Tuzağı)",
                    "analiz": f"Girdiğiniz '{user_url}', orijinal '{target}' adresini taklit ediyor olabilir.",
                    "neden": f"Orijinal marka adından sadece {distance} harf farklı/fazla yazılmış. Bu bir oltalama tuzağı olabilir."
                }

   
    return {"risk": "Düşük", "analiz": "Yerel süzgeçlerden başarıyla geçti, şüpheli imza bulunamadı."}



