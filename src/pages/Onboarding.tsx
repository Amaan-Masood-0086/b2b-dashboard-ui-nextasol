import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Building2, MapPin, ShoppingBag, Clock, Check, ChevronRight, SkipForward } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const STEPS = [
  { title: 'Business Profile', description: 'Set up your business details', icon: Building2 },
  { title: 'First Branch', description: 'Create your first location', icon: MapPin },
  { title: 'First Product', description: 'Add a category and product', icon: ShoppingBag },
  { title: 'Open Shift', description: 'Start taking orders', icon: Clock },
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'PKR', 'INR', 'EGP', 'TRY', 'BRL', 'MXN', 'CAD', 'AUD'];
const TIMEZONES = ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Dubai', 'Asia/Karachi', 'Asia/Kolkata', 'Asia/Riyadh', 'Africa/Cairo'];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { setCurrency } = useAuthStore();
  const [step, setStep] = useState(0);

  // Step 1: Business Profile
  const [business, setBusiness] = useState({ timezone: 'America/New_York', currency: 'USD', address: '' });

  // Step 2: Branch
  const [branch, setBranch] = useState({ name: '', phone: '', address: '', taxRate: '16' });

  // Step 3: Category + Product
  const [category, setCategory] = useState({ name: '' });
  const [product, setProduct] = useState({ name: '', price: '', stock: '50' });

  // Step 4: Opening balance
  const [openingBalance, setOpeningBalance] = useState('200');

  const saveBusiness = useMutation({
    mutationFn: () => api.patch('/merchants/profile', business),
    onSuccess: () => {
      setCurrency(business.currency);
      toast.success('Business profile saved!');
      setStep(1);
    },
    onError: () => toast.error('Failed to save profile'),
  });

  const saveBranch = useMutation({
    mutationFn: () => api.post('/branches', { ...branch, taxRate: parseFloat(branch.taxRate), currency: business.currency }),
    onSuccess: () => {
      toast.success('Branch created!');
      setStep(2);
    },
    onError: () => toast.error('Failed to create branch'),
  });

  const saveProduct = useMutation({
    mutationFn: async () => {
      await api.post('/branches/demo-branch-001/categories', { name: category.name, sortOrder: 0 });
      await api.post('/branches/demo-branch-001/products', {
        name: product.name,
        price: parseFloat(product.price),
        stock: parseInt(product.stock),
        categoryId: 'new-cat',
      });
    },
    onSuccess: () => {
      toast.success('Product added!');
      setStep(3);
    },
    onError: () => toast.error('Failed to add product'),
  });

  const openShiftMut = useMutation({
    mutationFn: () => api.post('/branches/demo-branch-001/shifts/open', { openingBalance: parseFloat(openingBalance) }),
    onSuccess: () => {
      toast.success('Shift opened! You\'re ready to go.');
      navigate('/pos');
    },
    onError: () => toast.error('Failed to open shift'),
  });

  const progress = ((step) / STEPS.length) * 100;

  const handleSkip = () => {
    if (step < 3) setStep(step + 1);
    else navigate('/');
  };

  const handleFinish = () => navigate('/pos');

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
            CP
          </div>
          <h1 className="text-2xl font-bold">Welcome to CloudPOS!</h1>
          <p className="text-muted-foreground">Let's get your business set up in a few steps</p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex gap-1">
            {STEPS.map((s, i) => (
              <div key={i} className={`flex-1 flex items-center gap-1 text-xs py-1 ${i === step ? 'text-primary font-medium' : i < step ? 'text-success' : 'text-muted-foreground'}`}>
                {i < step ? <Check className="h-3 w-3" /> : <s.icon className="h-3 w-3" />}
                <span className="hidden sm:inline truncate">{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => { const Icon = STEPS[step].icon; return <Icon className="h-5 w-5" />; })()}
              {STEPS[step].title}
            </CardTitle>
            <CardDescription>{STEPS[step].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 0 && (
              <>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={business.currency} onValueChange={(v) => setBusiness({ ...business, currency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={business.timezone} onValueChange={(v) => setBusiness({ ...business, timezone: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TIMEZONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Business Address</Label>
                  <Input placeholder="123 Main Street, City" value={business.address} onChange={(e) => setBusiness({ ...business, address: e.target.value })} />
                </div>
                <Button className="w-full" onClick={() => saveBusiness.mutate()} disabled={saveBusiness.isPending}>
                  Continue <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </>
            )}

            {step === 1 && (
              <>
                <div className="space-y-2"><Label>Branch Name *</Label><Input placeholder="Main Branch" value={branch.name} onChange={(e) => setBranch({ ...branch, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Phone</Label><Input placeholder="+1234567890" value={branch.phone} onChange={(e) => setBranch({ ...branch, phone: e.target.value })} /></div>
                <div className="space-y-2"><Label>Address</Label><Input placeholder="123 Main Street" value={branch.address} onChange={(e) => setBranch({ ...branch, address: e.target.value })} /></div>
                <div className="space-y-2"><Label>Tax Rate (%)</Label><Input type="number" value={branch.taxRate} onChange={(e) => setBranch({ ...branch, taxRate: e.target.value })} /></div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleSkip}><SkipForward className="h-4 w-4 mr-1" /> Skip</Button>
                  <Button className="flex-1" onClick={() => saveBranch.mutate()} disabled={!branch.name || saveBranch.isPending}>Continue <ChevronRight className="h-4 w-4 ml-1" /></Button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2"><Label>Category Name *</Label><Input placeholder="e.g. Burgers" value={category.name} onChange={(e) => setCategory({ ...category, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Product Name *</Label><Input placeholder="e.g. Classic Burger" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Price *</Label><Input type="number" placeholder="9.99" value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Stock</Label><Input type="number" value={product.stock} onChange={(e) => setProduct({ ...product, stock: e.target.value })} /></div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleSkip}><SkipForward className="h-4 w-4 mr-1" /> Skip</Button>
                  <Button className="flex-1" onClick={() => saveProduct.mutate()} disabled={!category.name || !product.name || !product.price || saveProduct.isPending}>Continue <ChevronRight className="h-4 w-4 ml-1" /></Button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <p className="text-sm text-muted-foreground">Open your first shift to start taking orders. Enter the cash you're starting with.</p>
                <div className="space-y-2"><Label>Opening Balance</Label><Input type="number" value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} placeholder="200.00" /></div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleFinish}><SkipForward className="h-4 w-4 mr-1" /> Skip to Dashboard</Button>
                  <Button className="flex-1" onClick={() => openShiftMut.mutate()} disabled={!openingBalance || openShiftMut.isPending}>Open Shift & Go to POS <ChevronRight className="h-4 w-4 ml-1" /></Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
