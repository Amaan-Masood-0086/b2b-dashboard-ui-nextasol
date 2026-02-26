import { useEffect, useState } from 'react';
import { Keyboard } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const SHORTCUTS = [
  { key: 'F2', description: 'Focus product search' },
  { key: 'Enter', description: 'Proceed to checkout' },
  { key: 'Delete', description: 'Clear cart' },
  { key: 'Escape', description: 'Close dialogs / clear search' },
  { key: '?', description: 'Show this help' },
];

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-30 gap-1.5 shadow-md print:hidden"
        onClick={() => setOpen(true)}
      >
        <Keyboard className="h-4 w-4" /> Shortcuts
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" /> Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {SHORTCUTS.map((s) => (
              <div key={s.key} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-muted-foreground">{s.description}</span>
                <kbd className="px-2 py-1 text-xs font-mono rounded border bg-muted">{s.key}</kbd>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
