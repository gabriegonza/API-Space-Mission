from math import ceil

from app.exceptions import (
    DuplicateMissionNameError,
    EmptyMissionUpdateError,
    FinalMissionStatusError,
    MissionNotFoundError,
    SameMissionStatusError,
)
from app.n8n_notifier import N8nNotifier
from app.repository import MissionRepository
from app.schemas import (
    Mission,
    MissionCreate,
    MissionStatus,
    MissionUpdate,
    PaginatedMissions,
)

FINAL_STATUSES = {MissionStatus.completed, MissionStatus.failed}


class MissionService:
    def __init__(self, repository: MissionRepository, notifier: N8nNotifier) -> None:
        self.repository = repository
        self.notifier = notifier

    def create(self, data: MissionCreate) -> Mission:
        if self.repository.get_by_name(data.name) is not None:
            raise DuplicateMissionNameError()

        return self.repository.create(data)

    def list(
        self, page: int, page_size: int, status_filter: MissionStatus | None = None
    ) -> PaginatedMissions:
        total = self.repository.count(status_filter)
        total_pages = ceil(total / page_size) if total else 0

        return PaginatedMissions(
            items=self.repository.list(page, page_size, status_filter),
            page=page,
            page_size=page_size,
            total=total,
            total_pages=total_pages,
        )

    def get(self, mission_id: int) -> Mission:
        mission = self.repository.get(mission_id)
        if mission is None:
            raise MissionNotFoundError()
        return mission

    def update(self, mission_id: int, data: MissionUpdate) -> Mission:
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            raise EmptyMissionUpdateError()

        mission = self.get(mission_id)

        if data.status is not None:
            if data.status.value == mission.status.value:
                raise SameMissionStatusError()

            if mission.status in FINAL_STATUSES:
                raise FinalMissionStatusError()

        if data.name is not None:
            mission_with_same_name = self.repository.get_by_name(data.name)
            if (
                mission_with_same_name is not None
                and mission_with_same_name.id != mission.id
            ):
                raise DuplicateMissionNameError()

        updated_mission = self.repository.update(mission, data)

        if (
            mission.status != MissionStatus.launched
            and updated_mission.status == MissionStatus.launched
        ):
            self.notifier.notify_mission_launched(updated_mission)

        return updated_mission
