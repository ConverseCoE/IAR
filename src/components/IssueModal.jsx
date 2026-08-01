import React, { useState } from 'react';
import { X, AlertOctagon, Plus, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function IssueModal({ isOpen, report, onClose, onSaveIssue }) {
  if (!isOpen || !report) return null;

  const [issues, setIssues] = useState(report.issueIndicator.issues || []);
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState('Critical');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddIssue = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newIss = {
      id: `ISS-0${issues.length + 1}`,
      title,
      severity,
      status: "Open",
      date: new Date().toLocaleDateString()
    };

    const updated = [...issues, newIss];
    setIssues(updated);
    setTitle('');
    setShowAddForm(false);
  };

  const handleSave = () => {
    onSaveIssue(report.id, issues);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container p-6 max-w-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-[#D8001D] flex items-center justify-center shadow-xs">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Issue Indicator Register
                <span className="text-xs bg-red-600 text-white font-bold px-2 py-0.5 rounded-full">
                  {issues.length} Flagged
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {report.fullName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Issues List */}
        <div className="py-4 space-y-3">
          {issues.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              No issues flagged for this audit report.
            </div>
          ) : (
            issues.map((iss) => (
              <div key={iss.id} className="p-3.5 bg-red-50/50 border border-red-200 rounded-lg flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{iss.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      iss.severity === 'Critical' ? 'bg-[#D8001D] text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {iss.severity}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-3">
                    <span>Logged: <strong>{iss.date}</strong></span>
                    <span>Status: <strong className="text-red-700">{iss.status}</strong></span>
                  </div>
                </div>
              </div>
            ))
          )}

          {showAddForm ? (
            <form onSubmit={handleAddIssue} className="p-4 bg-white border-2 border-dashed border-red-300 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-900">Flag New Audit Issue</h4>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Issue Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Non-conformance in sterilization temperature logs"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-text w-full text-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="input-select text-xs"
                >
                  <option value="Critical">Critical Severity</option>
                  <option value="Minor">Minor Severity</option>
                </select>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary text-xs">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary text-xs">
                    Flag Issue
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 bg-[#D8001D] text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 hover:bg-[#A00014] transition-colors shadow-red"
            >
              <Plus className="w-4 h-4" />
              <span>Flag New Audit Issue</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-secondary text-xs">
            Close
          </button>
          <button onClick={handleSave} className="btn btn-primary text-xs">
            Save Indicator Register
          </button>
        </div>

      </div>
    </div>
  );
}
