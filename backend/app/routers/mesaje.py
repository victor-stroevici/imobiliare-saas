from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter(prefix="/api/mesaje", tags=["mesaje"])

@router.post("", response_model=schemas.MesajOut)
def send_mesaj(
    mesaj_data: schemas.MesajCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    mesaj = models.Mesaj(
        **mesaj_data.model_dump(),
        expeditor_id=current_user.id
    )
    db.add(mesaj)
    db.commit()
    db.refresh(mesaj)
    return mesaj

@router.get("/inbox", response_model=List[schemas.MesajOut])
def get_inbox(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Mesaj).filter(
        models.Mesaj.destinatar_id == current_user.id
    ).order_by(models.Mesaj.created_at.desc()).all()

@router.get("/sent", response_model=List[schemas.MesajOut])
def get_sent(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Mesaj).filter(
        models.Mesaj.expeditor_id == current_user.id
    ).order_by(models.Mesaj.created_at.desc()).all()
