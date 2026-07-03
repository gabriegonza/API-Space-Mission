from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from app.exceptions import (
    DuplicateMissionNameError,
    EmptyMissionUpdateError,
    FinalMissionStatusError,
    MissionNotFoundError,
    SameMissionStatusError,
)


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(MissionNotFoundError, mission_not_found_handler)
    app.add_exception_handler(DuplicateMissionNameError, duplicate_mission_name_handler)
    app.add_exception_handler(EmptyMissionUpdateError, empty_mission_update_handler)
    app.add_exception_handler(SameMissionStatusError, same_mission_status_handler)
    app.add_exception_handler(FinalMissionStatusError, final_mission_status_handler)


def mission_not_found_handler(
    _request: Request, _exc: MissionNotFoundError
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": "Mission not found"},
    )


def duplicate_mission_name_handler(
    _request: Request, _exc: DuplicateMissionNameError
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": "Mission name already exists"},
    )


def empty_mission_update_handler(
    _request: Request, _exc: EmptyMissionUpdateError
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": "No fields provided for update"},
    )


def same_mission_status_handler(
    _request: Request, _exc: SameMissionStatusError
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": "Mission already has this status"},
    )


def final_mission_status_handler(
    _request: Request, _exc: FinalMissionStatusError
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": "Completed or failed missions cannot change status"},
    )
