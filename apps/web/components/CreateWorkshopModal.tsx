"use client";

import React, { useState, useEffect } from "react";
import workshopService, { Workshop } from "../services/workshopService";
import sectorService, { Sector } from "../services/sectorService";
import WorkshopIcon, { SVG_ICONS } from "./WorkshopIcon";
import Loading from "./Loading";
import { useTranslations } from "next-intl";

type CreateWorkshopModalProps = {
  visible: boolean;
  onClose: () => void;
  onWorkshopCreated: (newWorkshop: Workshop) => void;
  initialData?: Workshop | null;
};

type ScheduleSlot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

const CreateWorkshopModal = ({
  visible,
  onClose,
  onWorkshopCreated,
  initialData,
}: CreateWorkshopModalProps) => {
  const t = useTranslations('Forms');
  const tCommon = useTranslations('Common');

  const [title, setTitle] = useState("");
  const [sectorId, setSectorId] = useState<number | "">("");
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [modality, setModality] = useState("A");
  const [term, setTerm] = useState("1st");
  const [description, setDescription] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [maxPlaces, setMaxPlaces] = useState("");
  const [defaultLocation, setDefaultLocation] = useState("");
  const [icon, setIcon] = useState("PUZZLE");
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Helper form state
  const [tempDay, setTempDay] = useState(1);
  const [tempStart, setTempStart] = useState("09:00");
  const [tempEnd, setTempEnd] = useState("11:00");

  const daysMap: Record<number, string> = {
    1: t('monday'), 2: t('tuesday'), 3: t('wednesday'), 4: t('thursday'), 5: t('friday'), 6: t('saturday'), 0: t('sunday')
  };

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const data = await sectorService.getAll();
        setSectors(data);
      } catch (err) {
        console.error("Error fetching sectors:", err);
      }
    };
    fetchSectors();
  }, []);

  React.useEffect(() => {
    if (visible && initialData) {
      setTitle(initialData.title);
      setSectorId(initialData.sectorId || "");
      setModality(initialData.modality);
      setTerm(initialData.term);
      setIcon(initialData.icon || "PUZZLE");
      setDescription(initialData.technicalDetails?.description || "");
      setDurationHours(initialData.technicalDetails?.durationHours?.toString() || "");
      setMaxPlaces(initialData.technicalDetails?.maxPlaces?.toString() || "");
      setDefaultLocation(initialData.technicalDetails?.defaultLocation || "");

      if (Array.isArray(initialData.executionDays) && initialData.executionDays.length > 0) {
        setSchedule(initialData.executionDays);
      } else {
        setSchedule([]);
      }
    } else if (visible) {
      setTitle("");
      setSectorId("");
      setModality("A");
      setTerm("1st");
      setIcon("PUZZLE");
      setDescription("");
      setDurationHours("");
      setMaxPlaces("");
      setDefaultLocation("");
      setSchedule([]);
    }
    setError(null);
  }, [visible, initialData]);

  const addScheduleSlot = () => {
    setSchedule([...schedule, { dayOfWeek: tempDay, startTime: tempStart, endTime: tempEnd }]);
  };

  const removeScheduleSlot = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule.splice(index, 1);
    setSchedule(newSchedule);
  };

  const handleSubmit = async () => {
    if (!title || !modality) {
      setError(t('required_fields'));
      return;
    }
    setLoading(true);
    setError(null);

    const workshopData: Omit<Workshop, "_id"> = {
      title,
      sector: sectors.find(s => s.sectorId === sectorId)?.name || "General",
      sectorId: sectorId === "" ? undefined : sectorId,
      modality,
      term: term,
      icon,
      technicalDetails: {
        description,
        durationHours: parseInt(durationHours, 10) || 0,
        maxPlaces: parseInt(maxPlaces, 10) || 0,
        defaultLocation,
      },
      executionDays: schedule,
      assignedReferents: [],
    };

    try {
      let result;
      if (initialData) {
        result = await workshopService.update(initialData._id, workshopData);
      } else {
        result = await workshopService.create(workshopData);
      }
      onWorkshopCreated(result);
      onClose();
    } catch (err) {
      setError(
        (err as { response?: { data?: { error?: string } } }).response?.data?.error || tCommon('save_error')
      );
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-background-surface w-full max-w-5xl border border-border-subtle overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-background-subtle px-8 py-5 flex justify-between items-center shrink-0 border-b border-border-subtle">
          <div>
            <h2 className="text-xl font-medium text-text-primary">
              {initialData ? t('edit_title') || "Edit Workshop" : t('create_title') || "New Workshop"}
            </h2>
            <p className="text-[11px] font-normal text-text-muted mt-1">
              {t('workshop_config_subtitle')}
            </p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">

          {/* Left: Data */}
          <div className="md:w-7/12 p-8 overflow-y-auto border-r border-border-subtle custom-scrollbar">
            <section className="mb-8">
              <h3 className="text-[11px] font-medium text-text-muted mb-6 border-b border-background-subtle pb-3">{t('general_info')}</h3>

              <div className="space-y-6">
                <div className="group">
                  <label className="block text-[11px] font-medium text-text-primary mb-2">{t('title')} <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue transition-all placeholder:text-text-muted outline-none"
                    placeholder={t('title_placeholder')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-medium text-text-primary mb-2">{t('sector')}</label>
                    <select
                      value={sectorId}
                      onChange={(e) => setSectorId(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue transition-all outline-none appearance-none"
                    >
                      <option value="">{t('select_sector')}</option>
                      {sectors.map((sector) => (
                        <option key={sector.sectorId} value={sector.sectorId}>
                          {sector.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-text-primary mb-2">{t('modality')} <span className="text-red-500">*</span></label>
                    <select
                      value={modality}
                      onChange={(e) => setModality(e.target.value)}
                      className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue transition-all outline-none appearance-none"
                    >
                      <option value="A">{t('modality_a')}</option>
                      <option value="B">{t('modality_b')}</option>
                      <option value="C">{t('modality_c')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-text-primary mb-2">{t('description')}</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue transition-all placeholder:text-text-muted outline-none custom-scrollbar"
                    placeholder={t('description_placeholder')}
                  />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[11px] font-medium text-text-muted mb-6 border-b border-background-subtle pb-3">{t('technical_details')}</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-[11px] font-medium text-text-primary mb-2">{t('duration')} (h)</label>
                  <input
                    type="number"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                    className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue transition-all outline-none md:appearance-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-text-primary mb-2">{t('places')}</label>
                  <input
                    type="number"
                    value={maxPlaces}
                    onChange={(e) => setMaxPlaces(e.target.value)}
                    className="w-full px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue transition-all outline-none md:appearance-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-text-primary mb-2">{t('icon')}</label>
                  <div className="relative group/icon">
                    <button className="w-full flex items-center justify-between px-4 py-3 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary group-hover/icon:border-consorci-darkBlue transition-all">
                      <span className="flex items-center gap-2">
                        <WorkshopIcon iconName={icon} className="w-5 h-5" />
                        <span className="text-[11px] font-medium">{icon}</span>
                      </span>
                    </button>
                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 shadow-xl hidden group-hover/icon:grid grid-cols-4 gap-1 p-3 z-20 animate-in fade-in slide-in-from-top-1 duration-150">
                      {Object.keys(SVG_ICONS).map((key) => (
                        <button key={key} onClick={() => setIcon(key)} className="p-3 hover:bg-[#EAEFF2] flex justify-center text-[#00426B] transition-colors relative group/item">
                          <WorkshopIcon iconName={key} className="w-5 h-5" />
                          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[6px] font-black uppercase opacity-0 group-hover/item:opacity-100 transition-opacity bg-[#00426B] text-white px-1">{key}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right: Schedule */}
          <div className="md:w-5/12 bg-background-subtle p-8 overflow-y-auto">
            <section>
              <h3 className="text-[11px] font-medium text-text-primary mb-6 flex items-center gap-2 border-b border-border-subtle pb-3">
              <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {t('schedule')}
              </h3>
              <div className="bg-background-surface p-6 border border-border-subtle mb-8 relative">
                <h4 className="text-[11px] font-medium text-text-muted mb-4 text-center">{t('add_slot')}</h4>
                <div className="space-y-4">
                  <div>
                    <select
                      value={tempDay} onChange={(e) => setTempDay(parseInt(e.target.value))}
                      className="w-full px-4 py-2.5 bg-background-subtle border border-border-subtle text-sm font-medium text-text-primary focus:border-consorci-darkBlue outline-none appearance-none"
                    >
                      <option value={1}>{t('monday')}</option>
                      <option value={2}>{t('tuesday')}</option>
                      <option value={3}>{t('wednesday')}</option>
                      <option value={4}>{t('thursday')}</option>
                      <option value={5}>{t('friday')}</option>
                      <option value={6}>{t('saturday')}</option>
                      <option value={0}>{t('sunday')}</option>
                    </select>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input type="time" value={tempStart} onChange={(e) => setTempStart(e.target.value)} className="w-full px-3 py-2 text-sm font-medium text-text-primary border border-border-subtle bg-background-subtle focus:border-consorci-darkBlue outline-none" />
                    </div>
                    <span className="flex items-center text-text-muted">-</span>
                    <div className="flex-1">
                      <input type="time" value={tempEnd} onChange={(e) => setTempEnd(e.target.value)} className="w-full px-3 py-2 text-sm font-medium text-text-primary border border-border-subtle bg-background-subtle focus:border-consorci-darkBlue outline-none" />
                    </div>
                  </div>
                  <button
                    onClick={addScheduleSlot}
                    className="w-full py-3 bg-consorci-darkBlue text-white text-[11px] font-medium hover:bg-consorci-actionBlue transition-all active:scale-95"
                  >
                    + {t('add_day')}
                  </button>
                </div>
              </div>

              <h4 className="text-[11px] font-medium text-text-muted mb-4 px-1">{t('configured_days')}</h4>
              <div className="space-y-3">
                {schedule.map((slot, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-background-surface border border-border-subtle p-4 hover:border-consorci-darkBlue transition-colors group">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-text-primary">{daysMap[slot.dayOfWeek]}</span>
                      <span className="text-[11px] font-normal text-text-muted mt-0.5">{slot.startTime} - {slot.endTime}</span>
                    </div>
                    <button onClick={() => removeScheduleSlot(idx)} className="text-text-muted hover:text-consorci-pinkRed transition-colors p-2 hover:bg-red-500/5 rounded-full">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
                {schedule.length === 0 && (
                  <div className="text-center py-10 border border-dashed border-gray-200 text-gray-300 text-[10px] font-bold uppercase tracking-widest bg-white">
                    {t('no_days')}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-background-subtle border-t border-border-subtle px-8 py-5 flex justify-between items-center shrink-0">
          {error ? (
            <div className="text-red-500 text-[11px] font-medium">{error}</div>
          ) : (
            <div className="text-text-muted text-[11px] font-normal">{t('review_data')}</div>
          )}

          <div className="flex gap-4">
            <button onClick={onClose} className="px-6 py-3 text-[12px] font-medium text-text-muted hover:text-text-primary transition-colors">
              {tCommon('cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-10 py-3 bg-consorci-darkBlue text-white text-[12px] font-medium hover:bg-consorci-actionBlue disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loading size="sm" white message="" />
                  {t('saving')}
                </div>
              ) : t('save_workshop')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkshopModal;
