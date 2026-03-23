import React, { useEffect, useState } from 'react';

/**
 * UnifiedPanel - a reusable panel for listing and managing entities (clients, admins, staff, delete requests)
 * Props:
 *   title: string - Panel title
 *   endpoint: string - API endpoint to fetch data
 *   columns: array - [{ key, label, render? }]
 *   actions: array - [{ label, onClick, showIf? }]
 *   searchPlaceholder: string
 *   dataOverride: object - Custom data to override the API fetch
 *   loadingOverride: boolean - Custom loading state to override the API fetch
 */
function UnifiedPanel({ title, endpoint, columns, actions = [], searchPlaceholder = 'Search...', dataOverride, loadingOverride }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (dataOverride) return;
    setLoading(true);
    setError(null);
    if (!endpoint) return;
    const access = localStorage.getItem("access");
    fetch(endpoint, {
      headers: access ? { Authorization: `Bearer ${access}` } : {}
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(json => setData(json))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [endpoint, dataOverride]);

  const displayData = dataOverride || data;
  const filtered = displayData.filter(item =>
    columns.some(col => {
      const value = item[col.key];
      return value && value.toString().toLowerCase().includes(search.toLowerCase());
    })
  );
  const isLoading = loadingOverride !== undefined ? loadingOverride : loading;

  return (
    <div className="bg-[#181c27] rounded-lg shadow p-5 mb-6">
      <h2 className="text-lg font-bold mb-4">{title}</h2>
      <input
        className="mb-3 px-3 py-2 w-full bg-[#23283a] border border-[#2a3045] rounded text-[#f0f2f8]"
        placeholder={searchPlaceholder}
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {isLoading && <div>Loading...</div>}
      {error && <div className="text-red-400">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} className="px-3 py-2 text-left text-[#e8ff47]">{col.label}</th>
              ))}
              {actions.length > 0 && <th className="px-3 py-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id || item.pk} className="border-b border-[#23283a]">
                {columns.map(col => (
                  <td key={col.key} className="px-3 py-2">
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-3 py-2 flex gap-2">
                    {actions.map((action, i) =>
                      (!action.showIf || action.showIf(item)) ? (
                        <button
                          key={i}
                          className="bg-[#e8ff47] text-[#181c27] px-2 py-1 rounded text-xs font-bold"
                          onClick={() => action.onClick(item)}
                        >
                          {action.label}
                        </button>
                      ) : null
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && !isLoading && <div className="text-[#7a8499] mt-3">No records found.</div>}
    </div>
  );
}

export default UnifiedPanel;
