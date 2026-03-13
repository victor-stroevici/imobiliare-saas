from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .database import Base

class TipImobil(str, enum.Enum):
    APARTAMENT = "apartament"
    CASA = "casa"
    TEREN = "teren"
    SPATIU_COMERCIAL = "spatiu_comercial"
    GARSONIERA = "garsoniera"
    INDUSTRIAL = "industrial"

class TipTranzactie(str, enum.Enum):
    VANZARE = "vanzare"
    INCHIRIERE = "inchiriere"

class StatusAnunt(str, enum.Enum):
    DRAFT = "draft"
    ACTIV = "activ"
    INACTIV = "inactiv"
    VANDUT = "vandut"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    nume = Column(String, nullable=False)
    prenume = Column(String, nullable=False)
    telefon = Column(String)
    este_activ = Column(Boolean, default=True)
    este_premium = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    anunturi = relationship("Anunt", back_populates="proprietar")

class Anunt(Base):
    __tablename__ = "anunturi"
    id = Column(Integer, primary_key=True, index=True)
    titlu = Column(String(300), nullable=False)
    descriere = Column(Text)
    tip_imobil = Column(Enum(TipImobil), nullable=False)
    tip_tranzactie = Column(Enum(TipTranzactie), default=TipTranzactie.VANZARE)
    status = Column(Enum(StatusAnunt), default=StatusAnunt.ACTIV)
    pret = Column(Float, nullable=False)
    moneda = Column(String(3), default="EUR")
    suprafata_utila = Column(Float)
    suprafata_construita = Column(Float)
    nr_camere = Column(Integer)
    nr_bai = Column(Integer)
    etaj = Column(Integer)
    nr_etaje_total = Column(Integer)
    an_constructie = Column(Integer)
    oras = Column(String(100), nullable=False)
    judet = Column(String(100))
    adresa = Column(String(300))
    latitudine = Column(Float)
    longitudine = Column(Float)
    dotari = Column(JSON, default=list)
    are_centrala_proprie = Column(Boolean, default=False)
    are_parcare = Column(Boolean, default=False)
    are_balcon = Column(Boolean, default=False)
    are_ac = Column(Boolean, default=False)
    are_lift = Column(Boolean, default=False)
    dosar_verificat = Column(Boolean, default=False)
    vizualizari = Column(Integer, default=0)
    este_promovat = Column(Boolean, default=False)
    proprietar_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    proprietar = relationship("User", back_populates="anunturi")
    poze = relationship("PozaAnunt", back_populates="anunt", cascade="all, delete-orphan")

class PozaAnunt(Base):
    __tablename__ = "poze_anunturi"
    id = Column(Integer, primary_key=True, index=True)
    anunt_id = Column(Integer, ForeignKey("anunturi.id"))
    filename = Column(String(300), nullable=False)
    url = Column(String(500), nullable=False)
    este_principala = Column(Boolean, default=False)
    ordine = Column(Integer, default=0)
    anunt = relationship("Anunt", back_populates="poze")

class Mesaj(Base):
    __tablename__ = "mesaje"
    id = Column(Integer, primary_key=True, index=True)
    anunt_id = Column(Integer, ForeignKey("anunturi.id"))
    expeditor_id = Column(Integer, ForeignKey("users.id"))
    destinatar_id = Column(Integer, ForeignKey("users.id"))
    continut = Column(Text, nullable=False)
    este_citit = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
