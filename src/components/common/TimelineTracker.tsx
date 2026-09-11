import React from 'react';
import { Check, X } from 'lucide-react';
import { InstrumentStatus } from '../../types';

interface VerificationWorkflowTimelineProps {
  currentStatus: InstrumentStatus;
  className?: string;
}

export const VerificationWorkflowTimeline: React.FC<VerificationWorkflowTimelineProps> = ({
  currentStatus,
  className = ''
}) => {
  const steps = [
    { title: 'Draft', status: 'DRAFT' },
    { title: 'Submitted', status: 'SUBMITTED' },
    { title: 'Assigned', status: 'ASSIGNED' },
    { title: 'Scheduled', status: 'INSPECTION_SCHEDULED' },
    { title: 'Inspection', status: 'UNDER_INSPECTION' },
    { title: 'Result', status: currentStatus === 'FAILED' ? 'FAILED' : 'PASSED' },
    { title: 'Certificate', status: 'CERTIFICATE_GENERATED' }
  ];

  const getStepIndex = (status: InstrumentStatus): number => {
    switch (status) {
      case 'DRAFT': return 0;
      case 'SUBMITTED': return 1;
      case 'ASSIGNED': return 2;
      case 'INSPECTION_SCHEDULED': return 3;
      case 'UNDER_INSPECTION': return 4;
      case 'PASSED':
      case 'FAILED': return 5;
      case 'CERTIFICATE_GENERATED': return 6;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className={`p-4 bg-slate-50 rounded-2xl border border-slate-200/80 ${className}`}>
      <div className="flex items-center justify-between mb-3.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Verification Lifecycle Progress
        </h4>
        <span className="text-[11px] font-medium text-slate-500">
          Step {currentIndex + 1} of {steps.length}
        </span>
      </div>

      <div className="relative flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex || (index === currentIndex && currentStatus === 'CERTIFICATE_GENERATED');
          const isCurrent = index === currentIndex && currentStatus !== 'CERTIFICATE_GENERATED';
          const isFailed = currentStatus === 'FAILED' && index === 5;

          return (
            <React.Fragment key={step.title}>
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isFailed
                      ? 'bg-rose-600 text-white ring-4 ring-rose-100'
                      : isCompleted
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-cyan-600 text-white ring-4 ring-cyan-100 shadow-md'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isFailed ? (
                    <X className="w-4 h-4 text-white stroke-[2.5]" />
                  ) : isCompleted ? (
                    <Check className="w-4 h-4 text-white stroke-[2.5]" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                <span
                  className={`mt-1.5 text-[11px] whitespace-nowrap font-medium ${
                    isFailed
                      ? 'text-rose-700 font-bold'
                      : isCurrent
                      ? 'text-cyan-700 font-bold'
                      : isCompleted
                      ? 'text-emerald-700 font-semibold'
                      : 'text-slate-500'
                  }`}
                >
                  {step.title}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-1 -mt-4 bg-slate-200">
                  <div
                    className={`h-full transition-all duration-300 ${
                      index < currentIndex ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
