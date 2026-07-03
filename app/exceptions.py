class MissionNotFoundError(Exception):
    pass


class DuplicateMissionNameError(Exception):
    pass


class EmptyMissionUpdateError(Exception):
    pass


class SameMissionStatusError(Exception):
    pass


class FinalMissionStatusError(Exception):
    pass
