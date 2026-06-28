import math

def calculate_entropy(url):
 
    if not url:
        return 0
    
    
    prob = [float(url.count(c)) / len(url) for c in dict.fromkeys(list(url))]
    
   
    entropy = - sum([p * math.log(p) / math.log(2.0) for p in prob])
    
    return round(entropy, 2)
