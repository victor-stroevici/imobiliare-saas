from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from .models import TipImobil, TipTranzactie, StatusAnunt

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    nume: str
    prenume: str
    telefon: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    nume: str
    prenume: str
    telefon: Optional[str]
    este_premium: bool
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class PozaOut(BaseModel):
    id: int
    url: str
    este_principala: bool
    ordine: int
    class Config:
        from_attributes = True

class AnuntCreate(BaseModel):
    titlu: str
    descriere: Optional[str] = None
    tip_imobil: TipImobil
    tip_tranzactie: TipTranzactie = TipTranzactie.VANZARE
    pret: float
    moneda: str = "EUR"
    suprafata_utila: Optional[float] = None
    suprafata_construita: Optional[float] = None
    nr_camere: Optional[int] = None
    nr_bai: Optional[int] = None
    etaj: Optional[int] = None
    nr_etaje_total: Optional[int] = None
    an_constructie: Optional[int] = None
    oras: str
    judet: Optional[str] = None
    adresa: Optional[str] = None
    latitudine: Optional[float] = None
    longitudine: Optional[float] = None
    dotari: Optional[List[str]] = []
    are_centrala_proprie: bool = False
    are_parcare: bool = False
    are_balcon: bool = False
    are_ac: bool = False
    are_lift: bool = False

class AnuntOut(BaseModel):
    id: int
    titlu: str
    descriere: Optional[str]
    tip_imobil: TipImobil
    tip_tranzactie: TipTranzactie
    status: StatusAnunt
    pret: float
    moneda: str
    suprafata_utila: Optional[float]
    suprafata_construita: Optional[float]
    nr_camere: Optional[int]
    nr_bai: Optional[int]
    etaj: Optional[int]
    an_constructie: Optional[int]
    oras: str
    judet: Optional[str]
    adresa: Optional[str]
    latitudine: Optional[float]
    longitudine: Optional[float]
    dotari: Optional[List[str]]
    are_centrala_proprie: bool
    are_parcare: bool
    are_balcon: bool
    are_ac: bool
    are_lift: bool
    dosar_verificat: bool
    vizualizari: int
    este_promovat: bool
    proprietar_id: int
    created_at: datetime
    poze: List[PozaOut] = []
    proprietar: Optional[UserOut] = None
    class Config:
        from_attributes = True

class AnuntList(BaseModel):
    items: List[AnuntOut]
    total: int
    page: int
    per_page: int

class MesajCreate(BaseModel):
    anunt_id: int
    destinatar_id: int
    continut: str

class MesajOut(BaseModel):
    id: int
    anunt_id: int
    expeditor_id: int
    destinatar_id: int
    continut: str
    este_citit: bool
    created_at: datetime
    class Config:
        from_attributes = True

class AIMessageIn(BaseModel):
    message: str
    conversation_history: Optional[List[dict]] = []
    anunt_data: Optional[dict] = {}
