import { useState } from "react";

export default function UploadForm({ onResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Lütfen bir fotoğraf seçin.");

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/yolo/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      onResult(data);
    } catch (err) {
      console.error(err);
      alert("Yükleme başarısız oldu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md p-4 rounded-2xl w-full max-w-md mb-6">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        {loading ? "Yükleniyor..." : "Yükle ve Analiz Et"}
      </button>
    </div>
  );
}
