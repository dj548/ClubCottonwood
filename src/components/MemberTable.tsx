import { format } from 'date-fns';
import type { ClubMember } from '../types/clubCottonwood';

interface MemberTableProps {
  members: ClubMember[];
  selectedMembers: string[];
  onMemberSelect: (memberId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onMemberClick: (member: ClubMember) => void;
  isLoading?: boolean;
}

export default function MemberTable({
  members,
  selectedMembers,
  onMemberSelect,
  onSelectAll,
  onMemberClick,
  isLoading,
}: MemberTableProps) {
  const allSelected = members.length > 0 && selectedMembers.length === members.length;
  const someSelected = selectedMembers.length > 0 && selectedMembers.length < members.length;

  const getStatusBadge = (status: string, _hasQuackTag: boolean) => {
    const baseClasses = 'px-2 py-0.5 rounded-full text-xs font-medium';
    switch (status) {
      case 'Active':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Active</span>;
      case 'Overdue':
        return <span className={`${baseClasses} bg-orange-100 text-orange-800`}>Overdue</span>;
      case 'Expired':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Expired</span>;
      case 'Prospect':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Prospect</span>;
      case 'Lapsed':
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Lapsed</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-600`}>{status}</span>;
    }
  };

  const getDaysLabel = (days: number | undefined) => {
    if (days === undefined || days === null) return '-';
    if (days < 0) {
      return <span className="text-red-600 font-medium">{Math.abs(days)} days overdue</span>;
    }
    if (days === 0) {
      return <span className="text-orange-600 font-medium">Due today</span>;
    }
    if (days <= 30) {
      return <span className="text-orange-600">{days} days</span>;
    }
    return <span className="text-gray-600">{days} days</span>;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[#e1e3e5] shadow-sm p-8">
        <div className="flex items-center justify-center h-32">
          <div className="text-[#6d7175]">Loading members...</div>
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#e1e3e5] shadow-sm p-8">
        <div className="flex flex-col items-center justify-center h-32 text-center">
          <svg className="w-12 h-12 text-[#c9cccf] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-[#6d7175]">No members found</p>
          <p className="text-sm text-[#8c9196] mt-1">Try adjusting your search or sync from Shopify</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e1e3e5] shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-[#f6f6f7] border-b border-[#e1e3e5]">
          <tr>
            <th className="px-4 py-3 text-left w-10">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="rounded border-[#c9cccf] text-[#5CB3E5] focus:ring-[#5CB3E5]"
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[#6d7175] uppercase tracking-wider">
              Member
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[#6d7175] uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[#6d7175] uppercase tracking-wider">
              Quack Tag
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[#6d7175] uppercase tracking-wider">
              Renewal Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[#6d7175] uppercase tracking-wider">
              Days Until Renewal
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[#6d7175] uppercase tracking-wider">
              Last Order
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e1e3e5]">
          {members.map((member) => (
            <tr
              key={member.id}
              className="hover:bg-[#f6f6f7] cursor-pointer transition-colors"
              onClick={() => onMemberClick(member)}
            >
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(member.id)}
                  onChange={(e) => onMemberSelect(member.id, e.target.checked)}
                  className="rounded border-[#c9cccf] text-[#5CB3E5] focus:ring-[#5CB3E5]"
                />
              </td>
              <td className="px-4 py-3">
                <div>
                  <div className="font-medium text-[#202223]">{member.name}</div>
                  <div className="text-sm text-[#6d7175]">{member.email}</div>
                </div>
              </td>
              <td className="px-4 py-3">
                {getStatusBadge(member.status, member.hasQuackTag)}
              </td>
              <td className="px-4 py-3">
                {member.hasQuackTag ? (
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Yes
                  </span>
                ) : (
                  <span className="text-[#8c9196]">No</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  {member.effectiveRenewalDueDate
                    ? format(new Date(member.effectiveRenewalDueDate), 'MMM d, yyyy')
                    : '-'}
                  {member.hasOverride && (
                    <span className="text-xs text-[#5CB3E5]" title="Override">*</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                {getDaysLabel(member.daysUntilRenewal)}
              </td>
              <td className="px-4 py-3 text-sm text-[#6d7175]">
                {member.lastOrderNumber || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
