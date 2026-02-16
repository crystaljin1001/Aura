/**
 * AuraBackground - Aurora-style animated background with blobs and dot pattern
 * Creates a modern, dynamic atmosphere for the portfolio
 */

export function AuraBackground() {
  return (
    <div className="aurora-bg">
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
      <div className="absolute inset-0 dot-pattern opacity-30" />
    </div>
  );
}
