from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from urllib.parse import urlparse 


from utils.entropy_analyzer import calculate_entropy 
from utils.whois_checker import check_domain_age
from utils.link_expander import expand_url 
from utils.ssl_checker import check_ssl_certificate 
from analiz import analyze_url

app = Flask(__name__)
CORS(app) 

def load_json_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)


whitelist = load_json_file('whitelist.json')
norm_rules = load_json_file('normalization_rules.json')

@app.route('/analyze', methods=['POST'])
def handle_analysis():
    data = request.json
    input_url = data.get('url') 
    
    if not input_url:
        return jsonify({"error": "URL gelmedi"}), 400

   
    real_url, was_shortened = expand_url(input_url)

    
    parsed_url = urlparse(real_url)
    domain = parsed_url.netloc or parsed_url.path.split('/')[0]
    
  
    if "127.0.0.1" in domain or "localhost" in domain:
        domain = parsed_url.path.strip('/')
    else:
        
        if domain.startswith("www."):
            domain = domain[4:]
  
    final_result = analyze_url(domain, whitelist, norm_rules)
    
   
    if final_result['risk'] != "Düşük":
        final_result['was_shortened'] = was_shortened
        final_result['real_url'] = real_url
        final_result['entropy_score'] = calculate_entropy(domain)
        
        
        final_result['whois_info'] = {
            "age_days": 0, 
            "is_new": True, 
            "creation_date": "Engellendi", 
            "note": "Tehlikeli domain tespiti sebebiyle WHOIS bypass edildi."
        }
        final_result['ssl_info'] = {
            "has_ssl": False, 
            "error": "Tehlikeli domain tespiti sebebiyle SSL engellendi.", 
            "is_expired": True
        }
        return jsonify(final_result)
   

   
    final_result['entropy_score'] = calculate_entropy(domain)
    final_result['whois_info'] = check_domain_age(domain)
    final_result['ssl_info'] = check_ssl_certificate(domain)
    final_result['was_shortened'] = was_shortened
    final_result['real_url'] = real_url 
    
    return jsonify(final_result)

if __name__ == '__main__':
    app.run(port=5000, debug=True)




