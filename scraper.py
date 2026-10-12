import requests
from bs4 import BeautifulSoup
import re
import time

from config import HOSPITALS
from supabase_client import supabase


# =========================================================
# COMMON HELPERS
# =========================================================

def clean(text):
    if not text:
        return ""

    text = text.replace("\xa0", " ")
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def is_doctor_name(text):
    text = clean(text)

    return bool(
        re.match(r"^Dr\.?\s*", text, re.IGNORECASE)
    )


def make_absolute_url(href):
    if not href:
        return ""

    href = href.strip()

    if href.startswith("//"):
        return "https:" + href

    if href.startswith("/"):
        return "https://www.kimshospitals.com" + href

    return href


# =========================================================
# HOSPITAL
# =========================================================

def get_or_create_hospital(hospital, city):

    result = (
        supabase
        .table("hospitals")
        .select("id")
        .eq("name", hospital["name"])
        .eq("city", city)
        .execute()
    )

    if result.data:
        print("Hospital already exists in Supabase.")
        return result.data[0]["id"]

    data = {
        "name": hospital["name"],
        "city": city,
        "state": "Andhra Pradesh",
        "website_url": hospital["website"],
        "source_url": (
            hospital.get("doctor_url")
            or hospital.get("specialty_url")
        )
    }

    result = (
        supabase
        .table("hospitals")
        .insert(data)
        .execute()
    )

    hospital_id = result.data[0]["id"]

    print("Hospital created automatically in Supabase.")

    return hospital_id


# =========================================================
# AARKA / ASHWINI
# =========================================================

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

    soup = BeautifulSoup(
        response.text,
        "html.parser"
    )

    lines = [
        clean(text)
        for text in soup.stripped_strings
        if clean(text)
    ]

    doctors = []

    current_doctor = None
    current_data = []

    for line in lines:

        # ----------------------------------
        # Appointment button
        # ----------------------------------

        if "MAKE APPOINTMENT" in line.upper():

            if current_doctor:
                doctors.append(
                    create_doctor(
                        current_doctor,
                        current_data,
                        url
                    )
                )

            current_doctor = None
            current_data = []

            continue

        # ----------------------------------
        # New doctor
        # ----------------------------------

        if is_doctor_name(line):

            if current_doctor:
                doctors.append(
                    create_doctor(
                        current_doctor,
                        current_data,
                        url
                    )
                )

            current_doctor = line
            current_data = []

            continue

        # ----------------------------------
        # Doctor information
        # ----------------------------------

        if current_doctor:

            if line in [
                "Our Team's Best Doctors And Specialists",
                "Download Doctors Brochure"
            ]:
                continue

            current_data.append(line)

    # --------------------------------------
    # Save last doctor
    # --------------------------------------

    if current_doctor:
        doctors.append(
            create_doctor(
                current_doctor,
                current_data,
                url
            )
        )

    # --------------------------------------
    # Remove duplicates
    # --------------------------------------

    unique = {}

    for doctor in doctors:
        unique[doctor["name"]] = doctor

    return list(unique.values())


# =========================================================
# UNIVERSAL DOCTOR PROFILE DISCOVERY
# =========================================================
from urllib.parse import urljoin, urlparse


