import { useMemo, useState } from 'react';
import type { Customer, JourneyStage } from './types';
import { ChevronRight, Play } from 'lucide-react';

interface AgentAssistViewProps {
  customer: Customer;
  onPlayRecording?: (eventId: string) => void;
  compact?: boolean; // For dashboard cards vs full page
}

type PhaseInsight = {
  headline: string;
  summary: string;
  action: string;
  actionDeadline: string;
  actionDetail: string;
  signals: string[];
  urgency: 'high' | 'medium' | 'low';
};

const getPhaseInsights = (customer: Customer): PhaseInsight => {
  const recentEvents = customer.interactions.slice(0, 5);
  const stage = customer.stage as JourneyStage;
  
  // Calculate key metrics
  const avgRisk = recentEvents.reduce((sum, e) => sum + e.score.risk, 0) / recentEvents.length;
  const avgOpportunity = recentEvents.reduce((sum, e) => sum + e.score.opportunity, 0) / recentEvents.length;
  const hasRecentRisk = recentEvents.some(e => e.tags.includes('risk'));
  const hasOpportunity = recentEvents.some(e => e.tags.includes('opportunity'));
  
  // Phase-specific intelligence
  switch (stage) {
    case 'Acquisition':
      return {
        headline: avgOpportunity > 60 
          ? 'Strong buying signals detected'
          : 'Standard discovery phase',
        summary: `Prospect showing ${avgOpportunity > 60 ? 'high' : 'moderate'} engagement. ${
          hasOpportunity ? 'Budget discussion indicates readiness.' : 'Continue nurturing.'
        } Last contact ${customer.lastContactDays} days ago.`,
        action: avgOpportunity > 60 
          ? 'Send pricing proposal and schedule demo'
          : 'Schedule product demonstration',
        actionDeadline: avgOpportunity > 60 ? 'Within 24 hours' : 'Within 3 days',
        actionDetail: hasOpportunity 
          ? 'Capitalize on budget approval window'
          : 'Move to next qualification stage',
        signals: [
          `Health score: ${customer.healthScore}/100`,
          `Last contact: ${customer.lastContactDays} days ago`,
          `Engagement level: ${avgOpportunity > 60 ? 'High' : 'Medium'}`,
          `${recentEvents.length} interactions recorded`
        ],
        urgency: avgOpportunity > 60 ? 'high' : 'medium'
      };
      
    case 'Onboarding':
      return {
        headline: customer.healthScore >= 70
          ? 'Onboarding progressing smoothly'
          : 'Implementation assistance needed',
        summary: `Customer ${customer.healthScore >= 70 ? 'actively' : 'slowly'} adopting platform. ${
          hasRecentRisk ? 'Technical blockers identified.' : 'On track for go-live.'
        } ${customer.tenure} months in.`,
        action: customer.healthScore >= 70
          ? 'Schedule success check-in and training'
          : 'Provide hands-on implementation support',
        actionDeadline: customer.healthScore >= 70 ? 'Within 1 week' : 'Today',
        actionDetail: hasRecentRisk
          ? 'Address technical barriers before escalation'
          : 'Ensure smooth transition to full adoption',
        signals: [
          `Onboarding progress: ${customer.healthScore}%`,
          `Time since start: ${customer.tenure} months`,
          `Support tickets: ${recentEvents.filter(e => e.channel === 'crm').length}`,
          `Training completion: ${customer.healthScore > 80 ? 'Complete' : 'In Progress'}`
        ],
        urgency: customer.healthScore < 50 ? 'high' : 'medium'
      };
      
    case 'Support':
      return {
        headline: hasRecentRisk
          ? 'Critical issue requires attention'
          : 'Routine support inquiry',
        summary: `${hasRecentRisk ? 'Customer escalated concern' : 'Standard support case'}. ${
          avgRisk > 50 ? 'Satisfaction at risk.' : 'Issue resolved satisfactorily.'
        } Response time: ${customer.lastContactDays} days.`,
        action: hasRecentRisk
          ? 'Executive escalation and resolution plan'
          : 'Send follow-up documentation',
        actionDeadline: hasRecentRisk ? 'Immediate' : 'Within 48 hours',
        actionDetail: avgRisk > 50
          ? 'Prevent churn—priority resolution required'
          : 'Proactive follow-up to ensure satisfaction',
        signals: [
          `Issue severity: ${avgRisk > 50 ? 'High' : 'Low'}`,
          `Response time: ${customer.lastContactDays} days`,
          `Customer sentiment: ${avgRisk > 50 ? 'Negative' : 'Neutral'}`,
          `Previous issues: ${customer.interactions.filter(e => e.tags.includes('risk')).length}`
        ],
        urgency: avgRisk > 50 ? 'high' : 'low'
      };
      
    case 'Renewal':
      return {
        headline: customer.riskLevel === 'critical' || customer.riskLevel === 'high'
          ? 'High churn risk—immediate action needed'
          : 'Renewal opportunity',
        summary: `${customer.riskLevel === 'critical' ? 'Critical renewal at risk' : 'Standard renewal cycle'}. ${
          hasRecentRisk ? 'Usage declining and competitor mentioned.' : 'Healthy engagement continues.'
        } MRR: $${customer.mrr.toLocaleString()}.`,
        action: customer.riskLevel === 'critical'
          ? 'Executive intervention and retention offer'
          : 'Send renewal proposal with upsell options',
        actionDeadline: customer.riskLevel === 'critical' ? 'Today' : 'Within 2 weeks',
        actionDetail: customer.riskLevel === 'critical'
          ? `$${customer.mrr * 12} ARR at risk—priority escalation`
          : 'Smooth renewal with expansion opportunity',
        signals: [
          `Risk level: ${customer.riskLevel.toUpperCase()}`,
          `Contract MRR: $${customer.mrr.toLocaleString()}`,
          `Health score: ${customer.healthScore}/100`,
          `Competitor mentions: ${recentEvents.filter(e => e.summary.toLowerCase().includes('competitor')).length}`
        ],
        urgency: customer.riskLevel === 'critical' ? 'high' : 'medium'
      };
      
    default:
      return {
        headline: 'Customer overview',
        summary: `Active customer with ${customer.interactions.length} recorded interactions. Health score: ${customer.healthScore}/100.`,
        action: 'Review account and schedule check-in',
        actionDeadline: 'This week',
        actionDetail: 'Maintain regular engagement',
        signals: [
          `Health score: ${customer.healthScore}/100`,
          `MRR: $${customer.mrr.toLocaleString()}`,
          `Last contact: ${customer.lastContactDays} days ago`,
          `Total interactions: ${customer.interactions.length}`
        ],
        urgency: 'medium'
      };
  }
};

