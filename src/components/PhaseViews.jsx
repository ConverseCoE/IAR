import React from 'react';
import { 
  BarChart3, PieChart, CheckCircle2, Clock, FileCheck, Layers, 
  TrendingUp, Shield, Activity, Users, FileText
} from 'lucide-react';

export function PrePlanningView() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Pre-Planning & Scoping Stage</h2>
        <p className="text-xs text-slate-500 mb-4">Initial plant audit risk scoring, regulatory matrix selection, and team allocation.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-slate-200 p-4 rounded-lg bg-slate-50">
            <h4 className="text-xs font-bold text-slate-800 mb-2">Audit Risk Matrices</h4>
            <div className="text-2xl font-extrabold text-[#D8001D]">98.4%</div>
            <p className="text-[11px] text-slate-500 mt-1">Regulatory compliance alignment</p>
          </div>
          <div className="border border-slate-200 p-4 rounded-lg bg-slate-50">
            <h4 className="text-xs font-bold text-slate-800 mb-2">Assigned Auditors</h4>
            <div className="text-2xl font-extrabold text-slate-900">18 Lead Auditors</div>
            <p className="text-[11px] text-slate-500 mt-1">Deployable across 12 facilities</p>
          </div>
          <div className="border border-slate-200 p-4 rounded-lg bg-slate-50">
            <h4 className="text-xs font-bold text-slate-800 mb-2">Scoping Documents</h4>
            <div className="text-2xl font-extrabold text-emerald-600">4 Approved</div>
            <p className="text-[11px] text-slate-500 mt-1">Ready for fieldwork phase</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlanningView() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Audit Planning & Resource Scheduling</h2>
        <p className="text-xs text-slate-500 mb-4">Detailed audit checklist creation, GxP criteria definition, and plant schedule setup.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-slate-200 p-4 rounded-lg">
            <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>Upcoming Plant Audits</span>
              <span className="text-[10px] bg-red-100 text-[#D8001D] px-2 py-0.5 rounded font-bold">6 Planned</span>
            </h4>
            <ul className="divide-y divide-slate-100 text-xs">
              <li className="py-2 flex justify-between font-medium">
                <span>Ethicon Juarez Needles Facility</span>
                <span className="text-slate-500">Starts Aug 10, 2026</span>
              </li>
              <li className="py-2 flex justify-between font-medium">
                <span>Janssen Leiden Biologics Hub</span>
                <span className="text-slate-500">Starts Aug 18, 2026</span>
              </li>
            </ul>
          </div>
          <div className="border border-slate-200 p-4 rounded-lg">
            <h4 className="text-xs font-bold text-slate-800 mb-2">Checklist Templates</h4>
            <p className="text-xs text-slate-600">ISO 13485 & FDA 21 CFR Part 820 medical device quality checklists attached.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReportingView() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Audit Reporting & Executive Summaries</h2>
        <p className="text-xs text-slate-500 mb-4">Consolidated audit reports, executive summaries, and steering committee decks.</p>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-slate-800">
          <p className="font-bold text-[#D8001D] mb-1">5 Reports Ready for Executive Sign-off</p>
          <p>Reports in this phase undergo final review before submission to the global Quality Committee.</p>
        </div>
      </div>
    </div>
  );
}

export function WrapUpView() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Audit Wrap-Up & CAPA Tracking</h2>
        <p className="text-xs text-slate-500 mb-4">Corrective Action and Preventive Action (CAPA) tracking and final archival.</p>
      </div>
    </div>
  );
}

export function DashboardsView() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Global Intelligent Audit Analytics</h2>
        <p className="text-xs text-slate-500 mb-4">Real-time KPI metrics across all Johnson & Johnson manufacturing sites globally.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-xs text-slate-500 font-medium">Global Audit Velocity</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">94.2%</p>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">↑ +3.1% vs Q2</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-xs text-slate-500 font-medium">CAPA Resolution Time</p>
            <p className="text-2xl font-extrabold text-[#D8001D] mt-1">4.2 Days</p>
            <p className="text-[10px] text-slate-500 font-bold mt-1">Target: &lt; 5 Days</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-xs text-slate-500 font-medium">Compliance Index</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">99.8%</p>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">Zero Critical Gaps</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-xs text-slate-500 font-medium">Active Auditor Squads</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">32 Teams</p>
            <p className="text-[10px] text-slate-500 font-bold mt-1">Americas, EMEA, APAC</p>
          </div>
        </div>
      </div>
    </div>
  );
}
