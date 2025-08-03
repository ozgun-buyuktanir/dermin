import os
import google.generativeai as genai
from typing import Dict, List, Any, Optional
import json

class GeminiClient:
    """Gemini AI client for generating explanations"""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model = None
        self._configure_client()
    
    def _configure_client(self):
        """Configure Gemini client"""
        if not self.api_key:
            print("⚠️ GEMINI_API_KEY not found in environment variables")
            return False
        
        try:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            print("✅ Gemini AI client configured successfully")
            return True
        except Exception as e:
            print(f"❌ Failed to configure Gemini client: {e}")
            return False
    
    def generate_skin_analysis_explanation(
        self, 
        yolo_predictions: List[Dict], 
        user_survey_data: Optional[Dict] = None,
        language: str = "tr"
    ) -> Dict[str, Any]:
        """
        YOLO cilt analizi sonuçlarını kullanıcı dostu açıklama haline getir
        
        Args:
            yolo_predictions: YOLO model sonuçları
            user_survey_data: Kullanıcının anket verileri
            language: Açıklama dili (tr/en)
        
        Returns:
            Dict containing detailed explanation
        """
        try:
            if not self.model:
                return {
                    "success": False,
                    "error": "Gemini model not available"
                }
            
            # Prepare prompt
            prompt = self._create_analysis_prompt(yolo_predictions, user_survey_data, language)
            
            # Generate content
            response = self.model.generate_content(prompt)
            
            if not response.text:
                return {
                    "success": False,
                    "error": "No response from Gemini"
                }
            
            # Parse response
            explanation = self._parse_gemini_response(response.text)
            
            return {
                "success": True,
                "explanation": explanation,
                "raw_response": response.text
            }
            
        except Exception as e:
            print(f"Gemini generation error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _create_analysis_prompt(
        self, 
        predictions: List[Dict], 
        survey_data: Optional[Dict],
        language: str
    ) -> str:
        """Create detailed prompt for Gemini"""
        
        # Base information
        prediction_summary = self._format_predictions_for_prompt(predictions)
        survey_summary = self._format_survey_for_prompt(survey_data) if survey_data else "Anket bilgisi yok"
        
        if language == "tr":
            prompt = f"""
Sen bir dermatoloji uzmanısın. Aşağıdaki cilt analizi sonuçlarını kullanıcıya açıklaman gerekiyor.

## YOLO Model Analiz Sonuçları:
{prediction_summary}

## Kullanıcı Anket Bilgileri:
{survey_summary}

## Görevin:
Bu analiz sonuçlarını normal bir insanın anlayabileceği şekilde açıkla. Şunları içersin:

1. **Genel Durum**: Ciltteki genel durumu özetle
2. **Tespit Edilen Sorunlar**: Her tespit edilen sorunu detaylı açıkla
3. **Önem Derecesi**: Hangi sorunlar acil, hangisi normal
4. **Öneriler**: Her sorun için spesifik öneriler
5. **Yaşam Tarzı Tavsiyeleri**: Genel cilt bakım önerileri
6. **Doktor Kontrolü**: Ne zaman doktora gitmeli

## Önemli Notlar:
- Medikal teşhis koymuyorsun, sadece görsel analiz yapıyorsun
- Kullanıcıyı korkutma, ama ciddi durumlarda uyar
- Türkçe ve anlaşılır dil kullan
- Pozitif yaklaşım sergile

Lütfen yapılandırılmış ve detaylı bir açıklama yap:
"""
        else:
            prompt = f"""
You are a dermatology expert. You need to explain the following skin analysis results to the user.

## YOLO Model Analysis Results:
{prediction_summary}

## User Survey Information:
{survey_summary}

## Your Task:
Explain these analysis results in a way that a normal person can understand. Include:

1. **General Condition**: Summarize the general skin condition
2. **Detected Issues**: Explain each detected issue in detail
3. **Severity Level**: Which issues are urgent, which are normal
4. **Recommendations**: Specific recommendations for each issue
5. **Lifestyle Advice**: General skin care recommendations
6. **Doctor Consultation**: When to see a doctor

## Important Notes:
- You're not making medical diagnoses, only visual analysis
- Don't scare the user, but warn about serious conditions
- Use clear and understandable language
- Maintain a positive approach

Please provide a structured and detailed explanation:
"""
        
        return prompt
    
    def _format_predictions_for_prompt(self, predictions: List[Dict]) -> str:
        """Format YOLO predictions for prompt"""
        if not predictions:
            return "Herhangi bir cilt problemi tespit edilmedi."
        
        formatted = []
        for i, pred in enumerate(predictions, 1):
            class_name = pred.get('class_name', 'Bilinmeyen')
            confidence = pred.get('confidence', 0) * 100
            location = pred.get('bbox', {})
            
            formatted.append(f"""
Tespit {i}:
- Sorun Türü: {class_name}
- Güvenilirlik: %{confidence:.1f}
- Konum: {location}
""")
        
        return "\n".join(formatted)
    
    def _format_survey_for_prompt(self, survey_data: Dict) -> str:
        """Format survey data for prompt"""
        if not survey_data:
            return "Anket bilgisi mevcut değil"
        
        formatted = []
        
        # Key survey fields
        if survey_data.get('name'):
            formatted.append(f"İsim: {survey_data['name']}")
        
        if survey_data.get('age'):
            formatted.append(f"Yaş: {survey_data['age']}")
        
        if survey_data.get('gender'):
            formatted.append(f"Cinsiyet: {survey_data['gender']}")
        
        if survey_data.get('skinType'):
            formatted.append(f"Cilt Tipi: {survey_data['skinType']}")
        
        if survey_data.get('skinConcerns'):
            formatted.append(f"Cilt Endişeleri: {', '.join(survey_data['skinConcerns'])}")
        
        if survey_data.get('allergies'):
            formatted.append(f"Alerjiler: {survey_data['allergies']}")
        
        if survey_data.get('medications'):
            formatted.append(f"İlaçlar: {survey_data['medications']}")
        
        if survey_data.get('lifestyle'):
            formatted.append(f"Yaşam Tarzı: {survey_data['lifestyle']}")
        
        return "\n".join(formatted) if formatted else "Detaylı anket bilgisi yok"
    
    def _parse_gemini_response(self, response_text: str) -> Dict[str, Any]:
        """Parse and structure Gemini response"""
        try:
            # For now, just return the full explanation with basic structure
            # The complex parsing was causing character array issues
            sections = {
                "general_condition": "Cilt analizi tamamlandı",
                "detected_issues": ["Detaylı açıklama için aşağıdaki tam raporu okuyun"],
                "severity_assessment": "Değerlendirme raporda detaylandırılmıştır",
                "recommendations": ["Raporda belirtilen önerileri takip edin"],
                "lifestyle_advice": "Sağlıklı yaşam önerileri raporda bulunmaktadır",
                "doctor_consultation": "Gerektiğinde uzmana başvurun",
                "full_explanation": response_text
            }
            
            return sections
            
        except Exception as e:
            print(f"Response parsing error: {e}")
            return {
                "general_condition": "Analiz tamamlandı",
                "detected_issues": [],
                "severity_assessment": "",
                "recommendations": [],
                "lifestyle_advice": "",
                "doctor_consultation": "",
                "full_explanation": response_text
            }

    def generate_chat_response(
        self,
        user_message: str,
        analysis_data: Dict,
        user_survey_data: Optional[Dict] = None,
        forum_results: Optional[List[Dict]] = None,
        expert_analysis: Optional[Dict] = None,
        language: str = "tr"
    ) -> str:
        """
        Generate chat response based on user question and analysis data
        
        Args:
            user_message: User's question
            analysis_data: Previous analysis results
            user_survey_data: User's survey data
            forum_results: Related forum discussions and solutions
            expert_analysis: AI expert analysis results
            language: Response language (tr/en)
        
        Returns:
            AI response to user's question
        """
        try:
            if not self.model:
                return "Üzgünüm, AI sistemi şu anda kullanılamıyor."

            # Format context from analysis data
            context = ""
            if analysis_data.get("predictions"):
                context += f"Önceki analiz sonuçları:\n"
                for i, pred in enumerate(analysis_data["predictions"]):
                    context += f"- {pred.get('class_name', 'Bilinmeyen')}: %{int(pred.get('confidence', 0) * 100)} güvenilirlik\n"
            
            # Add expert analysis if available
            expert_context = ""
            if expert_analysis:
                expert_context += f"\nUzman AI Analizi:\n"
                if expert_analysis.get("severity_assessment"):
                    expert_context += f"- Durum Değerlendirmesi: {expert_analysis['severity_assessment']}\n"
                if expert_analysis.get("recommendations"):
                    expert_context += f"- Öneriler: {', '.join(expert_analysis['recommendations'])}\n"
                if expert_analysis.get("doctor_consultation"):
                    expert_context += f"- Doktor Önerisi: {expert_analysis['doctor_consultation']}\n"
            
            # Add forum results if available
            forum_context = ""
            if forum_results:
                forum_context += f"\nBenzer Durumlar ve Çözümler:\n"
                for i, forum_result in enumerate(forum_results[:3], 1):  # Limit to 3 results
                    forum_context += f"{i}. {forum_result.get('title', 'Başlık yok')}\n"
                    forum_context += f"   Çözüm: {forum_result.get('solution', 'Çözüm belirtilmemiş')}\n"
                    if forum_result.get('success_rate'):
                        forum_context += f"   Başarı Oranı: %{forum_result['success_rate']}\n"
            
            # Format user survey data
            user_context = ""
            if user_survey_data:
                user_context = f"\nKullanıcı profili:\n{self._format_survey_data(user_survey_data)}\n"

            # Create enhanced chat prompt
            prompt = f"""
Sen uzman bir dermatolog asistanısın. Kullanıcının cilt analizi hakkındaki sorusunu kısa ve net yanıtla.

{context}
{expert_context}
{forum_context}
{user_context}

Kullanıcının sorusu: {user_message}

YANIT KURALLARI:
1. MAKSIMUM 200-300 kelime kullan
2. Kısa, öz ve anlaşılır cevap ver
3. Gereksiz tekrarlar yapma
4. Türkçe olarak yazılan sorulara Türkçe yanıt ver
5. Analiz sonuçlarına odaklan
6. Önemli noktalarda **kalın** yazı kullan
7. Gerekiyorsa kısa liste yap
8. Gerektiğinde doktor kontrolü öner

UYARI: Çok uzun açıklamalar yapma, kullanıcı kısa ve net cevap istiyor!
"""

            response = self.model.generate_content(prompt)
            
            if response and response.text:
                return response.text.strip()
            else:
                return "Özür dilerim, şu anda bu konuda yardımcı olamıyorum. Lütfen tekrar deneyin."
                
        except Exception as e:
            print(f"Chat response generation error: {e}")
            return "Teknik bir hata oluştu. Lütfen daha sonra tekrar deneyin."

    def generate_general_chat_response(
        self,
        user_message: str,
        user_survey_data: Optional[Dict] = None,
        forum_results: Optional[List[Dict]] = None,
        language: str = "tr"
    ) -> str:
        """
        Generate general chat response without specific analysis context
        
        Args:
            user_message: User's question
            user_survey_data: User's survey data
            forum_results: Related forum discussions and solutions
            language: Response language (tr/en)
        
        Returns:
            AI response to user's question
        """
        try:
            if not self.model:
                return "Üzgünüm, AI sistemi şu anda kullanılamıyor."

            # Format user survey data
            user_context = ""
            if user_survey_data:
                user_context = f"\nKullanıcı profili:\n{self._format_survey_data(user_survey_data)}\n"

            # Add forum results if available
            forum_context = ""
            if forum_results:
                forum_context += f"\nBenzer Sorular ve Çözümler:\n"
                for i, forum_result in enumerate(forum_results[:3], 1):  # Limit to 3 results
                    forum_context += f"{i}. {forum_result.get('title', 'Başlık yok')}\n"
                    forum_context += f"   Çözüm: {forum_result.get('solution', 'Çözüm belirtilmemiş')}\n"
                    if forum_result.get('success_rate'):
                        forum_context += f"   Başarı Oranı: %{forum_result['success_rate']}\n"

            # Create general chat prompt
            prompt = f"""
Sen uzman bir dermatolog asistanısın. Kullanıcının cilt sağlığı hakkındaki sorusunu kısa ve net yanıtla.

{user_context}
{forum_context}

Kullanıcının sorusu: {user_message}

YANIT KURALLARI:
1. MAKSIMUM 200-300 kelime kullan
2. Kısa, öz ve anlaşılır cevap ver
3. Gereksiz tekrarlar yapma
4. Türkçe olarak yazılan sorulara Türkçe yanıt ver
5. Bilimsel ama basit dil kullan
6. Önemli noktalarda **kalın** yazı kullan
7. Gerekiyorsa kısa liste yap
8. Ciddi durumlarda doktor kontrolü öner
9. Sadece cilt sağlığı ile ilgili konularda yardım et

UYARI: Çok uzun açıklamalar yapma, kullanıcı kısa ve net cevap istiyor!

Eğer soru cilt sağlığı ile ilgili değilse, nezakitle cilt sağlığı konularında yardımcı olabileceğini belirt.
"""

            response = self.model.generate_content(prompt)
            
            if response and response.text:
                return response.text.strip()
            else:
                return "Özür dilerim, şu anda bu konuda yardımcı olamıyorum. Lütfen tekrar deneyin."
                
        except Exception as e:
            print(f"General chat response generation error: {e}")
            return "Teknik bir hata oluştu. Lütfen daha sonra tekrar deneyin."

    def _format_survey_data(self, survey_data: Dict) -> str:
        """Format survey data for prompt context"""
        if not survey_data:
            return "Kullanıcı profili bilgisi yok"
        
        formatted = []
        
        # Basic info
        if survey_data.get("age"):
            formatted.append(f"Yaş: {survey_data['age']}")
        if survey_data.get("gender"):
            formatted.append(f"Cinsiyet: {survey_data['gender']}")
        if survey_data.get("skin_type"):
            formatted.append(f"Cilt tipi: {survey_data['skin_type']}")
        
        # Skin concerns
        if survey_data.get("skin_concerns"):
            concerns = ", ".join(survey_data["skin_concerns"])
            formatted.append(f"Cilt sorunları: {concerns}")
        
        # Allergies
        if survey_data.get("allergies"):
            allergies = ", ".join(survey_data["allergies"])
            formatted.append(f"Alerjiler: {allergies}")
        
        # Current products
        if survey_data.get("current_products"):
            products = ", ".join(survey_data["current_products"])
            formatted.append(f"Kullandığı ürünler: {products}")
        
        return "\n".join(formatted) if formatted else "Kullanıcı profili bilgisi yok"

    def get_forum_results(self, query: str, problem_type: str = None) -> List[Dict]:
        """
        Simulate forum results based on query and problem type
        In production, this would query a real forum database
        """
        # Sample forum data based on common skin problems
        sample_forum_data = {
            "akne": [
                {
                    "title": "Akne tedavisi için doğal yöntemler",
                    "solution": "Çay ağacı yağı, aloe vera jeli ve düzenli yüz temizliği",
                    "success_rate": 78,
                    "user_count": 156
                },
                {
                    "title": "Akne için dermatolog önerisi",
                    "solution": "Retinoid kremler ve antibiyotik tedavi kombinasyonu",
                    "success_rate": 85,
                    "user_count": 203
                },
                {
                    "title": "Akne lekelerini azaltma yöntemleri",
                    "solution": "Vitamin C serumu ve niasinamid kullanımı",
                    "success_rate": 67,
                    "user_count": 98
                }
            ],
            "sivilce": [
                {
                    "title": "Sivilce tedavisi evde çözümler",
                    "solution": "Salisilik asit temizleyici ve nemlendirici kullanımı",
                    "success_rate": 72,
                    "user_count": 124
                },
                {
                    "title": "Sivilce izlerini hafifletme",
                    "solution": "Düzenli peeling ve güneş kremi kullanımı",
                    "success_rate": 69,
                    "user_count": 87
                }
            ],
            "kuru_cilt": [
                {
                    "title": "Kuru cilt bakımı rutini",
                    "solution": "Hyaluronik asit serum ve ceramid içeren nemlendirici",
                    "success_rate": 82,
                    "user_count": 167
                },
                {
                    "title": "Kışın kuru cilt problemi",
                    "solution": "Nemlendirici arttırma ve sıcak su kaçınma",
                    "success_rate": 75,
                    "user_count": 134
                }
            ],
            "yağlı_cilt": [
                {
                    "title": "Yağlı cilt için günlük bakım",
                    "solution": "Niasinamid serum ve matlaştırıcı nemlendirici",
                    "success_rate": 77,
                    "user_count": 145
                },
                {
                    "title": "Yağlı cilt için ürün önerileri",
                    "solution": "Salisilik asit ve BHA içeren ürünler",
                    "success_rate": 74,
                    "user_count": 112
                }
            ]
        }
        
        # Try to match problem type or search in query
        results = []
        
        if problem_type:
            problem_key = problem_type.lower().replace(" ", "_")
            if problem_key in sample_forum_data:
                results.extend(sample_forum_data[problem_key])
        
        # Search in query for keywords
        query_lower = query.lower()
        for key, forum_results in sample_forum_data.items():
            if key.replace("_", " ") in query_lower or key in query_lower:
                results.extend(forum_results)
        
        # Return unique results, max 3
        seen_titles = set()
        unique_results = []
        for result in results:
            if result["title"] not in seen_titles:
                seen_titles.add(result["title"])
                unique_results.append(result)
                if len(unique_results) >= 3:
                    break
        
        return unique_results

# Global instance
gemini_client = GeminiClient()
