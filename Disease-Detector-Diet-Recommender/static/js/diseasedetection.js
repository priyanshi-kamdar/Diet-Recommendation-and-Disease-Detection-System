// Full list of symptoms (from your message)
const symptoms = [
  "anxiety and nervousness", "depression", "shortness of breath", "depressive or psychotic symptoms", "sharp chest pain",
  "dizziness", "insomnia", "abnormal involuntary movements", "chest tightness", "palpitations", "irregular heartbeat",
  "breathing fast", "hoarse voice", "sore throat", "difficulty speaking", "cough", "nasal congestion", "throat swelling",
  "diminished hearing", "difficulty in swallowing", "skin swelling", "retention of urine", "leg pain", "hip pain",
  "suprapubic pain", "blood in stool", "lack of growth", "symptoms of the scrotum and testes", "swelling of scrotum",
  "pain in testicles", "pus draining from ear", "jaundice", "white discharge from eye", "irritable infant",
  "abusing alcohol", "fainting", "hostile behavior", "drug abuse", "sharp abdominal pain", "feeling ill", "vomiting",
  "headache", "nausea", "diarrhea", "vaginal itching", "painful urination", "involuntary urination",
  "pain during intercourse", "frequent urination", "lower abdominal pain", "vaginal discharge", "blood in urine",
  "hot flashes", "intermenstrual bleeding", "hand or finger pain", "wrist pain", "hand or finger swelling", "arm pain",
  "wrist swelling", "arm stiffness or tightness", "arm swelling", "hand or finger stiffness or tightness", "lip swelling",
  "toothache", "abnormal appearing skin", "skin lesion", "acne or pimples", "facial pain", "mouth ulcer", "skin growth",
  "diminished vision", "double vision", "symptoms of eye", "pain in eye", "abnormal movement of eyelid",
  "foreign body sensation in eye", "irregular appearing scalp", "back pain", "neck pain", "low back pain", "pain of the anus",
  "pain during pregnancy", "pelvic pain", "impotence", "vomiting blood", "regurgitation", "burning abdominal pain",
  "restlessness", "wheezing", "peripheral edema", "neck mass", "ear pain", "jaw swelling", "mouth dryness", "neck swelling",
  "knee pain", "foot or toe pain", "ankle pain", "bones are painful", "elbow pain", "knee swelling", "skin moles",
  "weight gain", "problems with movement", "knee stiffness or tightness", "leg swelling", "foot or toe swelling",
  "heartburn", "infant feeding problem", "vaginal pain", "vaginal redness", "weakness", "decreased heart rate",
  "increased heart rate", "ringing in ear", "plugged feeling in ear", "itchy ear(s)", "frontal headache", "fluid in ear",
  "spots or clouds in vision", "eye redness", "lacrimation", "itchiness of eye", "blindness", "eye burns or stings",
  "decreased appetite", "excessive anger", "loss of sensation", "focal weakness", "symptoms of the face",
  "disturbance of memory", "paresthesia", "side pain", "fever", "shoulder pain", "shoulder stiffness or tightness",
  "ache all over", "lower body pain", "problems during pregnancy", "spotting or bleeding during pregnancy",
  "cramps and spasms", "upper abdominal pain", "stomach bloating", "changes in stool appearance",
  "unusual color or odor to urine", "kidney mass", "symptoms of prostate", "difficulty breathing", "rib pain",
  "joint pain", "hand or finger lump or mass", "chills", "groin pain", "fatigue", "regurgitation.1", "symptoms of the kidneys",
  "melena", "coughing up sputum", "seizures", "delusions or hallucinations", "excessive urination at night", "bleeding from eye",
  "rectal bleeding", "constipation", "temper problems", "coryza", "hemoptysis", "allergic reaction", "congestion in chest",
  "sleepiness", "apnea", "abnormal breathing sounds", "blood clots during menstrual periods", "pulling at ears", "gum pain",
  "redness in ear", "fluid retention", "flu-like syndrome", "sinus congestion", "painful sinuses", "fears and phobias",
  "recent pregnancy", "uterine contractions", "burning chest pain", "back cramps or spasms", "back mass or lump", "nosebleed",
  "long menstrual periods", "heavy menstrual flow", "unpredictable menstruation", "painful menstruation", "infertility",
  "frequent menstruation", "sweating", "mass on eyelid", "swollen eye", "eyelid swelling", "eyelid lesion or rash",
  "symptoms of bladder", "irregular appearing nails", "itching of skin", "hurts to breath", "skin dryness",
  "peeling, scaliness, or roughness", "skin irritation", "itchy scalp", "warts", "skin rash", "mass or swelling around the anus",
  "ankle swelling", "elbow swelling", "bleeding from ear", "hand or finger weakness", "low self-esteem",
  "itching of the anus", "swollen or red tonsils", "hip stiffness or tightness", "mouth pain", "arm weakness",
  "obsessions and compulsions", "antisocial behavior", "sneezing", "leg weakness", "hysterical behavior", "arm lump or mass",
  "bleeding gums", "pain in gums", "diaper rash", "hesitancy", "back stiffness or tightness", "low urine output"
];

// DOM elements
const input = document.getElementById("symptomInput");
const suggestions = document.getElementById("suggestions");
const analyzeBtn = document.getElementById("analyzeBtn");
const resultDiv = document.getElementById("result");

// Show matching symptoms as user types
// Show matching symptoms as user types
input.addEventListener("input", function () {
  const query = this.value.toLowerCase().split(",").pop().trim(); // get last word after comma
  suggestions.innerHTML = "";

  if (query.length === 0) {
    suggestions.style.display = "none";
    return;
  }

  // Filter matching symptoms
  const matches = symptoms.filter(symptom => symptom.toLowerCase().includes(query)).slice(0, 10);

  if (matches.length === 0) {
    suggestions.style.display = "none";
    return;
  }

  // Display suggestions
  matches.forEach(match => {
    const li = document.createElement("li");
    li.textContent = match;

    li.onclick = () => {
      // Split current input into array (symptoms separated by commas)
      let parts = input.value.split(",").map(p => p.trim()).filter(p => p);
      // Replace last unfinished symptom with selected match
      parts[parts.length - 1] = match;
      // Rejoin and add comma + space for next input
      input.value = parts.join(", ") + ", ";
      suggestions.innerHTML = "";
      suggestions.style.display = "none";
      input.focus(); // keep cursor in input
    };

    suggestions.appendChild(li);
  });

  suggestions.style.display = "block";
});

// Hide suggestions when clicking outside
document.addEventListener("click", (e) => {
  if (!suggestions.contains(e.target) && e.target !== input) {
    suggestions.innerHTML = "";
    suggestions.style.display = "none";
  }
});

// Analyze button click event
analyzeBtn.addEventListener("click", async () => {
  const symptoms = input.value.trim();
  if (!symptoms) {
    resultDiv.innerHTML = "<p style='color: red;'>Please enter symptoms before analyzing.</p>";
    return;
  }

  resultDiv.innerHTML = "<p>Analyzing...</p>";

  try {
    const response = await fetch('http://localhost:5001/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ symptoms: symptoms })
    });

    const data = await response.json();

    if (response.ok) {
      resultDiv.innerHTML = `
        <h3>Prediction Result</h3>
        <p><strong>Disease:</strong> ${data.disease}</p>
        <p><strong>Confidence:</strong> ${data.confidence}%</p>
      `;
    } else {
      resultDiv.innerHTML = `<p style='color: red;'>Error: ${data.error}</p>`;
    }
  } catch (error) {
    resultDiv.innerHTML = `<p style='color: red;'>Error connecting to server: ${error.message}</p>`;
  }
});

