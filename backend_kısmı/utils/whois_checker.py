import whois
from datetime import datetime

def check_domain_age(domain):
    
    try:
      
        domain_info = whois.whois(domain)
        creation_date = domain_info.creation_date

      
        if isinstance(creation_date, list):
            creation_date = creation_date[0]

        if creation_date:
            today = datetime.now()
            age = (today - creation_date).days
            return {
                "age_days": age,
                "is_new": age < 30, 
                "creation_date": str(creation_date)
            }
    except:
        return {"error": "WHOIS bilgisi alınamadı", "is_new": False}
    
    return {"is_new": False}