def scrape_universal_doctors(url):
    print("DEBUG: UNIVERSAL SCRAPER RUNNING")
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers, timeout=30)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    doctors = []
    seen = set()
    current_department = ""

    for heading in soup.find_all(["h2", "h3", "h4"]):
        name = clean(heading.get_text(" ", strip=True))
        name_lower = name.lower()

        # Track department headings
        if "team" in name_lower:
            current_department = name_lower.replace("team", "").strip().title()
            continue

        # Accept doctor headings only
        if not (
            name_lower.startswith("dr")
            or "doctor" in name_lower
        ):
            continue

        if len(name) > 100:
            continue

        # Find the doctor's card and nearby details
        card = heading.parent
        profile_url = None
        qualification = ""
        specialization = ""

        for parent in heading.parents:
            if parent.name in ("body", "html"):
                break

            parent_text = clean(parent.get_text(" ", strip=True))

            # Stop at a reasonably small container with qualification text
            if len(parent_text) > 1000:
                continue

            card = parent
            break

        if card:
            card_text = clean(card.get_text(" ", strip=True))

            # Extract qualification from text near the doctor's name
            text_after_name = card_text.replace(name, "", 1).strip()

            qualification_match = re.search(
                r"\b(MBBS|MD|MS|DM|DNB|M\.D\.|M\.S\.|Ph\.D\.|BDS)\b.*",
                text_after_name,
                re.IGNORECASE
            )

            if qualification_match:
                qualification = qualification_match.group(0).strip()
                qualification = qualification.split("View More")[0].strip()

            # Find an individual profile link
            for link in card.find_all("a", href=True):
                href = link["href"].strip()
                link_text = clean(link.get_text(" ", strip=True))

                if (
                    href
                    and not href.startswith("#")
                    and not href.lower().startswith("javascript:")
                    and (
                        name.lower() in link_text.lower()
                        or "dr-" in href.lower()
                        or "doctor" in href.lower()
                        or "profile" in href.lower()
                    )
                ):
                    candidate_url = urljoin(url, href)

                    if candidate_url.rstrip("/") != url.rstrip("/"):
                        profile_url = candidate_url
                        break

        # Remove navigation words accidentally captured as specialization
        invalid_specializations = {
            "home",
            "psychiatry team",
            "cardiology team",
            "view more info",
            "view profile",
            "read more",
        }

        if specialization.lower() in invalid_specializations:
            specialization = ""

        key = name.lower()

        if key not in seen:
            seen.add(key)
            doctors.append({
                "name": name,
                "department": current_department,
                "qualification": qualification,
                "specialization": specialization,
                "experience": None,
                "profile_url": profile_url,
                "source_url": url
            })

    return doctors


# =========================================================
# CREATE AARKA / ASHWINI DOCTOR
# =========================================================

def create_doctor(name, data, url):

    data = [
        item
        for item in data
        if item
    ]

    department = ""
    qualification = ""
    specialization = ""

    # --------------------------------------
    # Ashwini structure
    # --------------------------------------

    ashwin_departments = [
        "Obstetrics & Gynaecology",
        "Paediatrics",
        "Gastroenterology & Hepatalogy",
        "Pulmonology",
        "Radiology",
        "Critical Care"
    ]

    if data and data[0] in ashwin_departments:

        department = data[0]

        if len(data) >= 2:
            qualification = data[1]

        specialization = department

    # --------------------------------------
    # Aarka structure
    # --------------------------------------

    else:

        if len(data) >= 1:
            qualification = data[0]

        if len(data) >= 2:
            specialization = data[1]

    return {
        "name": name,
        "department": department,
        "qualification": qualification,
        "specialization": specialization,
        "experience": None,
        "profile_url": None,
        "source_url": url
    }


# =========================================================
# MEDICOVER
# =========================================================

def get_medicover_profile(url):
    headers = {
        "User-Agent": (
            "Mozilla/5.0 "
            "(Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 "
            "(KHTML, like Gecko) "
            "Chrome/155.0.0.0 Safari/537.36"
        )
    }
    try:
        response = requests.get(
            url,
            headers=headers,
            timeout=30
        )
        response.raise_for_status()
        soup = BeautifulSoup(
            response.text,
            "html.parser"
        )
        lines = [
            clean(text)
            for text in soup.stripped_strings
            if clean(text)
        ]
        return lines
    except Exception as error:
        print(
            f"Medicover profile failed: {error}"
        )
        return None


def scrape_medicover_profile(url, existing_qualification="", existing_experience=None, existing_specialization=""):
    if not url:
        return {
            "qualification": existing_qualification,
            "experience": existing_experience,
            "specialization": existing_specialization
        }

    lines = get_medicover_profile(url)
    if not lines:
        return {
            "qualification": existing_qualification,
            "experience": existing_experience,
            "specialization": existing_specialization
        }

    qualification = existing_qualification
    experience = existing_experience
    specialization = existing_specialization

    for i, line in enumerate(lines):
        line_lower = line.lower()
        if ("qualification" in line_lower or "education" in line_lower) and not qualification:
            if i + 1 < len(lines):
                qualification = lines[i + 1]
        elif ("experience" in line_lower) and not experience:
            if i + 1 < len(lines):
                experience = lines[i + 1]

    return {
        "qualification": qualification,
        "experience": experience,
        "specialization": specialization
    }


# =========================================================
# MEDICOVER DOCTOR LISTING
# =========================================================

