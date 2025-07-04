def module1_prompt(diagnosis: str ) -> str:
    
    return f"""
Görsel işleme üzerinden almış olduğumuz sonuca dayanarak, hastamıza {diagnosis} tanısı konmuştur.
Yukarıda belirtilmiş cilt hastalığı olan bir hastaya aşağıda belirtilen maddelerce kullanıcıya önerilerde bulun.
1)Hastalığın özet bir şekilde tanımını yaz.
2)Hastalığa nelerin neden olduğunu kullanıcıya anlat.
3)Sen yapay zeka modeli olarak incelediğinde kullanıcıya ne gibi önerilerde bulunursun, bunu kullanıcıya ilet.


"""