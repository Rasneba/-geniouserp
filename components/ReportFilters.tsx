import { ReactNode } from "react";

interface ReportFiltersProps {
  onShow?: () => void;
  dateRange?: string;
  onDateRangeChange?: (val: string) => void;
  facility?: string;
  onFacilityChange?: (val: string) => void;
  person?: string;
  onPersonChange?: (val: string) => void;
  card?: string;
  onCardChange?: (val: string) => void;
  freez?: string;
  onFreezChange?: (val: string) => void;
  remaining?: string;
  onRemainingChange?: (val: string) => void;
  children?: ReactNode;
}

export const ReportFilters = ({
  onShow,
  dateRange = "01/01/2026 - 12/31/2026",
  onDateRangeChange,
  facility = "",
  onFacilityChange,
  person = "",
  onPersonChange,
  card = "",
  onCardChange,
  freez = "",
  onFreezChange,
  remaining = "",
  onRemainingChange,
}: ReportFiltersProps) => {
  return (
    <div className="grid grid-cols-7 gap-2 p-3 border border-gray-200 rounded-t-md items-end">
      <div>
        <label className="text-xs font-bold text-gray-500 block mb-1">Date</label>
        <input
          type="text"
          className="w-full border p-2 rounded text-sm"
          placeholder="01/01/2026 - 12/31/2026"
          value={dateRange}
          onChange={(e) => onDateRangeChange?.(e.target.value)}
        />
      </div>
      {[
        { label: "Facility", value: facility, onChange: onFacilityChange },
        { label: "Person", value: person, onChange: onPersonChange },
        { label: "Card", value: card, onChange: onCardChange },
        { label: "Freez", value: freez, onChange: onFreezChange },
        { label: "Remaining", value: remaining, onChange: onRemainingChange },
      ].map(({ label, value, onChange }) => (
        <div key={label}>
          <label className="text-xs font-bold text-gray-500 block mb-1">{label}</label>
          <select
            className="w-full border p-2 rounded text-sm"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
          >
            <option value="">Select {label}</option>
          </select>
        </div>
      ))}
      <button
        onClick={onShow}
        className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
      >
        Show
      </button>
    </div>
  );
};
