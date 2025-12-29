import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { clubCottonwoodApi } from '../api/clubCottonwood';

interface EmailComposerProps {
  memberIds: string[];
  memberCount: number;
  onClose: () => void;
  onSent: () => void;
}

export default function EmailComposer({
  memberIds,
  memberCount,
  onClose,
  onSent,
}: EmailComposerProps) {
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [result, setResult] = useState<{ sentCount: number; failedCount: number } | null>(null);

  const sendMutation = useMutation({
    mutationFn: () =>
      clubCottonwoodApi.sendEmail({
        memberIds,
        subject,
        htmlBody: wrapInEmailTemplate(htmlBody),
        textBody: stripHtml(htmlBody),
      }),
    onSuccess: (data) => {
      setResult({ sentCount: data.sentCount, failedCount: data.failedCount });
    },
  });

  const wrapInEmailTemplate = (body: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #5CB3E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Club Cottonwood</h1>
        </div>
        <div class="content">
            ${body}
        </div>
        <div class="footer">
            <p>Cottonwood in the Park</p>
        </div>
    </div>
</body>
</html>`;

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  };

  const handleSend = () => {
    if (!subject.trim() || !htmlBody.trim()) {
      return;
    }
    sendMutation.mutate();
  };

  const canSend = subject.trim() && htmlBody.trim() && !sendMutation.isPending;

  if (result) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#202223] mb-2">Emails Sent</h2>
            <p className="text-[#6d7175] mb-4">
              Successfully sent {result.sentCount} email{result.sentCount !== 1 ? 's' : ''}.
              {result.failedCount > 0 && (
                <span className="text-red-600">
                  {' '}{result.failedCount} failed.
                </span>
              )}
            </p>
            <button
              onClick={onSent}
              className="px-6 py-2 bg-[#5CB3E5] text-white rounded-lg text-sm font-medium hover:bg-[#45A5DB] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e1e3e5]">
          <div>
            <h2 className="text-xl font-semibold text-[#202223]">Compose Email</h2>
            <p className="text-sm text-[#6d7175]">
              Sending to {memberCount} member{memberCount !== 1 ? 's' : ''}
            </p>
          </div>
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
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#202223] mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
              className="w-full px-3 py-2 border border-[#e1e3e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5CB3E5] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#202223] mb-2">Message</label>
            <textarea
              value={htmlBody}
              onChange={(e) => setHtmlBody(e.target.value)}
              rows={12}
              placeholder="Write your message here...

You can use basic HTML formatting like:
<p>Paragraph text</p>
<strong>Bold text</strong>
<a href='url'>Link text</a>"
              className="w-full px-3 py-2 border border-[#e1e3e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5CB3E5] focus:border-transparent resize-none font-mono"
            />
            <p className="text-xs text-[#8c9196] mt-1">
              Basic HTML is supported. Email will be wrapped in Club Cottonwood template.
            </p>
          </div>

          {sendMutation.isError && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              Failed to send emails. Please try again.
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
            onClick={handleSend}
            disabled={!canSend}
            className="px-4 py-2 bg-[#5CB3E5] text-white rounded-lg text-sm font-medium hover:bg-[#45A5DB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sendMutation.isPending ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
