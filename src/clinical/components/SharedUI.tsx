
import React from 'react';

export const Card: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    <div className="px-4 py-3 border-bottom border-slate-100 bg-slate-50/50">
      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</h2>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

export const Label: React.FC<{ label: string; required?: boolean }> = ({ label, required }) => (
  <label className="block text-xs font-bold text-slate-700 mb-1">
    {label}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string; required?: boolean }> = (props) => (
  <div className="mb-4">
    {props.label && <Label label={props.label} required={props.required} />}
    <input
      {...props}
      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
    />
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; required?: boolean; options: { value: string; label: string }[] }> = ({ label, required, options, ...props }) => (
  <div className="mb-4">
    {label && <Label label={label} required={required} />}
    <select
      {...props}
      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
    >
      <option value="">Select...</option>
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; required?: boolean }> = (props) => (
  <div className="mb-4">
    {props.label && <Label label={props.label} required={props.required} />}
    <textarea
      {...props}
      rows={props.rows || 3}
      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
    />
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' }> = ({ variant = 'primary', className = "", ...props }) => {
  const variants = {
    primary: "bg-blue-900 text-white hover:bg-blue-800",
    secondary: "bg-pink-600 text-white hover:bg-pink-700",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
    outline: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100"
  };

  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    />
  );
};