def scrape_medicover_doctors(url):
    """
    Get Kurnool doctors directly from Medicover's
    doctor_search API.

    The Kurnool page sends:
        POST /apis/doctor_search

    Payload:
        {
            "location": "Kurnool",
            "speciality": ""
        }
    """

    api_url = "https://www.medicoverhospitals.in/apis/doctor_search"

    headers = {
        "User-Agent": (
            "Mozilla/5.0 "
            "(Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 "
            "(KHTML, like Gecko) "
            "Chrome/155.0.0.0 Safari/537.36"
        ),
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Referer": url,
        "Origin": "https://www.medicoverhospitals.in"
    }

    payload = {
        "location": "Kurnool",
        "speciality": ""
    }

    print("\nLoading Medicover Kurnool doctors from API...")

    try:
        response = requests.post(
            api_url,
            headers=headers,
            json=payload,
            timeout=30
        )

        response.raise_for_status()

        data = response.json()

    except requests.RequestException as error:
        print(f"Medicover API request failed: {error}")
        return []

    except ValueError as error:
        print(f"Medicover API returned invalid JSON: {error}")
        return []

    # --------------------------------------------------
    # Validate API response
    # --------------------------------------------------

    if not data.get("success"):
        print("Medicover API returned success=false")
        return []

    doctors_data = data.get("doctors", [])

    print(
        f"Medicover API doctors found: "
        f"{len(doctors_data)}"
    )

    # --------------------------------------------------
    # Convert API data to our database format
    # --------------------------------------------------

    doctors = []

    seen_names = set()

    for item in doctors_data:

        name = clean(item.get("name"))

        if not name:
            continue

        name_key = name.lower().strip()

        # Prevent duplicate doctors
        if name_key in seen_names:
            continue

        seen_names.add(name_key)

        profile_url = clean(
            item.get("profile")
        )

        designation = clean(
            item.get("designation")
        )

        speciality = clean(
            item.get("speciality")
        )

        experience = item.get("experience")

        location = clean(
            item.get("location")
        )

        city = clean(
            item.get("city")
        )

        # --------------------------------------------------
        # Safety check:
        # Only accept Kurnool doctors
        # --------------------------------------------------

        if (
            location.lower() != "kurnool"
            and city.lower() != "kurnool"
        ):
            continue

        # --------------------------------------------------
        # Get additional data from doctor profile
        # --------------------------------------------------
        profile_data = scrape_medicover_profile(
            profile_url,
            existing_qualification="",
            existing_experience=experience,
            existing_specialization=designation
        )

        doctors.append({
            "name": name,

            # API speciality becomes department
            "department": speciality,

            # Profile designation becomes specialization
            "specialization": (
                profile_data.get("specialization")
                or designation
            ),

            # Extracted from Medical Qualifications
            "qualification": (
                profile_data.get("qualification")
                or ""
            ),

            # Profile experience is preferred
            "experience": (
                profile_data.get("experience")
                or experience
            ),

            "profile_url": profile_url,

            "source_url": url
        })

    # --------------------------------------------------
    # Final result
    # --------------------------------------------------

    print(
        f"Kurnool doctors after filtering: "
        f"{len(doctors)}"
    )

    return doctors


# =========================================================
# KIMS SPECIALTY URLS
# =========================================================

def get_specialty_urls(url):

    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    response = requests.get(
        url,
        headers=headers,
        timeout=30
    )

    response.raise_for_status()

    soup = BeautifulSoup(
        response.text,
        "html.parser"
    )

    specialty_urls = []

    for link in soup.find_all(
        "a",
        href=True
    ):

        href = link["href"].strip()

        if "/kurnool/speciality/" not in href:
            continue

        if href.startswith("/"):
            href = (
                "https://www.kimshospitals.com"
                + href
            )

        href = href.split("#")[0].rstrip("/")

        if href not in specialty_urls:
            specialty_urls.append(href)

    return specialty_urls


# =========================================================
# KIMS DEPARTMENT NAME
# =========================================================

