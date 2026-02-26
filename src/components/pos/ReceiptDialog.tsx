import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CartItem } from '@/stores/cart-store';

interface SplitPaymentInfo {
  cashAmount: number;
  cardAmount: number;
}

interface ReceiptData {
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  amountReceived?: number;
  change?: number;
  orderType: string;
  customerName?: string;
  membershipName?: string;
  membershipBenefit?: string;
  orderNotes?: string;
  splitPayment?: SplitPaymentInfo;
}

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: ReceiptData | null;
  businessName?: string;
  branchName?: string;
}

export function ReceiptDialog({ open, onOpenChange, receipt, businessName = 'CloudPOS', branchName }: ReceiptDialogProps) {
  if (!receipt) return null;

  const handlePrint = () => window.print();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <div id="receipt-content" className="space-y-3 text-sm font-mono">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold">{businessName}</h2>
            {branchName && <p className="text-xs text-muted-foreground">{branchName}</p>}
            <p className="text-xs text-muted-foreground">{format(new Date(), 'PPpp')}</p>
          </div>

          <Separator />

          <div className="flex justify-between text-xs">
            <span>Order: {receipt.orderNumber}</span>
            <span className="capitalize">{receipt.orderType.replace('_', ' ')}</span>
          </div>

          {receipt.customerName && (
            <div className="text-xs">
              <span className="text-muted-foreground">Customer: </span>
              <span>{receipt.customerName}</span>
              {receipt.membershipName && (
                <span className="ml-1 text-primary">({receipt.membershipName})</span>
              )}
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            {receipt.items.map((item) => {
              const modTotal = item.modifiers.reduce((s, m) => s + m.priceAdjustment, 0);
              const lineTotal = (item.price + modTotal) * item.quantity;
              return (
                <div key={item.id}>
                  <div className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{formatCurrency(lineTotal)}</span>
                  </div>
                  {item.modifiers.length > 0 && (
                    <p className="text-[10px] text-muted-foreground ml-4">
                      {item.modifiers.map((m) => m.optionName).join(', ')}
                    </p>
                  )}
                  {item.notes && (
                    <p className="text-[10px] text-muted-foreground ml-4 italic">
                      Note: {item.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <Separator />

          <div className="space-y-1">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(receipt.subtotal)}</span></div>
            {receipt.discount > 0 && (
              <div className="flex justify-between text-destructive">
                <span>Discount{receipt.membershipBenefit ? ` (${receipt.membershipBenefit})` : ''}</span>
                <span>-{formatCurrency(receipt.discount)}</span>
              </div>
            )}
            {receipt.tax > 0 && (
              <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(receipt.tax)}</span></div>
            )}
            <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatCurrency(receipt.total)}</span></div>
          </div>

          <Separator />

          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Payment</span>
              <span className="capitalize">{receipt.paymentMethod}</span>
            </div>
            {receipt.paymentMethod === 'split' && receipt.splitPayment && (
              <>
                <div className="flex justify-between text-muted-foreground"><span>  Cash</span><span>{formatCurrency(receipt.splitPayment.cashAmount)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>  Card</span><span>{formatCurrency(receipt.splitPayment.cardAmount)}</span></div>
              </>
            )}
            {receipt.amountReceived != null && receipt.paymentMethod !== 'split' && (
              <>
                <div className="flex justify-between"><span>Received</span><span>{formatCurrency(receipt.amountReceived)}</span></div>
                <div className="flex justify-between"><span>Change</span><span>{formatCurrency(receipt.change ?? 0)}</span></div>
              </>
            )}
          </div>

          {receipt.orderNotes && (
            <>
              <Separator />
              <div className="text-xs">
                <span className="text-muted-foreground">Notes: </span>
                <span>{receipt.orderNotes}</span>
              </div>
            </>
          )}

          <Separator />

          <p className="text-center text-xs text-muted-foreground">Thank you for your visit!</p>
        </div>

        <DialogFooter className="print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handlePrint}><Printer className="h-4 w-4 mr-1" /> Print</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
