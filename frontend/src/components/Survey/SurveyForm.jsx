import { useState } from "react";
import { submitSurvey } from "../../api";

export default function SurveyForm({ onSurveyComplete }) {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    skin_type: "",
    skin_issues: [],
    sun_sensitive: "",
    physical_sensitive: "",
    itching: "",
    allergies: "",
    hair_type: "",
    hair_issues: [],
    diet: "",
    water_intake: "",
    exercise_per_week: "",
    alcohol_per_week: "",
    cigarettes_per_day: "",
    chronic_disease: "",
    medication: "",
    dermatologist_visit: ""
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleCheckboxChange(name, value) {
    setForm((prev) => {
      const updated = prev[name].includes(value)
        ? prev[name].filter((v) => v !== value)
        : [...prev[name], value];
      return { ...prev, [name]: updated };
    });
  }

  async function handleSubmit() {
    const token = localStorage.getItem("token");

    // number fieldları integera çevir
    const surveyData = {
      ...form,
      age: parseInt(form.age),
      alcohol_per_week: form.alcohol_per_week ? parseInt(form.alcohol_per_week) : null,
      cigarettes_per_day: form.cigarettes_per_day ? parseInt(form.cigarettes_per_day) : null
    };

    const data = await submitSurvey(token, surveyData);
    if (data.message) {
      onSurveyComplete();
    } else {
      alert("Survey submission failed");
    }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-2">Anket</h2>

      {/* Ad */}
      <input className="border p-2 w-full mb-2" type="text" name="name" placeholder="Adınız (opsiyonel)" onChange={handleChange} />

      {/* Yaş */}
      <input className="border p-2 w-full mb-2" type="number" name="age" placeholder="Kaç yaşındasınız?" onChange={handleChange} />

      {/* Cinsiyet */}
      <select className="border p-2 w-full mb-2" name="gender" onChange={handleChange}>
        <option value="">Cinsiyetiniz nedir?</option>
        <option>Kadın</option>
        <option>Erkek</option>
        <option>Belirtmek istemiyorum</option>
      </select>

      {/* Cilt Tipi */}
      <select className="border p-2 w-full mb-2" name="skin_type" onChange={handleChange}>
        <option value="">Cilt tipiniz nedir?</option>
        {["Kuru","Yağlı","Karma","Normal","Hassas"].map(opt => <option key={opt}>{opt}</option>)}
      </select>

      {/* Cilt Sorunları */}
      <label className="font-semibold">Yüzünüzde hangi cilt sorunlarını yaşıyorsunuz?</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {["Akne","Siyah nokta","Kızarıklık","Pullanma","Egzama","Diğer"].map(opt => (
          <label key={opt}>
            <input type="checkbox" onChange={() => handleCheckboxChange("skin_issues", opt)} /> {opt}
          </label>
        ))}
      </div>

      {/* Güneş Hassasiyeti */}
      <select className="border p-2 w-full mb-2" name="sun_sensitive" onChange={handleChange}>
        <option value="">Cildiniz güneş ışığına hassas mı?</option>
        {["Evet","Hayır","Emin değilim"].map(opt => <option key={opt}>{opt}</option>)}
      </select>

      {/* Fiziksel Hassasiyet */}
      <select className="border p-2 w-full mb-2" name="physical_sensitive" onChange={handleChange}>
        <option value="">Fiziksel etkilere hassas mı?</option>
        {["Evet","Hafif hassas","Hayır"].map(opt => <option key={opt}>{opt}</option>)}
      </select>

      {/* Kaşıntı */}
      <select className="border p-2 w-full mb-2" name="itching" onChange={handleChange}>
        <option value="">Kaşıntı yaşıyor musunuz?</option>
        {["Evet","Hayır","Ara sıra"].map(opt => <option key={opt}>{opt}</option>)}
      </select>

      {/* Alerji */}
      <select className="border p-2 w-full mb-2" name="allergies" onChange={handleChange}>
        <option value="">Herhangi bir alerjiniz var mı?</option>
        {["Evet","Hayır","Emin değilim"].map(opt => <option key={opt}>{opt}</option>)}
      </select>

      {/* Saç Tipi */}
      <select className="border p-2 w-full mb-2" name="hair_type" onChange={handleChange}>
        <option value="">Saç tipiniz nedir?</option>
        {["Yağlı","Kuru","Normal"].map(opt => <option key={opt}>{opt}</option>)}
      </select>

      {/* Saç Sorunları */}
      <label className="font-semibold">Saç veya saç derisi sorunları?</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {["Kepek","Kaşıntı","Saç dökülmesi","Kızarıklık","Egzama","Diğer"].map(opt => (
          <label key={opt}>
            <input type="checkbox" onChange={() => handleCheckboxChange("hair_issues", opt)} /> {opt}
          </label>
        ))}
      </div>

      {/* Beslenme Tipi */}
      <select className="border p-2 w-full mb-2" name="diet" onChange={handleChange}>
        <option value="">Beslenme tipiniz nedir?</option>
        {["Düzenli","Vejetaryen","Vegan","Ketojenik","Diğer"].map(opt => <option key={opt}>{opt}</option>)}
      </select>

      {/* Su Tüketimi */}
      <select className="border p-2 w-full mb-2" name="water_intake" onChange={handleChange}>
        <option value="">Günde ne kadar su içiyorsunuz?</option>
        {["1 litreden az","1–2 litre","2–3 litre","3 litreden fazla"].map(opt => <option key={opt}>{opt}</option>)}
      </select>

      {/* Egzersiz */}
      <select className="border p-2 w-full mb-2" name="exercise_per_week" onChange={handleChange}>
        <option value="">Haftada kaç gün egzersiz yapıyorsunuz?</option>
        {["Düzenli egzersiz yapmıyorum","Haftada bir","Haftada 2–4 gün","Haftada 5–7 gün"].map(opt => <option key={opt}>{opt}</option>)}
      </select>

      {/* Alkol */}
      <input className="border p-2 w-full mb-2" type="number" name="alcohol_per_week" placeholder="Haftada kaç alkollü içecek?" onChange={handleChange} />

      {/* Sigara */}
      <input className="border p-2 w-full mb-2" type="number" name="cigarettes_per_day" placeholder="Günde kaç sigara?" onChange={handleChange} />

      {/* Kronik Hastalık */}
      <select className="border p-2 w-full mb-2" name="chronic_disease" onChange={handleChange}>
        <option value="">Kronik hastalığınız var mı?</option>
        {["Evet","Hayır"].map(opt => <option key={opt}>{opt}</option>)}
      </select>

      {/* İlaç Kullanımı */}
      <select className="border p-2 w-full mb-2" name="medication" onChange={handleChange}>
        <option value="">Düzenli ilaç kullanıyor musunuz?</option>
        {["Evet","Hayır"].map(opt => <option key={opt}>{opt}</option>)}
      </select>

      {/* Dermatolog */}
      <select className="border p-2 w-full mb-4" name="dermatologist_visit" onChange={handleChange}>
        <option value="">Daha önce dermatoloğa gittiniz mi?</option>
        {["Evet","Hayır"].map(opt => <option key={opt}>{opt}</option>)}
      </select>

      <button onClick={handleSubmit} className="bg-green-600 text-white p-2 w-full">Anketi Gönder</button>
    </div>
  );
}
