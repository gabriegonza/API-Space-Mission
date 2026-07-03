import json
import os
import urllib.error
import urllib.request

from app.schemas import Mission

N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL")


class N8nNotifier:
    def notify_mission_launched(self, mission: Mission) -> None:
        if not N8N_WEBHOOK_URL:
            print("N8N_WEBHOOK_URL is not configured", flush=True)
            return

        payload = json.dumps(
            {
                "mission": mission.model_dump(mode="json"),
                "event": "MISSION_LAUNCHED",
            }
        ).encode("utf-8")

        request = urllib.request.Request(
            N8N_WEBHOOK_URL,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="PATCH",
        )

        try:
            response = urllib.request.urlopen(request, timeout=5)
            print(
                f"N8N webhook notified for mission {mission.id}. "
                f"Status: {response.status}",
                flush=True,
            )
        except urllib.error.HTTPError as error:
            print(
                f"N8N webhook returned an error for mission {mission.id}. "
                f"Status: {error.code}",
                flush=True,
            )
        except (urllib.error.URLError, TimeoutError) as error:
            print(f"Could not notify N8N for mission {mission.id}: {error}", flush=True)
            return
