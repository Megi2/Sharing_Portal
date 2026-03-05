/**
 * 공통 UI 컴포넌트: Badge, NavButton, FilterButton
 */
import React from "react";

export const Badge = ({ children, variant = "blue" }) => {
  const map = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700",
    slate: "bg-slate-100 text-slate-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[variant] ?? map.blue}`}>
      {children}
    </span>
  );
};

export const NavButton = ({ active, icon: Icon, children, onClick }) => (
  <button
    onClick={onClick}
    className={[
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
      "hover:bg-slate-800 text-slate-400",
      active ? "bg-orange-600 text-white hover:bg-orange-600" : "",
    ].join(" ")}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium text-sm">{children}</span>
  </button>
);

export const FilterButton = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={[
      "px-5 py-2 rounded-lg text-sm font-bold transition-all",
      active ? "bg-white text-orange-600 shadow-sm" : "text-slate-600 hover:text-slate-900",
    ].join(" ")}
  >
    {children}
  </button>
);
