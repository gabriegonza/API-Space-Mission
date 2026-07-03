from typing import Annotated

from fastapi import APIRouter, HTTPException, Path, Query, status

from app.n8n_notifier import N8nNotifier
from app.repository import MissionRepository
from app.schemas import (
    Mission,
    MissionCreate,
    MissionStatus,
    MissionUpdate,
    PaginatedMissions,
)
from app.service import MissionService

router = APIRouter(prefix="/missions", tags=["missions"])

repository = MissionRepository()
notifier = N8nNotifier()
service = MissionService(repository, notifier)

MissionId = Annotated[int, Path(ge=1)]
Page = Annotated[int, Query(ge=1)]
PageSize = Annotated[int, Query(ge=5, le=10)]


@router.post("", response_model=Mission, status_code=status.HTTP_201_CREATED)
def create_mission(mission: MissionCreate) -> Mission:
    return service.create(mission)


@router.get("", response_model=PaginatedMissions)
def list_missions(
    page: Page = 1,
    page_size: PageSize = 5,
    status: MissionStatus | None = None,
) -> PaginatedMissions:
    if page_size not in (5, 10):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="page_size must be 5 or 10",
        )

    return service.list(page, page_size, status)


@router.get("/{mission_id}", response_model=Mission)
def get_mission(mission_id: MissionId) -> Mission:
    return service.get(mission_id)


@router.patch("/{mission_id}", response_model=Mission)
def update_mission(mission_id: MissionId, mission_update: MissionUpdate) -> Mission:
    return service.update(mission_id, mission_update)
