import requests

def expand_url(short_url):
    
    
    shorteners = ["bit.ly", "t.co", "tinyurl.com", "rebrand.ly", "goo.gl"]
    
    is_shortened = any(s in short_url for s in shorteners)
    
    if not is_shortened:
        return short_url, False

    try:
       
        response = requests.head(short_url, allow_redirects=True, timeout=3)
        final_url = response.url
        return final_url, True
    except:
        return short_url, False

