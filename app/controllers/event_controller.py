from typing import Annotated

from fastapi import APIRouter, Query, status

from app.repository import MissionEventRepository
from app.schemas import MissionEvent, MissionEventCreate

router = APIRouter(prefix="/events", tags=["events"])

repository = MissionEventRepository()

EventLimit = Annotated[int, Query(ge=1, le=50)]


@router.post("", response_model=MissionEvent, status_code=status.HTTP_201_CREATED)
def create_event(event: MissionEventCreate) -> MissionEvent:
    return repository.create(event)


@router.get("", response_model=list[MissionEvent])
def list_events(limit: EventLimit = 20) -> list[MissionEvent]:
    return repository.list(limit)
