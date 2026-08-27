import React, { useState } from 'react';
import { X, Plus, Check, ShieldCheck, DollarSign, Edit3, Trash2 } from 'lucide-react';

export default function DiscussionModal({ isOpen, type, report, onClose, onSave }) {
  if (!isOpen || !report) return null;

  const isIT = type === 'IT';
  const initialItems = isIT ? report.itDiscussion.items : report.finOpsDiscussion.items;
  
  const [items, setItems] = useState(initialItems || []);
  const [newTopic, setNewTopic] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    const newItem = {
      id: `${isIT ? 'IT' : 'FO'}-${Date.now().toString().slice(-3)}`,
      topic: newTopic,
      status: "Open",
      priority: newPriority,
      assignee: "Lead Auditor (SA)",
      notes: newNotes || "No additional notes provided."
    };

    setItems([...items, newItem]);
    setNewTopic('');
    setNewNotes('');
    setShowAddForm(false);
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleSaveAll = () => {
    onSave(type, items);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container p-6 max-w-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isIT ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {isIT ? <ShieldCheck className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isIT ? 'IT Discussion Points' : 'FinOps Discussion Points'}
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

        {/* Content Items */}
        <div className="py-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No discussion points currently logged for this section.
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{item.topic}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      item.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.priority} Priority
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {item.id}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-mono">{item.notes}</p>
                  <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-3">
                    <span>Assignee: <strong>{item.assignee}</strong></span>
                    <span>Status: <strong className="text-blue-600">{item.status}</strong></span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                  title="Delete Point"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}

          {/* Add Form Trigger */}
          {showAddForm ? (
            <form onSubmit={handleAddItem} className="p-4 bg-white border-2 border-dashed border-red-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-900">Add New Discussion Point</h4>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Topic Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Server Log Retention Discrepancy"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="input-text w-full text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Notes & Description</label>
                <textarea
                  rows="2"
                  placeholder="Describe the issue or observation..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="input-text w-full text-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="input-select text-xs"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary text-xs">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary text-xs">
                    Add Item
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-red-300 hover:bg-red-50/50 rounded-lg text-xs font-semibold text-slate-600 hover:text-[#D8001D] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add {isIT ? 'IT' : 'FinOps'} Discussion Point</span>
            </button>
          )}

        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Total Points: {items.length}
          </span>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn btn-secondary text-xs">
              Close
            </button>
            <button onClick={handleSaveAll} className="btn btn-primary text-xs">
              Save Changes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