def get_kims_department_from_url(url):

    match = re.search(
        r"/speciality/([^/?#]+)/?",
        url,
        re.IGNORECASE
    )

    if not match:
        return ""

    slug = match.group(1)

    # Convert URL slug into readable department
    department = slug.replace("-", " ")

    department = re.sub(
        r"\s+",
        " ",
        department
    ).strip()

    # Remove unnecessary centre/unit wording
    replacements = {
        "and": "&",
        "paediatrics": "Paediatrics",
        "paediatric": "Paediatric",
        "obstetrics": "Obstetrics",
        "gynaecology": "Gynaecology",
        "neurology": "Neurology",
        "neurosurgery": "Neurosurgery",
        "nephrology": "Nephrology",
        "urology": "Urology",
        "cardiology": "Cardiology",
        "pulmonology": "Pulmonology",
        "anesthesiology": "Anesthesiology",
        "anaesthesiology": "Anaesthesiology",
        "emergency medicine": "Emergency Medicine",
        "critical and intensive care": "Critical & Intensive Care",
        "microbiology": "Microbiology",
        "biochemistry": "Biochemistry",
        "pathology": "Pathology",
        "radiology and imageology": "Radiology & Imageology",
        "ophthalmology": "Ophthalmology",
        "ent": "ENT",
        "internal medicine": "Internal Medicine",
        "interventional radiology": "Interventional Radiology",
        "endocrinology": "Endocrinology",
        "general surgery": "General Surgery",
        "dermatology": "Dermatology",
        "psychiatry": "Psychiatry",
        "diabetology": "Diabetology",
        "plastic and cosmetic surgery centre":
            "Plastic & Cosmetic Surgery",
        "transfusion medicine": "Transfusion Medicine",
        "tele medicine": "Telemedicine",
        "nuclear medicine": "Nuclear Medicine",
        "dietetics and nutrition": "Dietetics & Nutrition",
        "palliative care": "Palliative Care",
        "physiotherapy and rehabilitation centre":
            "Physiotherapy & Rehabilitation",
        "pain clinic": "Pain Clinic",
        "fertility centre": "Fertility",
        "infertility centre": "Infertility",
        "iui centre": "IUI",
        "ivf centre": "IVF",
        "surgical oncology": "Surgical Oncology",
        "medical oncology": "Medical Oncology",
        "radiation oncology": "Radiation Oncology",
        "paediatric oncology": "Paediatric Oncology",
        "paediatric surgery": "Paediatric Surgery",
        "neonatology": "Neonatology",
        "screening centre": "Screening",
        "breast centre": "Breast Centre",
        "spine centre": "Spine Centre",
        "spine surgery centre": "Spine Surgery",
        "kidney health centre": "Kidney Health",
        "dialysis centre": "Dialysis",
        "andrology and infertility centre":
            "Andrology & Infertility",
        "female urology centre": "Female Urology",
        "urogynecology": "Urogynecology",
        "paediatric urology": "Paediatric Urology",
        "neuro icu": "Neuro ICU",
        "neuro rehabilitation centre":
            "Neuro Rehabilitation",
        "neurophysiology centre":
            "Neurophysiology",
        "paediatric neurosciences and behavioral sciences":
            "Paediatric Neurosciences & Behavioral Sciences",
        "child development unit":
            "Child Development",
        "paediatric intensive care unit":
            "Paediatric Intensive Care",
        "genetics": "Genetics",
        "paediatric cardiac centre":
            "Paediatric Cardiac Centre",
        "paediatric counselling centre":
            "Paediatric Counselling",
        "paediatric emergency":
            "Paediatric Emergency",
        "paediatric gastroentrology and hepatology":
            "Paediatric Gastroenterology & Hepatology",
        "speech language pathology speaking swallowing disorders":
            "Speech & Language Pathology",
        "neuro and cardio pulmonary rehabilitation":
            "Neuro & Cardio Pulmonary Rehabilitation",
        "clinical immunology allergy centre":
            "Clinical Immunology & Allergy",
        "accident": "Accident & Emergency",
        "diagnostics and imaging": "Diagnostics & Imaging",
        "paediatric orthopedics and rheumatology":
            "Paediatric Orthopedics & Rheumatology",
        "orthopedic oncology": "Orthopedic Oncology",
        "vascular and endovascular surgery":
            "Vascular & Endovascular Surgery",
        "gastrointestinal oncology":
            "Gastrointestinal Oncology"
    }

    key = department.lower()

    if key in replacements:
        return replacements[key]

    # Generic title case for unknown specialties
    return department.title()


# =========================================================
# KIMS SPECIALTY DOCTOR DISCOVERY
# =========================================================

