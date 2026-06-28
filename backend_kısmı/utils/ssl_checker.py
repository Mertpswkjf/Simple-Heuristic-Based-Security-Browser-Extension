import ssl
import socket
from datetime import datetime

def check_ssl_certificate(domain):
   
    context = ssl.create_default_context()
    try:
        
        with socket.create_connection((domain, 443), timeout=3) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as sslsock:
                cert = sslsock.getpeercert()
                
                
                expire_date_str = cert['notAfter']
                expire_date = datetime.strptime(expire_date_str, '%b %d %H:%M:%S %Y %Z')
                
                today = datetime.now()
                remaining_days = (expire_date - today).days
                
                return {
                    "has_ssl": True,
                    "is_expired": remaining_days <= 0,
                    "remaining_days": remaining_days,
                    "issuer": dict(x[0] for x in cert['issuer'])['commonName']
                }
    except Exception as e:
       
        return {
            "has_ssl": False,
            "error": "SSL sertifikası bulunamadı veya geçersiz.",
            "is_expired": True
        }

