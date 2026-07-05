from enum import Enum
from typing import Annotated, Literal

from pydantic import (
    BaseModel,
    Field,
    StringConstraints,
    ValidationInfo,
    field_validator,
)

RequiredText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


class MissionStatus(str, Enum):
    planned = "planned"
    launched = "launched"
    completed = "completed"
    failed = "failed"


class MissionUpdateStatus(str, Enum):
    launched = "launched"
    completed = "completed"
    failed = "failed"


class MissionCreate(BaseModel):
    name: RequiredText = Field(examples=["Apollo X"])
    destination: RequiredText = Field(examples=["Mars"])
    status: Literal["planned"] = Field(examples=["planned"])

    @field_validator("name", "destination", "status", mode="before")
    @classmethod
    def validate_required_fields(cls, value: object, info: ValidationInfo) -> object:
        if value is None:
            raise ValueError(f"{info.field_name} cannot be null")
        return value


class MissionUpdate(BaseModel):
    name: RequiredText | None = Field(default=None, examples=["Apollo XI"])
    destination: RequiredText | None = Field(default=None, examples=["Moon"])
    status: MissionUpdateStatus | None = Field(default=None, examples=["launched"])

    @field_validator("name", "destination", "status", mode="before")
    @classmethod
    def validate_optional_fields(cls, value: object, info: ValidationInfo) -> object:
        if value is None:
            raise ValueError(f"{info.field_name} cannot be null")
        return value


class Mission(BaseModel):
    id: int
    name: str
    destination: str
    status: MissionStatus


class PaginatedMissions(BaseModel):
    items: list[Mission]
    page: int
    page_size: int
    total: int
    total_pages: int


class MissionEventCreate(BaseModel):
    eventId: RequiredText = Field(examples=["1710000000000-a1b2c3"])
    eventType: RequiredText = Field(examples=["MISSION_LAUNCHED"])
    registeredAt: RequiredText = Field(examples=["2026-07-03T18:00:00.000Z"])
    missionId: int = Field(ge=1, examples=[1])
    missionName: RequiredText = Field(examples=["Apollo X"])
    destination: RequiredText = Field(examples=["Mars"])
    status: MissionStatus = Field(examples=["launched"])


class MissionEvent(BaseModel):
    id: int
    event_id: str
    event_type: str
    registered_at: str
    created_at: str
    mission_id: int
    mission_name: str
    destination: str
    status: MissionStatus