def scrape_kims_specialty(url):

    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    response = requests.get(
        url,
        headers=headers,
        timeout=30
    )

    response.raise_for_status()

    soup = BeautifulSoup(
        response.text,
        "html.parser"
    )

    doctors = []

    department = get_kims_department_from_url(url)

    # --------------------------------------
    # Find doctor profile links
    # --------------------------------------

    for link in soup.find_all(
        "a",
        href=True
    ):

        href = link["href"].strip()

        if "/doctor-profile/" not in href:
            continue

        name = clean(
            link.get_text(
                " ",
                strip=True
            )
        )

        if not name:
            continue

        # ----------------------------------
        # Absolute profile URL
        # ----------------------------------

        if href.startswith("/"):
            profile_url = (
                "https://www.kimshospitals.com"
                + href
            )
        else:
            profile_url = href

        profile_url = profile_url.split("#")[0]

        # ----------------------------------
        # Get role from nearby card
        # ----------------------------------

        specialization = ""

        parent = link.parent

        if parent:

            card_text = clean(
                parent.get_text(
                    " ",
                    strip=True
                )
            )

            if name in card_text:

                specialization = (
                    card_text
                    .replace(name, "")
                    .strip()
                )

        doctors.append({

            "name": name,

            "department": department,

            "qualification": "",

            "specialization": specialization,

            "experience": None,

            "profile_url": profile_url,

            "source_url": url
        })

    # --------------------------------------
    # Remove duplicate profile URLs
    # --------------------------------------

    unique = {}

    for doctor in doctors:

        key = doctor["profile_url"]

        if key:

            if key not in unique:
                unique[key] = doctor

        else:

            unique[doctor["name"]] = doctor

    return list(unique.values())


# =========================================================
# KIMS PROFILE DOWNLOAD
# =========================================================

def get_kims_profile(url):

    headers = {
        "User-Agent": (
            "Mozilla/5.0 "
            "(Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 "
            "(KHTML, like Gecko) "
            "Chrome/154.0.0.0 Safari/537.36"
        )
    }

    max_retries = 3

    for attempt in range(
        1,
        max_retries + 1
    ):

        try:

            response = requests.get(
                url,
                headers=headers,
                timeout=30
            )

            response.raise_for_status()

            return response.text

        except requests.RequestException as error:

            print(
                f"Profile request failed "
                f"({attempt}/{max_retries}): {error}"
            )

            if attempt == max_retries:
                raise error

            time.sleep(3)


# =========================================================
# KIMS SPECIALIZATION
# =========================================================

def find_kims_specialization(lines):

    keywords = [

        "Consultant",
        "Specialist",
        "Surgeon",
        "Physician",
        "Cardiologist",
        "Neurologist",
        "Anaesthesiologist",
        "Anesthesiologist",
        "Paediatrician",
        "Pediatrician",
        "Radiologist",
        "Nephrologist",
        "Urologist",
        "Pulmonologist",
        "Psychiatrist",
        "Gastroenterologist",
        "Gynecologist",
        "Gynaecologist",
        "Microbiologist",
        "Pathologist",
        "Biochemistry",
        "Emergency",
        "Critical Care",
        "Fertility",
        "Lactation Consultant"
    ]

    for i, line in enumerate(lines):

        if not line.startswith("Dr."):
            continue

        if i + 1 >= len(lines):
            continue

        next_line = clean(
            lines[i + 1]
        )

        if not next_line:
            continue

        if any(
            keyword.lower()
            in next_line.lower()
            for keyword in keywords
        ):

            return next_line

    return ""


# =========================================================
# KIMS QUALIFICATION
# =========================================================

def find_kims_qualification(lines):

    start_index = None

    # --------------------------------------
    # Find qualification section
    # --------------------------------------

    for i, line in enumerate(lines):

        if (
            "Qualification / Education:"
            in line
            or
            "Qualification/Education:"
            in line
            or
            line == "Qualification"
            or
            line == "Education:"
        ):

            start_index = i + 1
            break

    if start_index is None:
        return ""

    qualifications = []

    stop_sections = [

        "Experience:",
        "Experience",

        "Area of interest:",
        "Area of Interest:",

        "Areas of interest:",
        "Areas of Interest:",

        "Expertise in:",

        "Research & Publications:",
        "Research and Publications:",

        "Awards & Honours:",
        "Awards & Honors:",

        "Memberships:",

        "Academic & Conference Contributions:",

        "Special Clinics",

        "Patient videos loading...",
        "Doctor videos loading...",
        "News & Events loading...",
        "Doctors talk loading...",

        "BOOK AN APPOINTMENT",
        "FIND A DOCTOR"
    ]

    for i in range(
        start_index,
        len(lines)
    ):

        line = clean(lines[i])

        if not line:
            continue

        # ----------------------------------
        # Stop at next section
        # ----------------------------------

        should_stop = False

        for stop in stop_sections:

            if line.lower().startswith(
                stop.lower()
            ):

                should_stop = True
                break

        if should_stop:
            break

        qualifications.append(line)

    # --------------------------------------
    # Remove duplicates
    # --------------------------------------

    qualifications = list(
        dict.fromkeys(
            qualifications
        )
    )

    # --------------------------------------
    # Remove unrelated content
    # --------------------------------------

    filtered = []

    for item in qualifications:

        lower = item.lower()

        if (
            lower.startswith("patient ")
            or
            lower.startswith("doctor ")
            or
            lower.startswith("news ")
            or
            lower.startswith("book ")
            or
            lower.startswith("find ")
        ):
            continue

        filtered.append(item)

    return ", ".join(filtered)


