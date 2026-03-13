from fastapi import APIRouter, Depends, HTTPException
from ..schemas import AIMessageIn
from ..auth import get_current_user
from .. import models
from ..config import settings
import anthropic

router = APIRouter(prefix="/api/ai", tags=["ai"])

SYSTEM_PROMPT = """Ești un agent AI specializat în imobiliare din România și Moldova.
Ajuți proprietarii să creeze anunțuri imobiliare profesioniste.

Comportament:
- Purtă o conversație naturală, prietenoasă și în limba română
- Colectează informații esențiale despre imobil prin întrebări clare
- Când ai suficiente date, generează automat titlul și descrierea anunțului
- Informații de colectat: tip imobil, localitate/zonă, suprafață, nr camere, etaj, an construcție, dotări, preț, stare imobil
- Titlul trebuie să fie concis și atrăgător (max 100 caractere), să includă tipul, suprafața, zona și să menționeze "proprietar direct, fără comision"
- Descrierea trebuie să fie de 300-500 cuvinte, structurată, cu puncte forte evidențiate
- Când generezi anunțul final, formatează-l clar cu secțiunile: TITLU:, DESCRIERE:, PREȚ ESTIMAT:

Nu inventa informații. Dacă nu știi ceva, întreabă utilizatorul."""

@router.post("/chat")
async def chat_with_ai(
    message_data: AIMessageIn,
    current_user: models.User = Depends(get_current_user)
):
    if not settings.anthropic_api_key or settings.anthropic_api_key == "your-anthropic-api-key-here":
        # Demo mode - return mock response
        return {
            "response": f"[MOD DEMO - configurează ANTHROPIC_API_KEY] Bună, {current_user.prenume}! Sunt agentul tău AI pentru imobiliare. Hai să creăm împreună un anunț profesionist. În ce oraș se află imobilul pe care vrei să-l vinzi?",
            "anunt_generat": None
        }

    try:
        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

        messages = []
        for msg in (message_data.conversation_history or []):
            if msg.get("role") in ["user", "assistant"]:
                messages.append({"role": msg["role"], "content": msg["content"]})

        messages.append({"role": "user", "content": message_data.message})

        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=messages
        )

        ai_response = response.content[0].text

        # Check if AI generated a listing
        anunt_generat = None
        if "TITLU:" in ai_response and "DESCRIERE:" in ai_response:
            lines = ai_response.split('\n')
            titlu = ""
            descriere_lines = []
            in_descriere = False
            for line in lines:
                if line.startswith("TITLU:"):
                    titlu = line.replace("TITLU:", "").strip()
                elif line.startswith("DESCRIERE:"):
                    in_descriere = True
                elif in_descriere and not line.startswith("PREȚ"):
                    descriere_lines.append(line)

            if titlu:
                anunt_generat = {
                    "titlu": titlu,
                    "descriere": "\n".join(descriere_lines).strip()
                }

        return {"response": ai_response, "anunt_generat": anunt_generat}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Eroare AI: {str(e)}")