const AgentAssistView = ({ customer, onPlayRecording, compact = false }: AgentAssistViewProps) => {
  const insight = useMemo(() => getPhaseInsights(customer), [customer]);
  const lastInteraction = customer.interactions[0];
  const [showHistory, setShowHistory] = useState(false);

  const getUrgencyColor = () => {
    switch (insight.urgency) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#64748b';
    }
  };

  const getUrgencyBgColor = () => {
    switch (insight.urgency) {
      case 'high': return 'bg-red-50 border-red-200';
      case 'medium': return 'bg-amber-50 border-amber-200';
      case 'low': return 'bg-slate-50 border-slate-200';
    }
  };

  // Compact card mode for dashboard
  if (compact) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6">
          {/* Customer header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {lastInteraction ? (
                  <>
                    {new Date(lastInteraction.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, 
                    {' '}{new Date(lastInteraction.ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </>
                ) : (
                  'No recent interaction'
                )}
              </p>
            </div>
            <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wide rounded-lg ${
              customer.stage === 'Acquisition' ? 'bg-blue-100 text-blue-700' :
              customer.stage === 'Onboarding' ? 'bg-purple-100 text-purple-700' :
              customer.stage === 'Support' ? 'bg-orange-100 text-orange-700' :
              customer.stage === 'Renewal' ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {customer.stage}
            </span>
          </div>

          {/* The headline */}
          <h4 className="text-xl font-semibold text-gray-900 leading-snug mb-3">
            {insight.headline}
          </h4>

          {/* Next action box */}
          <div 
            className={`rounded-lg p-4 mb-4 border border-l-4 ${getUrgencyBgColor()}`}
            style={{ borderLeftColor: getUrgencyColor() }}
          >
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              {insight.actionDeadline}
            </div>
            <div className="text-base font-semibold text-gray-900">
              {insight.action}
            </div>
          </div>

          {/* Key signals - show first 3 */}
          <div className="space-y-2">
            {insight.signals.slice(0, 3).map((signal, idx) => (
              <div key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-gray-300 mt-1">•</span>
                <span>{signal}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Full page mode
  return (
    <div className="bg-white min-h-screen font-sans">
      <div className="max-w-4xl mx-auto px-12 py-12">
        
        {/* Last Contact Meta */}
        <div className="text-sm font-medium text-gray-500 tracking-wide mb-4">
          {lastInteraction ? (
            <>
              {new Date(lastInteraction.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, 
              {' '}{new Date(lastInteraction.ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              {' '}· {Math.floor(lastInteraction.durationSec / 60)}:{String(lastInteraction.durationSec % 60).padStart(2, '0')}
            </>
          ) : (
            'No recent interaction'
          )}
        </div>

        {/* The One Thing That Matters */}
        <h1 className="text-4xl font-semibold text-gray-900 leading-tight mb-6">
          {insight.headline}
        </h1>

        <p className="text-lg text-gray-600 leading-relaxed mb-16">
          {insight.summary}
        </p>

        {/* What To Do Next */}
        <div 
          className="bg-gray-50 rounded-xl p-8 mb-16 border-l-4"
          style={{ borderLeftColor: getUrgencyColor() }}
        >
          <div className="text-xs font-semibold text-gray-500 tracking-widest uppercase mb-3">
            Next Action · {insight.actionDeadline}
          </div>
          
          <div className="text-xl font-semibold text-gray-900 mb-2">
            {insight.action}
          </div>

          <div className="text-base text-gray-600">
            {insight.actionDetail}
          </div>
        </div>

        {/* Key Signals */}
        <div className="mb-16">
          <h2 className="text-xs font-semibold text-gray-500 tracking-widest uppercase mb-6">
            Key Indicators
          </h2>

          <div className="space-y-4">
            {insight.signals.map((signal, idx) => (
              <div
                key={idx}
                className="text-lg text-gray-800 pl-5 relative leading-relaxed"
              >
                <span className="absolute left-0 text-gray-300 font-light">·</span>
                {signal}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Interactions - Progressive Disclosure */}
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-base font-medium text-gray-500 mb-8 cursor-pointer hover:text-gray-900 transition-colors"
          >
            <ChevronRight 
              size={16} 
              className={`transform transition-transform ${showHistory ? 'rotate-90' : 'rotate-0'}`}
            />
            {customer.interactions.length} recorded interactions
          </button>

          {showHistory && (
            <div className="space-y-6">
              {customer.interactions.slice(0, 5).map((interaction) => (
              <div
                key={interaction.id}
                className="pb-6 border-b border-gray-100 last:border-0"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-base text-gray-500">
                    {new Date(interaction.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' '}· {new Date(interaction.ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    {' '}· {Math.floor(interaction.durationSec / 60)}:{String(interaction.durationSec % 60).padStart(2, '0')}
                  </div>
                  
                  {onPlayRecording && (
                    <button
                      onClick={() => onPlayRecording(interaction.id)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-all"
                    >
                      <Play size={14} />
                      Play
                    </button>
                  )}
                </div>

                <div className="text-lg text-gray-800">
                  {interaction.title}
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentAssistView;
