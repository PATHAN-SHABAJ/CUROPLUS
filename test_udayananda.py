import requests
from bs4 import BeautifulSoup

url = "https://udayanandahospitals.com/doctors/"
response = requests.get(
    url,
    headers={"User-Agent": "Mozilla/5.0"},
    timeout=20
)
print("Status:", response.status_code)

soup = BeautifulSoup(response.text, "html.parser")

for heading in soup.find_all(["h2", "h3", "h4"]):
    name = heading.get_text(" ", strip=True)
    link = heading.find("a") or heading.find_next("a", href=True)
    if name and "dr" in name.lower():
        print("Doctor:", name)
        if link and link.get("href"):
            print("Profile:", link["href"])
