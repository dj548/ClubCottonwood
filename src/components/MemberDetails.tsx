import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { clubCottonwoodApi } from '../api/clubCottonwood';
import type { ClubMember } from '../types/clubCottonwood';

interface MemberDetailsProps {
  member: ClubMember;
  onClose: () => void;
  onUpdate: () => void;
}

export default function MemberDetails({ member: initialMember, onClose, onUpdate }: MemberDetailsProps) {
  // Fetch full member details including orders
  const { data: memberDetails } = useQuery({
    queryKey: ['club-cottonwood', 'member', initialMember.id],
    queryFn: () => clubCottonwoodApi.getMember(initialMember.id),
    initialData: initialMember,
  });

  const member = memberDetails || initialMember;

  const [notes, setNotes] = useState(member.notes || '');
  const [overrideDate, setOverrideDate] = useState(
    member.hasOverride && member.effectiveRenewalDueDate
      ? member.effectiveRenewalDueDate.split('T')[0]
      : ''
  );
  const [hasChanges, setHasChanges] = useState(false);

  const updateMutation = useMutation({
    mutationFn: () =>
      clubCottonwoodApi.updateMember(member.id, {
        notes: notes !== member.notes ? notes : undefined,
        renewalOverrideDate: overrideDate ? new Date(overrideDate).toISOString() : undefined,
        clearOverride: !overrideDate && member.hasOverride ? true : undefined,
      }),
    onSuccess: () => {
      onUpdate();
    },
  });

  const addTagMutation = useMutation({
    mutationFn: () => clubCottonwoodApi.addTag(member.id),
    onSuccess: () => {
      onUpdate();
    },
  });

  const removeTagMutation = useMutation({
    mutationFn: () => clubCottonwoodApi.removeTag(member.id),
    onSuccess: () => {
      onUpdate();
    },
  });

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setHasChanges(true);
  };

  const handleOverrideDateChange = (value: string) => {
    setOverrideDate(value);
    setHasChanges(true);
  };

  const handleSave = () => {
    updateMutation.mutate();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Overdue':
        return 'bg-orange-100 text-orange-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      case 'Prospect':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e1e3e5]">
          <h2 className="text-xl font-semibold text-[#202223]">Member Details</h2>
          <button
            onClick={onClose}
            className="text-[#6d7175] hover:text-[#202223] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-2xl font-bold text-[#202223] mb-1">{member.name}</h3>
            <p className="text-[#6d7175]">{member.email}</p>
            {member.phone && <p className="text-[#6d7175]">{member.phone}</p>}
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(member.status)}`}>
              {member.status}
            </span>
            {member.hasQuackTag ? (
              <span className="flex items-center gap-1 text-green-600 text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Has Quack Tag
              </span>
            ) : (
              <span className="text-sm text-[#8c9196]">No Quack Tag</span>
            )}
          </div>

          {/* Tag Management */}
          <div className="bg-[#f6f6f7] rounded-lg p-4">
            <h4 className="text-sm font-medium text-[#202223] mb-2">Tag Management</h4>
            <div className="flex gap-2">
              {member.hasQuackTag ? (
                <button
                  onClick={() => removeTagMutation.mutate()}
                  disabled={removeTagMutation.isPending}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  {removeTagMutation.isPending ? 'Removing...' : 'Remove Quack Tag'}
                </button>
              ) : (
                <button
                  onClick={() => addTagMutation.mutate()}
                  disabled={addTagMutation.isPending}
                  className="px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  {addTagMutation.isPending ? 'Adding...' : 'Add Quack Tag'}
                </button>
              )}
            </div>
          </div>

          {/* Membership Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#6d7175] uppercase tracking-wider mb-1">
                Join Date
              </label>
              <p className="text-[#202223]">
                {member.joinDate
                  ? format(new Date(member.joinDate), 'MMM d, yyyy')
                  : 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6d7175] uppercase tracking-wider mb-1">
                Last Renewal
              </label>
              <p className="text-[#202223]">
                {member.lastRenewalDate
                  ? format(new Date(member.lastRenewalDate), 'MMM d, yyyy')
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Renewal Date Override */}
          <div>
            <label className="block text-sm font-medium text-[#202223] mb-2">
              Renewal Due Date {member.hasOverride && <span className="text-[#5CB3E5]">(Override)</span>}
            </label>
            <input
              type="date"
              value={overrideDate}
              onChange={(e) => handleOverrideDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-[#e1e3e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5CB3E5] focus:border-transparent"
            />
            {overrideDate && (
              <button
                onClick={() => handleOverrideDateChange('')}
                className="text-xs text-[#5CB3E5] mt-1 hover:underline"
              >
                Clear override
              </button>
            )}
            <p className="text-xs text-[#8c9196] mt-1">
              Leave empty to use calculated date (last renewal + 1 year)
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[#202223] mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-[#e1e3e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5CB3E5] focus:border-transparent resize-none"
              placeholder="Add notes about this member..."
            />
          </div>

          {/* Order History */}
          {member.orders && member.orders.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-[#6d7175] uppercase tracking-wider mb-2">
                Membership Order History
              </label>
              <div className="bg-[#f6f6f7] rounded-lg divide-y divide-[#e1e3e5]">
                {member.orders.map((order, index) => (
                  <div key={order.orderNumber} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-[#202223]">{order.orderNumber}</span>
                      {order.isOriginalOrder && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                          Original
                        </span>
                      )}
                      {!order.isOriginalOrder && index === member.orders!.length - 1 && (
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          Latest Renewal
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-[#6d7175]">
                      {format(new Date(order.orderDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last Order (fallback if no order history) */}
          {!member.orders?.length && member.lastOrderNumber && (
            <div>
              <label className="block text-xs font-medium text-[#6d7175] uppercase tracking-wider mb-1">
                Last Order
              </label>
              <p className="text-[#202223]">{member.lastOrderNumber}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e1e3e5] bg-[#f6f6f7]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#6d7175] hover:text-[#202223] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || updateMutation.isPending}
            className="px-4 py-2 bg-[#5CB3E5] text-white rounded-lg text-sm font-medium hover:bg-[#45A5DB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
