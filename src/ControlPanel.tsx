import { useState, type KeyboardEvent } from 'react';

interface ControlPanelProps {
  dataSources: Record<string, boolean>;
  onToggleDataSource: (key: string) => void;
  onCreateCard: (name: string) => void;
  onAddItemToCard: (cardId: string, item: string) => void;
  onQuickFilter: (filter: string) => void;
  activeQuickFilter: string | null;
}

const ControlPanel = ({ dataSources, onToggleDataSource, onCreateCard, onAddItemToCard, onQuickFilter, activeQuickFilter }: ControlPanelProps) => {
  const [newCardName, setNewCardName] = useState('');
  const [targetCardId, setTargetCardId] = useState('');
  const [itemToAdd, setItemToAdd] = useState('');

  const handleCreateCard = () => {
    if (newCardName.trim()) {
      onCreateCard(newCardName.trim());
      setNewCardName('');
    }
  };

  const handleAddItem = () => {
    if (targetCardId && itemToAdd) {
      onAddItemToCard(targetCardId, itemToAdd);
      setItemToAdd('');
    }
  };

  const handleCardNameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreateCard();
    } else if (e.key === 'Escape') {
      setNewCardName('');
    }
  };

  const handleItemKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddItem();
    } else if (e.key === 'Escape') {
      setItemToAdd('');
      setTargetCardId('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6" role="region" aria-label="Control Panel">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Control Panel</h3>
        <div className="space-x-2" role="group" aria-label="Quick filters">
          <button
            onClick={() => onQuickFilter('risk')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeQuickFilter === 'risk'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
            aria-label="Filter by risk events"
            aria-pressed={activeQuickFilter === 'risk' ? 'true' : 'false'}
          >
            Risk
          </button>
          <button
            onClick={() => onQuickFilter('opportunity')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeQuickFilter === 'opportunity'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
            aria-label="Filter by opportunity events"
            aria-pressed={activeQuickFilter === 'opportunity' ? 'true' : 'false'}
          >
            Opportunity
          </button>
          <button
            onClick={() => onQuickFilter('flag')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeQuickFilter === 'flag'
                ? 'bg-yellow-600 text-white shadow-md'
                : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
            }`}
            aria-label="Filter by flagged events"
            aria-pressed={activeQuickFilter === 'flag' ? 'true' : 'false'}
          >
            Flag
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2" id="data-sources-label">Data Sources</p>
          <div className="space-y-2" role="group" aria-labelledby="data-sources-label">
            {Object.keys(dataSources).map(key => (
              <label key={key} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={!!dataSources[key]}
                  onChange={() => onToggleDataSource(key)}
                  className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  aria-label={`Toggle ${key.replace(/_/g, ' ')} data source`}
                />
                <span className="capitalize text-gray-700">{key.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="card-name-input" className="text-xs font-medium text-gray-600 mb-2 block">Create Card</label>
          <div className="flex gap-2">
            <input
              id="card-name-input"
              value={newCardName}
              onChange={(e) => setNewCardName(e.target.value)}
              onKeyDown={handleCardNameKeyDown}
              placeholder="Card name"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Enter card name"
            />
            <button
              onClick={handleCreateCard}
              className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!newCardName.trim()}
              aria-label="Create new card"
            >
              Create
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Press Enter to create</p>
        </div>

        <div>
          <label htmlFor="card-id-input" className="text-xs font-medium text-gray-600 mb-2 block">Add item to card</label>
          <div className="flex gap-2">
            <input
              id="card-id-input"
              value={targetCardId}
              onChange={(e) => setTargetCardId(e.target.value)}
              onKeyDown={handleItemKeyDown}
              placeholder="Card ID"
              className="w-1/3 px-2 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              aria-label="Enter card ID"
            />
            <input
              id="item-id-input"
              value={itemToAdd}
              onChange={(e) => setItemToAdd(e.target.value)}
              onKeyDown={handleItemKeyDown}
              placeholder="customer/call id"
              className="w-2/3 px-2 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              aria-label="Enter customer or call ID"
            />
          </div>
          <div className="mt-2">
            <button
              onClick={handleAddItem}
              className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!targetCardId || !itemToAdd}
              aria-label="Add item to card"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Press Enter to add</p>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
