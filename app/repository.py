import sqlite3

from app.database import get_connection, init_database
from app.schemas import (
    Mission,
    MissionCreate,
    MissionEvent,
    MissionEventCreate,
    MissionStatus,
    MissionUpdate,
)


class MissionRepository:
    def __init__(self) -> None:
        init_database()

    def create(self, data: MissionCreate) -> Mission:
        with get_connection() as connection:
            cursor = connection.execute(
                """
                INSERT INTO missions (name, destination, status)
                VALUES (?, ?, ?)
                """,
                (data.name, data.destination, data.status),
            )
            mission_id = cursor.lastrowid

        mission = self.get(mission_id)
        if mission is None:
            raise RuntimeError("Mission was not found after creation")
        return mission

    def list(
        self, page: int, page_size: int, status_filter: MissionStatus | None = None
    ) -> list[Mission]:
        offset = (page - 1) * page_size

        query = """
            SELECT id, name, destination, status
            FROM missions
        """
        params: list[object] = []

        if status_filter is not None:
            query += " WHERE status = ?"
            params.append(status_filter.value)

        query += " ORDER BY id LIMIT ? OFFSET ?"
        params.extend([page_size, offset])

        with get_connection() as connection:
            rows = connection.execute(query, params).fetchall()

        return [self._to_mission(row) for row in rows]

    def count(self, status_filter: MissionStatus | None = None) -> int:
        query = "SELECT COUNT(*) AS total FROM missions"
        params: list[object] = []

        if status_filter is not None:
            query += " WHERE status = ?"
            params.append(status_filter.value)

        with get_connection() as connection:
            row = connection.execute(query, params).fetchone()

        return int(row["total"])

    def get(self, mission_id: int) -> Mission | None:
        with get_connection() as connection:
            row = connection.execute(
                """
                SELECT id, name, destination, status
                FROM missions
                WHERE id = ?
                """,
                (mission_id,),
            ).fetchone()

        if row is None:
            return None
        return self._to_mission(row)

    def get_by_name(self, name: str) -> Mission | None:
        with get_connection() as connection:
            row = connection.execute(
                """
                SELECT id, name, destination, status
                FROM missions
                WHERE lower(trim(name)) = lower(trim(?))
                """,
                (name,),
            ).fetchone()

        if row is not None:
            return self._to_mission(row)
        return None

    def update(self, mission: Mission, data: MissionUpdate) -> Mission:
        updated_data = mission.model_dump(exclude={"id"})
        updated_data.update(data.model_dump(exclude_unset=True))

        with get_connection() as connection:
            connection.execute(
                """
                UPDATE missions
                SET name = ?, destination = ?, status = ?
                WHERE id = ?
                """,
                (
                    updated_data["name"],
                    updated_data["destination"],
                    updated_data["status"],
                    mission.id,
                ),
            )

        return Mission(id=mission.id, **updated_data)

    def _to_mission(self, row: sqlite3.Row) -> Mission:
        return Mission(
            id=row["id"],
            name=row["name"],
            destination=row["destination"],
            status=row["status"],
        )


class MissionEventRepository:
    def __init__(self) -> None:
        init_database()

    def create(self, data: MissionEventCreate) -> MissionEvent:
        with get_connection() as connection:
            connection.execute(
                """
                INSERT OR IGNORE INTO mission_events (
                    event_id,
                    event_type,
                    registered_at,
                    mission_id,
                    mission_name,
                    destination,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    data.eventId,
                    data.eventType,
                    data.registeredAt,
                    data.missionId,
                    data.missionName,
                    data.destination,
                    data.status.value,
                ),
            )

        event = self.get_by_event_id(data.eventId)
        if event is None:
            raise RuntimeError("Mission event was not found after creation")
        return event

    def list(self, limit: int = 20) -> list[MissionEvent]:
        with get_connection() as connection:
            rows = connection.execute(
                """
                SELECT
                    id,
                    event_id,
                    event_type,
                    registered_at,
                    created_at,
                    mission_id,
                    mission_name,
                    destination,
                    status
                FROM mission_events
                ORDER BY datetime(created_at) DESC, id DESC
                LIMIT ?
                """,
                (limit,),
            ).fetchall()

        return [self._to_event(row) for row in rows]

    def get_by_event_id(self, event_id: str) -> MissionEvent | None:
        with get_connection() as connection:
            row = connection.execute(
                """
                SELECT
                    id,
                    event_id,
                    event_type,
                    registered_at,
                    created_at,
                    mission_id,
                    mission_name,
                    destination,
                    status
                FROM mission_events
                WHERE event_id = ?
                """,
                (event_id,),
            ).fetchone()

        if row is None:
            return None
        return self._to_event(row)

    def _to_event(self, row: sqlite3.Row) -> MissionEvent:
        return MissionEvent(
            id=row["id"],
            event_id=row["event_id"],
            event_type=row["event_type"],
            registered_at=row["registered_at"],
            created_at=row["created_at"],
            mission_id=row["mission_id"],
            mission_name=row["mission_name"],
            destination=row["destination"],
            status=row["status"],
        )
