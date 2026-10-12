import requests
from bs4 import BeautifulSoup
import re
from supabase_client import supabase

URL = "https://aarkahospitals.com/our-team/"


def clean(text):
    return re.sub(r"\s+", " ", text).strip()


def is_doctor_name(text):
    text = clean(text)

    return bool(
        re.match(r"^Dr\.?\s", text, re.IGNORECASE)
    )


def scrape_doctors(url):

    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    response = requests.get(
        url,
        headers=headers,
        timeout=30
    )

    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    # Get visible text in page order
    lines = [
        clean(text)
        for text in soup.stripped_strings
        if clean(text)
    ]

    doctors = []

    current_doctor = None
    current_data = []

    for line in lines:

        # Ignore appointment button
        if "MAKE APPOINTMENT" in line.upper():
            if current_doctor:
                doctors.append({
                    "name": current_doctor,
                    "qualification": (
                        current_data[0]
                        if len(current_data) > 0
                        else ""
                    ),
                    "specialization": (
                        current_data[1]
                        if len(current_data) > 1
                        else ""
                    ),
                    "profile_url": None,
                    "source_url": url
                })

            current_doctor = None
            current_data = []
            continue

        # New doctor
        if is_doctor_name(line):

            # Save previous doctor if needed
            if current_doctor:
                doctors.append({
                    "name": current_doctor,
                    "qualification": (
                        current_data[0]
                        if len(current_data) > 0
                        else ""
                    ),
                    "specialization": (
                        current_data[1]
                        if len(current_data) > 1
                        else ""
                    ),
                    "profile_url": None,
                    "source_url": url
                })

            current_doctor = line
            current_data = []

            continue

        # Collect information belonging to current doctor
        if current_doctor:

            # Ignore common website text
            if line in [
                "Our Team's Best Doctors And Specialists",
                "Download Doctors Brochure"
            ]:
                continue

            current_data.append(line)

    # Remove duplicates
    unique = {}

    for doctor in doctors:
        unique[doctor["name"]] = doctor

    return list(unique.values())


if __name__ == "__main__":
    doctors = scrape_doctors(URL)
    print(f"\nDoctors found: {len(doctors)}\n")
    hospital_id = "b4c34c07-64c5-4c90-bcd2-eab83235c4c9"

    for doctor in doctors:
        data = {
            "hospital_id": hospital_id,
            "name": doctor["name"],
            "specialization": doctor["specialization"],
            "qualification": doctor["qualification"],
            "experience": None,
            "department": None,
            "profile_url": doctor["profile_url"],
            "source_url": doctor["source_url"]
        }

        supabase.table("doctors").upsert(
            data,
            on_conflict="hospital_id,name"
        ).execute()

        print("Saved:", doctor["name"])

    print(f"\nSuccessfully saved {len(doctors)} doctors to Supabase.")
