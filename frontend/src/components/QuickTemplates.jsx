import React from 'react';
import { Button } from './ui/button';
import { BarChart3, Map, FileText, Sparkles } from 'lucide-react';

const quickTemplates = [
  { 
    icon: <BarChart3 className="h-4 w-4" />, 
    label: "Temperature Analysis", 
    query: "Analyze temperature trends in the Pacific Ocean" 
  },
  { 
    icon: <Map className="h-4 w-4" />, 
    label: "Current Mapping", 
    query: "Show current patterns in the Atlantic" 
  },
  { 
    icon: <FileText className="h-4 w-4" />, 
    label: "Data Export", 
    query: "Export salinity data for the last month" 
  },
  { 
    icon: <Sparkles className="h-4 w-4" />, 
    label: "Anomaly Detection", 
    query: "Find unusual patterns in recent data" 
  }
];

const QuickTemplates = ({ onTemplateSelect, className }) => {
  return (
    <div className={className}>
      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
        Quick Actions:
      </p>
      <div className="grid grid-cols-2 gap-2">
        {quickTemplates.map((template, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={() => onTemplateSelect(template.query)}
            className="justify-start text-xs hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-cyan-900/20 dark:hover:text-cyan-400 dark:text-slate-400"
          >
            {template.icon}
            <span className="ml-1 truncate">{template.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export const getQuickTemplates = () => quickTemplates;

export default QuickTemplates;