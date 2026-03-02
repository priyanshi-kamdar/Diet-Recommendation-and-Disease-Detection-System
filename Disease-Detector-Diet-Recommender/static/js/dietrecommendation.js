console.log("Diet recommendation JS loaded");

const diseases = [
  "Actinic Keratosis", "Acute Bronchiolitis", "Acute Bronchitis", "Acute Bronchospasm",
  "Acute Kidney Injury", "Acute Pancreatitis", "Acute Sinusitis", "Allergy", "Angina",
  "Anxiety", "Appendicitis", "Arthritis Of The Hip", "Asthma", "Benign Prostatic Hyperplasia (Bph)",
  "Brachial Neuritis", "Bursitis", "Carpal Tunnel Syndrome", "Cholecystitis", "Chronic Back Pain",
  "Chronic Constipation", "Chronic Obstructive Pulmonary Disease (Copd)", "Common Cold",
  "Complex Regional Pain Syndrome", "Concussion", "Conjunctivitis", "Conjunctivitis Due To Allergy",
  "Contact Dermatitis", "Cornea Infection", "Croup", "Cystitis", "Degenerative Disc Disease",
  "Dental Caries", "Depression", "Developmental Disability", "Diaper Rash", "Diverticulitis",
  "Drug Reaction", "Ear Drum Damage", "Eczema", "Esophagitis",
  "Eustachian Tube Dysfunction (Ear Disorder)", "Fungal Infection Of The Hair", "Gallstone",
  "Gastrointestinal Hemorrhage", "Gout", "Gum Disease", "Heart Attack", "Heart Failure",
  "Hemorrhoids", "Herniated Disk", "Hiatal Hernia", "Hyperemesis Gravidarum",
  "Hypertensive Heart Disease", "Hypoglycemia", "Idiopathic Excessive Menstruation",
  "Idiopathic Irregular Menstrual Cycle", "Idiopathic Painful Menstruation",
  "Infectious Gastroenteritis", "Injury To The Arm", "Injury To The Leg", "Injury To The Trunk",
  "Liver Disease", "Macular Degeneration", "Marijuana Abuse", "Multiple Sclerosis",
  "Noninfectious Gastroenteritis", "Nose Disorder", "Obstructive Sleep Apnea (Osa)",
  "Otitis Externa (Swimmer'S Ear)", "Otitis Media", "Pain After An Operation", "Panic Disorder",
  "Pelvic Inflammatory Disease", "Peripheral Nerve Disorder", "Personality Disorder", "Pneumonia",
  "Problem During Pregnancy", "Psoriasis", "Pyogenic Skin Infection", "Rectal Disorder",
  "Schizophrenia", "Seasonal Allergies (Hay Fever)", "Sebaceous Cyst", "Sepsis",
  "Sickle Cell Crisis", "Sinus Bradycardia", "Skin Pigmentation Disorder", "Skin Polyp",
  "Spinal Stenosis", "Spondylosis", "Spontaneous Abortion", "Sprain Or Strain", "Strep Throat",
  "Stye", "Temporary Or Benign Blood In Urine", "Threatened Pregnancy", "Urinary Tract Infection",
  "Vaginal Cyst", "Vaginitis", "Vulvodynia"
];

const input = document.getElementById("disease");
const suggestionsBox = document.getElementById("disease-suggestions");

input.addEventListener("input", function () {
  const value = this.value;
  const parts = value.split(",");
  const query = parts[parts.length - 1].trim().toLowerCase();

  suggestionsBox.innerHTML = "";
  if (!query) {
    suggestionsBox.style.display = "none";
    return;
  }

  const matches = diseases.filter(d => d.toLowerCase().includes(query));
  if (matches.length === 0) {
    suggestionsBox.style.display = "none";
    return;
  }

  matches.forEach(match => {
    const div = document.createElement("div");
    div.textContent = match;
    div.onclick = () => {
      parts[parts.length - 1] = " " + match;
      input.value = parts.join(",").replace(/^,/, "").trim() + ", ";
      suggestionsBox.style.display = "none";
    };
    suggestionsBox.appendChild(div);
  });

  suggestionsBox.style.display = "block";
});

document.addEventListener("click", e => {
  if (e.target !== input) suggestionsBox.style.display = "none";
});
document.querySelector("form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const disease = document.getElementById("disease").value.trim();
  const resultBox = document.getElementById("diet-result");

  // 🧹 Clear previous result and show loading message
  resultBox.innerHTML = "<p>⏳ Fetching diet plan...</p>";

  if (!disease) {
    resultBox.innerHTML = "<p>Please enter a disease name.</p>";
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:5002/get_diet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disease })
    });

    const data = await res.json();

    // 🧠 Always clear previous data before updating with new one
    resultBox.innerHTML = "";

    if (data.status === "success") {
      const diet = data.data;
      resultBox.innerHTML = `
        <h3>🍽️ Diet Plan for ${diet.disease}</h3>
        <p><strong>✅ Foods to Eat:</strong> ${diet.foods_to_eat}</p>
        <p><strong>🚫 Foods to Avoid:</strong> ${diet.foods_to_avoid}</p>
        <p><strong>📅 Sample Day Plan:</strong> ${diet.sample_plan}</p>
      `;
    } else {
      resultBox.innerHTML = `<p style="color:red;">❌ ${data.message}</p>`;
    }
  } catch (error) {
    console.error(error);
    resultBox.innerHTML = `<p style="color:red;">⚠️ Error fetching diet plan. Please check Flask server.</p>`;
  }
});