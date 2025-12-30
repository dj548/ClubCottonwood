import { useState } from 'react';

interface EmailTemplate {
  subject: string;
  greeting: string;
  signature: string;
  includeRenewalDate: boolean;
  includeMembershipStatus: boolean;
  includeOrderHistory: boolean;
}

const defaultTemplate: EmailTemplate = {
  subject: 'Club Cottonwood Membership Update',
  greeting: 'Dear {name},',
  signature: 'Best regards,\nClub Cottonwood Team',
  includeRenewalDate: true,
  includeMembershipStatus: true,
  includeOrderHistory: false,
};

export default function EmailSettings() {
  const [template, setTemplate] = useState<EmailTemplate>(() => {
    const saved = localStorage.getItem('clubCottonwood_emailTemplate');
    return saved ? JSON.parse(saved) : defaultTemplate;
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('clubCottonwood_emailTemplate', JSON.stringify(template));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setTemplate(defaultTemplate);
    localStorage.removeItem('clubCottonwood_emailTemplate');
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Settings</h1>
        <p className="text-gray-600 mb-8">
          Configure the format and options for outreach emails sent to members.
        </p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Subject Line */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Subject Line
            </label>
            <input
              type="text"
              value={template.subject}
              onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Email subject..."
            />
          </div>

          {/* Greeting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Greeting Template
            </label>
            <input
              type="text"
              value={template.greeting}
              onChange={(e) => setTemplate({ ...template, greeting: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Dear {name},"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use {'{name}'} to insert the member's name
            </p>
          </div>

          {/* Signature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Signature
            </label>
            <textarea
              value={template.signature}
              onChange={(e) => setTemplate({ ...template, signature: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your signature..."
            />
          </div>

          {/* Include Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Include in Emails
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={template.includeRenewalDate}
                  onChange={(e) => setTemplate({ ...template, includeRenewalDate: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Renewal date</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={template.includeMembershipStatus}
                  onChange={(e) => setTemplate({ ...template, includeMembershipStatus: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Membership status</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={template.includeOrderHistory}
                  onChange={(e) => setTemplate({ ...template, includeOrderHistory: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Order history summary</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="px-6 py-2 text-white rounded-lg font-medium transition-colors"
              style={{ background: 'linear-gradient(135deg, #6FA7CE 0%, #8EBC67 100%)' }}
            >
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-500 mb-2">Subject: {template.subject}</div>
            <div className="border-t border-gray-200 pt-4 space-y-4 text-gray-700">
              <p>{template.greeting.replace('{name}', 'John Smith')}</p>
              <p className="text-gray-400 italic">[Email body will go here]</p>
              {template.includeRenewalDate && (
                <p className="text-sm">Renewal Date: January 15, 2025</p>
              )}
              {template.includeMembershipStatus && (
                <p className="text-sm">Status: Active Member</p>
              )}
              {template.includeOrderHistory && (
                <p className="text-sm">Previous Orders: 3</p>
              )}
              <p className="whitespace-pre-line">{template.signature}</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          Email sending options will be added in a future update.
        </p>
      </div>
    </div>
  );
}
