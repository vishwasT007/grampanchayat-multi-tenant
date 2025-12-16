/**
 * Tenant Indicator Component
 * Shows current tenant in development mode
 * Allows switching between tenants for testing
 */

import React, { useState } from 'react';
import { getTenantInfo, getActiveTenants, switchTenant } from '../utils/tenant';

export default function TenantIndicator() {
  const [isExpanded, setIsExpanded] = useState(false);
  const tenantInfo = getTenantInfo();
  const allTenants = getActiveTenants();
  
  // Only show in development mode
  if (import.meta.env.PROD) {
    return null;
  }
  
  const handleSwitchTenant = (tenantId) => {
    switchTenant(tenantId);
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isExpanded ? (
        // Collapsed view
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all flex items-center gap-2"
        >
          <span className="text-lg">🏛️</span>
          <div className="text-left">
            <div className="text-xs font-semibold opacity-75">Current Tenant</div>
            <div className="text-sm font-bold">{tenantInfo.id}</div>
          </div>
        </button>
      ) : (
        // Expanded view with tenant selector
        <div className="bg-white rounded-lg shadow-2xl p-4 w-80 border-2 border-blue-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>🏛️</span>
              Tenant Selector
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>
          
          <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-200">
            <div className="text-xs text-blue-600 font-semibold mb-1">
              CURRENT TENANT
            </div>
            <div className="text-sm font-bold text-blue-900">{tenantInfo.name}</div>
            <div className="text-xs text-blue-600 mt-1">ID: {tenantInfo.id}</div>
          </div>
          
          <div className="text-xs font-semibold text-gray-600 mb-2">
            SWITCH TO:
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {allTenants.map((tenant) => (
              <button
                key={tenant.id}
                onClick={() => handleSwitchTenant(tenant.id)}
                disabled={tenant.id === tenantInfo.id}
                className={`
                  w-full text-left px-3 py-2 rounded border transition-all
                  ${tenant.id === tenantInfo.id
                    ? 'bg-blue-100 border-blue-300 cursor-not-allowed opacity-50'
                    : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                  }
                `}
              >
                <div className="text-sm font-semibold text-gray-800">
                  {tenant.name}
                </div>
                <div className="text-xs text-gray-500">
                  ID: {tenant.id}
                  {tenant.domain && ` • ${tenant.domain}`}
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              💡 <strong>Tip:</strong> Use ?tenant=ID in URL to test different GPs
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
