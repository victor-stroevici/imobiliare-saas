from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import Optional, List
import os, uuid, aiofiles
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user
from ..config import settings

router = APIRouter(prefix="/api/anunturi", tags=["anunturi"])

@router.get("/user/anunturile-mele", response_model=List[schemas.AnuntOut])
def get_anunturile_mele(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Anunt).options(
        joinedload(models.Anunt.poze)
    ).filter(models.Anunt.proprietar_id == current_user.id).order_by(
        models.Anunt.created_at.desc()
    ).all()

@router.get("", response_model=schemas.AnuntList)
def get_anunturi(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    tip_imobil: Optional[str] = None,
    tip_tranzactie: Optional[str] = None,
    oras: Optional[str] = None,
    pret_min: Optional[float] = None,
    pret_max: Optional[float] = None,
    nr_camere: Optional[int] = None,
    suprafata_min: Optional[float] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Anunt).options(
        joinedload(models.Anunt.poze),
        joinedload(models.Anunt.proprietar)
    ).filter(models.Anunt.status == models.StatusAnunt.ACTIV)

    if tip_imobil:
        query = query.filter(models.Anunt.tip_imobil == tip_imobil)
    if tip_tranzactie:
        query = query.filter(models.Anunt.tip_tranzactie == tip_tranzactie)
    if oras:
        query = query.filter(models.Anunt.oras.ilike(f"%{oras}%"))
    if pret_min:
        query = query.filter(models.Anunt.pret >= pret_min)
    if pret_max:
        query = query.filter(models.Anunt.pret <= pret_max)
    if nr_camere:
        query = query.filter(models.Anunt.nr_camere == nr_camere)
    if suprafata_min:
        query = query.filter(models.Anunt.suprafata_utila >= suprafata_min)
    if search:
        query = query.filter(
            or_(
                models.Anunt.titlu.ilike(f"%{search}%"),
                models.Anunt.descriere.ilike(f"%{search}%"),
                models.Anunt.oras.ilike(f"%{search}%"),
            )
        )

    query = query.order_by(
        models.Anunt.este_promovat.desc(),
        models.Anunt.created_at.desc()
    )

    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    return {"items": items, "total": total, "page": page, "per_page": per_page}

@router.post("", response_model=schemas.AnuntOut)
def create_anunt(
    anunt_data: schemas.AnuntCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    anunt = models.Anunt(**anunt_data.model_dump(), proprietar_id=current_user.id)
    db.add(anunt)
    db.commit()
    db.refresh(anunt)
    return anunt

@router.get("/{anunt_id}", response_model=schemas.AnuntOut)
def get_anunt(anunt_id: int, db: Session = Depends(get_db)):
    anunt = db.query(models.Anunt).options(
        joinedload(models.Anunt.poze),
        joinedload(models.Anunt.proprietar)
    ).filter(models.Anunt.id == anunt_id).first()
    if not anunt:
        raise HTTPException(status_code=404, detail="Anunțul nu a fost găsit")
    anunt.vizualizari += 1
    db.commit()
    db.refresh(anunt)
    return anunt

@router.put("/{anunt_id}", response_model=schemas.AnuntOut)
def update_anunt(
    anunt_id: int,
    anunt_data: schemas.AnuntCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    anunt = db.query(models.Anunt).filter(models.Anunt.id == anunt_id).first()
    if not anunt:
        raise HTTPException(status_code=404, detail="Anunțul nu a fost găsit")
    if anunt.proprietar_id != current_user.id:
        raise HTTPException(status_code=403, detail="Nu ai permisiunea să editezi acest anunț")
    for key, value in anunt_data.model_dump().items():
        setattr(anunt, key, value)
    db.commit()
    db.refresh(anunt)
    return anunt

@router.delete("/{anunt_id}")
def delete_anunt(
    anunt_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    anunt = db.query(models.Anunt).filter(models.Anunt.id == anunt_id).first()
    if not anunt:
        raise HTTPException(status_code=404, detail="Anunțul nu a fost găsit")
    if anunt.proprietar_id != current_user.id:
        raise HTTPException(status_code=403, detail="Nu ai permisiunea să ștergi acest anunț")
    db.delete(anunt)
    db.commit()
    return {"message": "Anunțul a fost șters"}

@router.post("/{anunt_id}/poze")
async def upload_poza(
    anunt_id: int,
    file: UploadFile = File(...),
    este_principala: bool = False,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    anunt = db.query(models.Anunt).filter(models.Anunt.id == anunt_id).first()
    if not anunt or anunt.proprietar_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acces interzis")

    upload_dir = os.path.join(settings.upload_dir, str(anunt_id))
    os.makedirs(upload_dir, exist_ok=True)

    ext = os.path.splitext(file.filename)[1].lower()
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(upload_dir, filename)

    async with aiofiles.open(filepath, 'wb') as f:
        content = await file.read()
        await f.write(content)

    url = f"/uploads/{anunt_id}/{filename}"

    if este_principala:
        db.query(models.PozaAnunt).filter(
            models.PozaAnunt.anunt_id == anunt_id
        ).update({"este_principala": False})

    ordine = db.query(models.PozaAnunt).filter(
        models.PozaAnunt.anunt_id == anunt_id
    ).count()

    poza = models.PozaAnunt(
        anunt_id=anunt_id,
        filename=filename,
        url=url,
        este_principala=este_principala or ordine == 0,
        ordine=ordine
    )
    db.add(poza)
    db.commit()
    db.refresh(poza)
    return poza
