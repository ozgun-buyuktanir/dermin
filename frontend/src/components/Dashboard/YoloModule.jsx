import { useState } from "react";

export default function YoloModule() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  async function handleUpload() {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:8000/yolo/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    setResult(data);
  }

  return (
    <div className="border rounded p-4 shadow mb-6">
      <h2 className="text-xl font-bold mb-3">📷 YOLO Classification</h2>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-3"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Yükle
      </button>

      {result && (
        <div className="mt-4">
          <img src={result.boxed_image_url} alt="Boxed result" className="mb-3" />
          <p><strong>Class:</strong> {result.top_class}</p>
          <p><strong>Confidence:</strong> {result.confidence}</p>
          <p className="mt-2"><strong>Gemini Yorumu:</strong></p>
          <p>{result.gemini_response}</p>
        </div>
      )}
    </div>
  );
}
