import React, { useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  RotateCcw,
  RotateCw,
  RemoveFormatting
} from 'lucide-react';

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Write content here...',
  minHeight = '90px'
}) {
  const editorRef = useRef(null);
  const isInternalChangeRef = useRef(false);

  // Sync incoming value to innerHTML when not focused/modified internally
  useEffect(() => {
    if (editorRef.current && !isInternalChangeRef.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
    isInternalChangeRef.current = false;
  }, [value]);

  const handleInput = () => {
    if (editorRef.current && onChange) {
      isInternalChangeRef.current = true;
      const html = editorRef.current.innerHTML;
      onChange(html === '<p><br></p>' || html === '<br>' ? '' : html);
    }
  };

  const executeCmd = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      handleInput();
    }
  };

  const toolbarButtons = [
    { icon: Bold, cmd: 'bold', title: 'Bold (Ctrl+B)' },
    { icon: Italic, cmd: 'italic', title: 'Italic (Ctrl+I)' },
    { icon: Underline, cmd: 'underline', title: 'Underline (Ctrl+U)' },
    { divider: true },
    { icon: List, cmd: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, cmd: 'insertOrderedList', title: 'Numbered List' },
    { divider: true },
    { icon: RotateCcw, cmd: 'undo', title: 'Undo (Ctrl+Z)' },
    { icon: RotateCw, cmd: 'redo', title: 'Redo (Ctrl+Y)' },
    { icon: RemoveFormatting, cmd: 'removeFormat', title: 'Clear Formatting' }
  ];

  return (
    <div
      style={{
        border: '1px solid #CBD5E1',
        borderRadius: '6px',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        transition: 'border-color 0.15s ease'
      }}
    >
      {/* Editor Formatting Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          padding: '4px 6px',
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          flexWrap: 'wrap'
        }}
      >
        {toolbarButtons.map((btn, idx) => {
          if (btn.divider) {
            return (
              <div
                key={`div-${idx}`}
                style={{
                  width: '1px',
                  height: '14px',
                  backgroundColor: '#CBD5E1',
                  margin: '0 3px'
                }}
              />
            );
          }

          const IconComponent = btn.icon;
          return (
            <button
              key={btn.cmd || idx}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault(); // Keep focus in contentEditable
                executeCmd(btn.cmd);
              }}
              title={btn.title}
              style={{
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: 'transparent',
                borderRadius: '4px',
                color: '#475569',
                cursor: 'pointer',
                transition: 'all 0.12s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E2E8F0';
                e.currentTarget.style.color = '#0F172A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#475569';
              }}
            >
              <IconComponent style={{ width: '13px', height: '13px' }} />
            </button>
          );
        })}
      </div>

      {/* Editable Content Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        style={{
          minHeight,
          maxHeight: '260px',
          overflowY: 'auto',
          padding: '8px 10px',
          fontSize: '11.5px',
          lineHeight: '1.5',
          color: '#1E293B',
          outline: 'none',
          fontFamily: 'inherit',
          boxSizing: 'border-box'
        }}
      />
    </div>
  );
}
