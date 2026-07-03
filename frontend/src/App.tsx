import { useEffect, useMemo, useState } from "react";

import { CreateMissionModal } from "./components/CreateMissionModal";
import { EventLog } from "./components/EventLog";
import { Layout } from "./components/Layout";
import { MissionFilters } from "./components/MissionFilters";
import { MissionList } from "./components/MissionList";
import { Pagination } from "./components/Pagination";
import { UpdateStatusModal } from "./components/UpdateStatusModal";
import {
  createMission,
  getMissionById,
  listMissionEvents,
  listMissions,
  updateMissionStatus,
} from "./services/missionsApi";
import type {
  FilterMode,
  Mission,
  MissionCreatePayload,
  MissionEvent,
  MissionStatus,
  MissionUpdateStatus,
} from "./types/mission";

const finalStatuses: MissionStatus[] = ["completed", "failed"];

function App() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [events, setEvents] = useState<MissionEvent[]>([]);
  const [filterMode, setFilterMode] = useState<FilterMode>("status");
  const [statusFilter, setStatusFilter] = useState<MissionStatus | "all">("all");
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<
    MissionStatus | undefined
  >();
  const [idFilter, setIdFilter] = useState("");
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<5 | 10>(5);
  const [totalMissions, setTotalMissions] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setMessage("");
    }, 10000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [message]);

  const canShowPagination = useMemo(
    () => filterMode === "status" && totalMissions > 0,
    [filterMode, totalMissions],
  );

  async function loadMissions(
    nextPage = page,
    nextPageSize = pageSize,
    nextStatusFilter = appliedStatusFilter,
  ) {
    setIsLoading(true);
    try {
      const data = await listMissions({
        page: nextPage,
        pageSize: nextPageSize,
        status: nextStatusFilter,
      });

      setMissions(data.items);
      setPage(data.page);
      setPageSize(data.page_size as 5 | 10);
      setTotalMissions(data.total);
      setTotalPages(data.total_pages);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro inesperado");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadEvents() {
    setIsEventsLoading(true);
    try {
      const data = await listMissionEvents(20);
      setEvents(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao carregar eventos");
    } finally {
      setIsEventsLoading(false);
    }
  }

  useEffect(() => {
    loadMissions(1, 5);
    loadEvents();
  }, []);

  async function handleSearch() {
    if (filterMode === "status") {
      const nextStatusFilter = statusFilter === "all" ? undefined : statusFilter;
      setAppliedStatusFilter(nextStatusFilter);
      await loadMissions(1, pageSize, nextStatusFilter);
      return;
    }

    const missionId = Number(idFilter);
    if (!missionId) {
      setMessage("Informe um ID válido.");
      return;
    }

    setIsLoading(true);
    try {
      const mission = await getMissionById(missionId);
      setMissions([mission]);
      setTotalMissions(1);
      setTotalPages(1);
      setPage(1);
      setMessage("");
    } catch (error) {
      setMissions([]);
      setTotalMissions(0);
      setTotalPages(0);
      setMessage(error instanceof Error ? error.message : "Missão não encontrada");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReset() {
    setFilterMode("status");
    setStatusFilter("all");
    setAppliedStatusFilter(undefined);
    setIdFilter("");
    await loadMissions(1, pageSize, undefined);
  }

  async function handlePageChange(nextPage: number) {
    await loadMissions(nextPage, pageSize, appliedStatusFilter);
  }

  async function handlePageSizeChange(nextPageSize: 5 | 10) {
    await loadMissions(1, nextPageSize, appliedStatusFilter);
  }

  async function handleCreate(payload: MissionCreatePayload) {
    const hasNullOrBlankField =
      !payload.name?.trim() || !payload.destination?.trim() || !payload.status;

    if (hasNullOrBlankField) {
      setMessage("Preencha todos os campos obrigatórios.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createMission(payload);
      await loadMissions(1, pageSize, appliedStatusFilter);
      setIsCreateOpen(false);
      setMessage("Missão criada com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao criar missão");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateStatus(status: MissionUpdateStatus) {
    if (!selectedMission) {
      return;
    }

    if (selectedMission.status === status) {
      setMessage("A missão já possui esse status.");
      return;
    }

    if (finalStatuses.includes(selectedMission.status)) {
      setMessage("Missões completed ou failed não podem mudar de status.");
      setSelectedMission(null);
      return;
    }

    setIsSubmitting(true);
    try {
      await updateMissionStatus(selectedMission.id, { status });
      await loadMissions(page, pageSize, appliedStatusFilter);
      await loadEvents();
      setSelectedMission(null);
      setMessage("Status atualizado com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao atualizar status");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Layout
      onCreateClick={() => setIsCreateOpen(true)}
      totalMissions={totalMissions}
    >
      <MissionFilters
        mode={filterMode}
        idValue={idFilter}
        statusValue={statusFilter}
        onModeChange={setFilterMode}
        onIdValueChange={setIdFilter}
        onStatusValueChange={setStatusFilter}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {message ? <div className="notice">{message}</div> : null}

      <MissionList
        missions={missions}
        loading={isLoading}
        onUpdateClick={setSelectedMission}
      />

      {canShowPagination ? (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={totalMissions}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      ) : null}

      <EventLog events={events} loading={isEventsLoading} />

      {isCreateOpen ? (
        <CreateMissionModal
          isSubmitting={isSubmitting}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreate}
        />
      ) : null}

      {selectedMission ? (
        <UpdateStatusModal
          mission={selectedMission}
          isSubmitting={isSubmitting}
          onClose={() => setSelectedMission(null)}
          onSubmit={handleUpdateStatus}
        />
      ) : null}
    </Layout>
  );
}

export default App;