# =========================================================
# SCRAPE KIMS PROFILE
# =========================================================

def scrape_kims_profile(
    profile_url,
    existing_qualification="",
    existing_specialization=""
):

    html = get_kims_profile(
        profile_url
    )

    soup = BeautifulSoup(
        html,
        "html.parser"
    )

    lines = [
        clean(text)
        for text in soup.stripped_strings
        if clean(text)
    ]

    specialization = (
        find_kims_specialization(
            lines
        )
    )

    qualification = (
        find_kims_qualification(
            lines
        )
    )

    # --------------------------------------
    # Keep existing specialization
    # if new one is empty
    # --------------------------------------

    if not specialization:
        specialization = (
            existing_specialization
            or ""
        )

    # --------------------------------------
    # Keep existing qualification
    # if new one is empty
    # --------------------------------------

    if not qualification:
        qualification = (
            existing_qualification
            or ""
        )

    return {
        "specialization": specialization,
        "qualification": qualification
    }


# =========================================================
# LOAD EXISTING KIMS DOCTORS
# =========================================================

def get_existing_doctors(hospital_id):

    result = (
        supabase
        .table("doctors")
        .select(
            "id,name,department,qualification,"
            "specialization,experience,profile_url,source_url"
        )
        .eq(
            "hospital_id",
            hospital_id
        )
        .execute()
    )

    existing = {}

    for doctor in result.data or []:

        name = clean(
            doctor.get("name")
        )

        if name:
            existing[name.lower()] = doctor

    return existing


# =========================================================
# MERGE DOCTOR DATA
# =========================================================

def merge_doctor_data(new_doctor, existing_doctor=None):
    if not existing_doctor:
        return new_doctor

    # Preserve existing department when new data is empty
    if not new_doctor.get("department"):
        new_doctor["department"] = (
            existing_doctor.get("department") or ""
        )

    # Preserve existing qualification when new data is empty
    if not new_doctor.get("qualification"):
        new_doctor["qualification"] = (
            existing_doctor.get("qualification") or ""
        )

    # Ignore incorrect specialization values from old records
    old_specialization = (
        existing_doctor.get("specialization") or ""
    ).strip()

    invalid_specializations = {
        "home",
        "psychiatry team",
        "cardiology team",
        "view more info",
        "view profile",
        "read more",
    }

    if not new_doctor.get("specialization"):
        if old_specialization.lower() not in invalid_specializations:
            new_doctor["specialization"] = old_specialization
        else:
            new_doctor["specialization"] = ""

    # Preserve experience when new data is empty
    if not new_doctor.get("experience"):
        new_doctor["experience"] = existing_doctor.get("experience")

    # Do not reuse the hospital's main page as a doctor's profile
    if not new_doctor.get("profile_url"):
        old_profile = existing_doctor.get("profile_url")
        source_url = new_doctor.get("source_url") or ""

        if (
            old_profile
            and old_profile.rstrip("/") != source_url.rstrip("/")
        ):
            new_doctor["profile_url"] = old_profile
        else:
            new_doctor["profile_url"] = None

    return new_doctor


# =========================================================
# SAVE DOCTORS SAFELY
# =========================================================

def save_doctors(
    doctors,
    hospital_id
):

    for doctor in doctors:

        # ----------------------------------
        # Get existing doctor
        # ----------------------------------

        existing_result = (
            supabase
            .table("doctors")
            .select(
                "id,department,qualification,"
                "specialization,experience,profile_url,"
                "source_url"
            )
            .eq(
                "hospital_id",
                hospital_id
            )
            .eq(
                "name",
                doctor["name"]
            )
            .execute()
        )

        existing = None

        if existing_result.data:
            existing = existing_result.data[0]

        doctor = merge_doctor_data(
            doctor,
            existing
        )

        data = {
            "hospital_id": hospital_id,

            "name": doctor["name"],

            "specialization":
                doctor.get("specialization")
                or "",

            "qualification":
                doctor.get("qualification")
                or "",

            "experience":
                doctor.get("experience"),

            "department":
                doctor.get("department")
                or "",

            "profile_url":
                doctor.get("profile_url"),

            "source_url":
                doctor.get("source_url")
        }

        (
            supabase
            .table("doctors")
            .upsert(
                data,
                on_conflict="hospital_id,name"
            )
            .execute()
        )

        print(
            "Saved:",
            doctor["name"]
        )


