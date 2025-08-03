import { useState } from "react";
import axios from "axios";

const questions = [
  { title: "What is your name?", type: "SHORT_ANSWER", required: true },
  { title: "What is your age?", type: "SHORT_ANSWER", required: true, validation: "NUMBER" },
  { title: "What is your gender?", type: "MULTIPLE_CHOICE", required: true, choices: ["Female", "Male", "Prefer not to say"] },
  { title: "What is your skin type?", type: "MULTIPLE_CHOICE", required: true, choices: ["Dry", "Oily", "Combination", "Normal", "Sensitive"] },
  { title: "Which facial conditions do you experience?", type: "CHECKBOX", required: true, choices: ["Acne", "Blackheads", "Redness", "Flaking", "Eczema", "Other"] },
  { title: "Is your skin sensitive to sun light?", type: "MULTIPLE_CHOICE", required: true, choices: ["Yes", "No", "Not sure"] },
  { title: "Is your skin sensitive to physical impact (e.g., scratching, rubbing, or minor pressure)?", type: "MULTIPLE_CHOICE", required: true, choices: ["Yes", "Mildly sensitive", "No"] },
  { title: "Do you experience itching?", type: "MULTIPLE_CHOICE", required: true, choices: ["Yes", "No", "Occasionally"] },
  { title: "Do you have any allergies?", type: "MULTIPLE_CHOICE", required: true, choices: ["Yes", "No", "Not sure"] },
  { title: "What is your hair type?", type: "MULTIPLE_CHOICE", required: true, choices: ["Oily", "Dry", "Normal"] },
  { title: "Which hair or scalp issues do you experience?", type: "CHECKBOX", required: true, choices: ["Dandruff", "Itching", "Hair loss", "Redness", "Eczema", "Other"] },
  { title: "What is your diet type?", type: "MULTIPLE_CHOICE", required: true, choices: ["Regular", "Vegetarian", "Vegan", "Ketogenic", "Other"] },
  { title: "How much water do you drink daily?", type: "MULTIPLE_CHOICE", required: true, choices: ["Less than 1 liter", "1–2 liters", "2–3 liters", "More than 3 liters"] },
  { title: "In a typical week, how many days do you exercise?", type: "MULTIPLE_CHOICE", required: true, choices: ["I don’t regularly exercise", "Once a week", "2 to 4 days a week", "5 to 7 days a week"] },
  { title: "About how many alcoholic drinks do you have each week?", type: "SHORT_ANSWER", required: true, validation: "NUMBER" },
  { title: "About how many cigarettes do you smoke in a typical day?", type: "SHORT_ANSWER", required: true, validation: "NUMBER" },
  { title: "Do you have any chronic illnesses?", type: "MULTIPLE_CHOICE", required: true, choices: ["Yes", "No"] },
  { title: "Do you take any regular medications?", type: "MULTIPLE_CHOICE", required: true, choices: ["Yes", "No"] },
  { title: "Have you visited a dermatologist before?", type: "MULTIPLE_CHOICE", required: true, choices: ["Yes", "No"] },
];

const fieldMapping = {
  "What is your name?": "name",
  "What is your age?": "age",
  "What is your gender?": "gender",
  "What is your skin type?": "skin_type",
  "Which facial conditions do you experience?": "skin_issues",
  "Is your skin sensitive to sun light?": "sun_sensitive",
  "Is your skin sensitive to physical impact (e.g., scratching, rubbing, or minor pressure)?": "physical_sensitive",
  "Do you experience itching?": "itching",
  "Do you have any allergies?": "allergies",
  "What is your hair type?": "hair_type",
  "Which hair or scalp issues do you experience?": "hair_issues",
  "What is your diet type?": "diet",
  "How much water do you drink daily?": "water_intake",
  "In a typical week, how many days do you exercise?": "exercise_per_week",
  "About how many alcoholic drinks do you have each week?": "alcohol_per_week",
  "About how many cigarettes do you smoke in a typical day?": "cigarettes_per_day",
  "Do you have any chronic illnesses?": "chronic_disease",
  "Do you take any regular medications?": "medication",
  "Have you visited a dermatologist before?": "dermatologist_visit",
};

export default function SurveyPage() {
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (qTitle, value) => {
    setAnswers({ ...answers, [qTitle]: value });
  };

  const handleCheckboxChange = (qTitle, option) => {
    const current = answers[qTitle] || [];
    if (current.includes(option)) {
      setAnswers({ ...answers, [qTitle]: current.filter((item) => item !== option) });
    } else {
      setAnswers({ ...answers, [qTitle]: [...current, option] });
    }
  };

  const handleSubmit = async () => {
    for (const q of questions) {
      if (q.required && (!answers[q.title] || (Array.isArray(answers[q.title]) && answers[q.title].length === 0))) {
        setError(`Please answer: "${q.title}"`);
        return;
      }
    }

    const payload = {};
    for (const [question, value] of Object.entries(answers)) {
      if (fieldMapping[question]) {
        payload[fieldMapping[question]] = value;
      }
    }

    try {
      setLoading(true);
      setError("");
      await axios.post(
        `http://127.0.0.1:8000/survey/submit?token=${localStorage.getItem("token")}`,
        payload
      );

      localStorage.setItem("surveyCompleted", true);
      window.location.href = "/yolo";
    } catch (err) {
      console.error("Error submitting survey:", err);
      setError("An error occurred while submitting the survey.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#f3f4f6", minHeight: "100vh", padding: "40px" }}>
      {/* ✅ ORTA KUTU */}
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          padding: "24px",
        }}
      >
        {/* ✅ Logo */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img
            src="/logo/dermin_logo.png"
            alt="Dermin Logo"
            style={{ height: "250px", margin: "0 auto" }}
          />
          <h2 style={{ fontSize: "22px", fontWeight: "bold", marginTop: "10px" }}>Dermatology Survey</h2>
        </div>

        {/* ✅ Sorular */}
        {questions.map((q, idx) => (
          <div key={idx} style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "6px" }}>
              {q.title} {q.required && <span style={{ color: "red" }}>*</span>}
            </label>

            {q.type === "SHORT_ANSWER" && (
              <input
                type={q.validation === "NUMBER" ? "number" : "text"}
                onChange={(e) => handleChange(q.title, e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                }}
              />
            )}

            {q.type === "MULTIPLE_CHOICE" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {q.choices.map((choice, cIdx) => (
                  <label key={cIdx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="radio"
                      name={q.title}
                      value={choice}
                      onChange={() => handleChange(q.title, choice)}
                    />
                    {choice}
                  </label>
                ))}
              </div>
            )}

            {q.type === "CHECKBOX" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {q.choices.map((choice, cIdx) => (
                  <label key={cIdx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="checkbox"
                      value={choice}
                      onChange={() => handleCheckboxChange(q.title, choice)}
                    />
                    {choice}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* ✅ Hata mesajı */}
        {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}

        {/* ✅ Submit buton */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            background: "#2563eb",
            color: "white",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            fontWeight: "bold",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          {loading ? "Submitting..." : "Submit Survey"}
        </button>
      </div>
    </div>
  );
}
