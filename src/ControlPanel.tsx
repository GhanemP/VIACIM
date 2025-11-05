import { useState } from 'react';

interface ControlPanelProps {
  dataSources: Record<string, boolean>;
  onToggleDataSource: (key: string) => void;
  onCreateCard: (name: string) => void;
  onAddItemToCard: (cardId: string, item: string) => void;
  onQuickFilter: (filter: string) => void;
}

const ControlPanel = ({ dataSources, onToggleDataSource, onCreateCard, onAddItemToCard, onQuickFilter }: ControlPanelProps) => {
  const [newCardName, setNewCardName] = useState('');
  const [targetCardId, setTargetCardId] = useState('');
  const [itemToAdd, setItemToAdd] = useState('');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Control Panel</h3>
        <div className="space-x-2">
          <button onClick={() => onQuickFilter('risk')} className="px-3 py-1 bg-red-50 text-red-600 rounded-md text-xs">Risk</button>
          <button onClick={() => onQuickFilter('opportunity')} className="px-3 py-1 bg-green-50 text-green-600 rounded-md text-xs">Opportunity</button>
          <button onClick={() => onQuickFilter('flag')} className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-md text-xs">Flag</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Data Sources</p>
          <div className="space-y-2">
            {Object.keys(dataSources).map(key => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!dataSources[key]}
                  onChange={() => onToggleDataSource(key)}
                  className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                />
                <span className="capitalize text-gray-700">{key.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Create Card</p>
          <div className="flex gap-2">
            <input value={newCardName} onChange={(e) => setNewCardName(e.target.value)} placeholder="Card name" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <button onClick={() => { if (newCardName.trim()) { onCreateCard(newCardName.trim()); setNewCardName(''); } }} className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm">Create</button>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Add item to card</p>
          <div className="flex gap-2">
            <input value={targetCardId} onChange={(e) => setTargetCardId(e.target.value)} placeholder="Card ID" className="w-1/3 px-2 py-2 border rounded-lg text-sm" />
            <input value={itemToAdd} onChange={(e) => setItemToAdd(e.target.value)} placeholder="customer/call id" className="w-2/3 px-2 py-2 border rounded-lg text-sm" />
          </div>
          <div className="mt-2">
            <button onClick={() => { if (targetCardId && itemToAdd) { onAddItemToCard(targetCardId, itemToAdd); setItemToAdd(''); } }} className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm">Add</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