# =========================================================
# MAIN
# =========================================================

if __name__ == "__main__":

    city = input("Enter city (Kurnool/Nandyal): ").strip().title()

    if city not in ["Kurnool", "Nandyal"]:
        print("Invalid city. Choose Kurnool or Nandyal.")
        exit(1)

    hospitals = HOSPITALS.get(city, [])

    if not hospitals:
        print(f"No hospitals configured for {city}.")
        exit(1)

    print(f"\nHospitals available in {city}:")

    for i, hospital in enumerate(hospitals, start=1):
        print(f"{i}. {hospital['name']}")

    choice = input("\nEnter hospital number: ").strip()

    if not choice.isdigit() or not (1 <= int(choice) <= len(hospitals)):
        print("Invalid hospital number.")
        exit(1)

    hospital_config = hospitals[int(choice) - 1]
    hospital_name = hospital_config["name"]

    doctor_url = hospital_config.get(
        "doctor_url"
    )

    specialty_url = hospital_config.get(
        "specialty_url"
    )

    if (
        not doctor_url
        and
        not specialty_url
    ):

        print(
            f"No doctor source configured "
            f"for {hospital_name}"
        )

        exit(1)

    # =====================================================
    # GET / CREATE HOSPITAL
    # =====================================================

    hospital_id = (
        get_or_create_hospital(
            hospital_config,
            city
        )
    )

    print(
        "Hospital ID:",
        hospital_id
    )

    print(
        f"Scraping {hospital_name} "
        f"({city})..."
    )

    # =====================================================
    # KIMS
    # =====================================================

    if specialty_url:

        print(
            f"Specialty URL: "
            f"{specialty_url}"
        )

        specialty_urls = (
            get_specialty_urls(
                specialty_url
            )
        )

        print(
            f"\nSpecialty pages found: "
            f"{len(specialty_urls)}"
        )

        all_doctors = []

        # ----------------------------------
        # Load existing doctors first
        # ----------------------------------

        existing_doctors = (
            get_existing_doctors(
                hospital_id
            )
        )

        print(
            f"Existing doctors in database: "
            f"{len(existing_doctors)}"
        )

        # ----------------------------------
        # Discover doctor profiles
        # ----------------------------------

        for specialty_page in specialty_urls:

            print(
                "\nScraping specialty:"
            )

            print(
                specialty_page
            )

            try:

                doctors = (
                    scrape_kims_specialty(
                        specialty_page
                    )
                )

                print(
                    f"Doctors found: "
                    f"{len(doctors)}"
                )

                all_doctors.extend(
                    doctors
                )

            except Exception as error:

                print(
                    "Specialty failed:",
                    error
                )

        # ----------------------------------
        # Merge duplicate doctors
        # ----------------------------------

        unique = {}

        for doctor in all_doctors:

            key = doctor.get(
                "profile_url"
            )

            if key:

                if key not in unique:
                    unique[key] = doctor

                else:

                    # If the same doctor appears
                    # in another specialty page,
                    # keep the first department.
                    existing = unique[key]

                    if not existing.get("department"):
                        existing["department"] = (
                            doctor.get("department")
                            or ""
                        )

            else:

                name_key = (
                    doctor["name"]
                    .lower()
                    .strip()
                )

                unique[name_key] = doctor

        doctors = list(
            unique.values()
        )

        print(
            f"\nUnique KIMS doctors "
            f"found: {len(doctors)}"
        )

        # =================================================
        # PROFILE EXTRACTION
        # =================================================

        final_doctors = []

        for number, doctor in enumerate(
            doctors,
            start=1
        ):

            profile_url = doctor.get(
                "profile_url"
            )

            if not profile_url:
                continue

            print(
                "\n-----------------------------------"
            )

            print(
                f"Profile {number}/{len(doctors)}"
            )

            print(
                "Doctor:",
                doctor["name"]
            )

            print(
                "Department:",
                doctor.get("department")
            )

            print(
                "Profile:",
                profile_url
            )

            # ----------------------------------
            # Existing DB data
            # ----------------------------------

            existing = (
                existing_doctors.get(
                    doctor["name"]
                    .lower()
                    .strip()
                )
            )

            existing_qualification = ""

            existing_specialization = ""

            existing_department = ""

            if existing:

                existing_qualification = (
                    existing.get(
                        "qualification"
                    )
                    or ""
                )

                existing_specialization = (
                    existing.get(
                        "specialization"
                    )
                    or ""
                )

                existing_department = (
                    existing.get(
                        "department"
                    )
                    or ""
                )

            # ----------------------------------
            # Preserve existing department
            # if discovery didn't find one
            # ----------------------------------

            if not doctor.get("department"):

                doctor["department"] = (
                    existing_department
                )

            try:

                extracted = (
                    scrape_kims_profile(
                        profile_url,
                        existing_qualification,
                        existing_specialization
                    )
                )

                # ----------------------------------
                # Specialization
                # ----------------------------------

                if extracted[
                    "specialization"
                ]:

                    doctor[
                        "specialization"
                    ] = extracted[
                        "specialization"
                    ]

                # ----------------------------------
                # Qualification
                # ----------------------------------

                if extracted[
                    "qualification"
                ]:

                    doctor[
                        "qualification"
                    ] = extracted[
                        "qualification"
                    ]

                # ----------------------------------
                # Final safety merge
                # ----------------------------------

                doctor = merge_doctor_data(
                    doctor,
                    existing
                )

                print(
                    "Department:",
                    doctor.get(
                        "department"
                    )
                )

                print(
                    "Specialization:",
                    doctor.get(
                        "specialization"
                    )
                )

                print(
                    "Qualification:",
                    doctor.get(
                        "qualification"
                    )
                )

                final_doctors.append(
                    doctor
                )

            except Exception as error:

                print(
                    "Profile failed:",
                    error
                )

                # ----------------------------------
                # IMPORTANT:
                # Keep existing doctor data if
                # profile request fails.
                # ----------------------------------

                if existing:

                    fallback_doctor = {
                        "name": doctor["name"],

                        "department":
                            existing.get(
                                "department"
                            )
                            or doctor.get(
                                "department"
                            )
                            or "",

                        "qualification":
                            existing.get(
                                "qualification"
                            )
                            or doctor.get(
                                "qualification"
                            )
                            or "",

                        "specialization":
                            existing.get(
                                "specialization"
                            )
                            or doctor.get(
                                "specialization"
                            )
                            or "",

                        "experience":
                            existing.get(
                                "experience"
                            ),

                        "profile_url":
                            doctor.get(
                                "profile_url"
                            )
                            or existing.get(
                                "profile_url"
                            ),

                        "source_url":
                            doctor.get(
                                "source_url"
                            )
                            or existing.get(
                                "source_url"
                            )
                    }

                    final_doctors.append(
                        fallback_doctor
                    )

            time.sleep(1)

        doctors = final_doctors

    # =====================================================
    # NORMAL HOSPITAL
    # =====================================================

    else:

        print(
            f"Doctor URL: "
            f"{doctor_url}"
        )

        # --------------------------------------
        # MEDICOVER
        # --------------------------------------

        if hospital_name == "Medicover Hospitals":

            doctors = scrape_medicover_doctors(
                doctor_url
            )

        # --------------------------------------
        # OTHER NORMAL HOSPITALS
        # --------------------------------------

        else:

            if hospital_name in [
                "Udayananda Hospitals",
                "Indus Heart Institute"
            ]:
                doctors = scrape_universal_doctors(
                    doctor_url
                )
            else:
                doctors = scrape_doctors(
                    doctor_url
                )

        # ----------------------------------
        # Also preserve existing data
        # ----------------------------------

        existing_doctors = (
            get_existing_doctors(
                hospital_id
            )
        )

        merged_doctors = []

        for doctor in doctors:

            existing = (
                existing_doctors.get(
                    doctor["name"]
                    .lower()
                    .strip()
                )
            )

            doctor = merge_doctor_data(
                doctor,
                existing
            )

            if hospital_name == "Udayananda Hospitals":
                doctor["qualification"] = ""

            merged_doctors.append(
                doctor
            )

        doctors = merged_doctors

    # =====================================================
    # RESULTS
    # =====================================================

    print(
        f"\nDoctors found: "
        f"{len(doctors)}\n"
    )

    for doctor in doctors:

        print(

            f"{doctor['name']} | "

            f"Department: "
            f"{doctor.get('department', '')} | "

            f"Qualification: "
            f"{doctor.get('qualification', '')} | "

            f"Specialization: "
            f"{doctor.get('specialization', '')} | "

            f"Profile: "
            f"{doctor.get('profile_url', '')}"

        )

    # =====================================================
    # SAVE
    # =====================================================

    save_doctors(
        doctors,
        hospital_id
    )

    print(
        f"\nSuccessfully saved "
        f"{len(doctors)} doctors "
        f"to Supabase."
    )