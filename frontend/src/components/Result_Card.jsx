export default function ResultCard({ data }) {
  return (
    <div className="bg-white shadow-lg p-6 rounded-2xl w-full max-w-2xl mt-4">
      <h2 className="text-xl font-bold mb-2 text-gray-800">
        🔍 Tahmin Sonucu: {data.top_class} ({(data.confidence * 100).toFixed(1)}%)
      </h2>

      {/* YOLO'nun çizdiği kutulu görsel */}
      {data.boxed_image_url && (
        <img
          src={`http://127.0.0.1:8000${data.boxed_image_url}`}
          alt="Boxed result"
          className="rounded-xl mt-4 border"
        />
      )}

      {/* Gemini yorumunu göster */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">💬 Gemini Yorumu:</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{data.gemini_response}</p>
      </div>
    </div>
  );
}
