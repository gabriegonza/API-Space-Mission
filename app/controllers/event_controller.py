import hmac
import os
from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status

from app.repository import MissionEventRepository
from app.schemas import MissionEvent, MissionEventCreate

router = APIRouter(prefix="/events", tags=["events"])

repository = MissionEventRepository()

EventLimit = Annotated[int, Query(ge=1, le=50)]
InternalToken = Annotated[str | None, Header(alias="X-Internal-Token")]

def validate_internal_token(x_internal_token: InternalToken = None) -> None:
    expected_token = os.getenv("EVENTS_API_TOKEN")
    if (
        not expected_token
        or not x_internal_token
        or not hmac.compare_digest(x_internal_token, expected_token)
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid internal token",
        )

@router.post("", response_model=MissionEvent, status_code=status.HTTP_201_CREATED)
def create_event(
    event: MissionEventCreate,
    _token: Annotated[None, Depends(validate_internal_token)],
) -> MissionEvent:
    return repository.create(event)

@router.get("", response_model=list[MissionEvent])
def list_events(limit: EventLimit = 20) -> list[MissionEvent]:
    return repository.list(limit)
