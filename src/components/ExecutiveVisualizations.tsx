import { BarChart3, Boxes, CircleDollarSign, Factory, ShoppingBag, TrendingUp } from 'lucide-react';
import { Card, Metric, Pill } from './UI';
import { money } from '../lib/calculations';
import { useBakeryStore } from '../state/BakeryStore';

const chartColors = ['bg-emerald-500', 'bg-sky-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500'];

function HorizontalBars({ rows }: { rows: { label: string; value: number; display?: string }[] }) {
  const max = Math.max(1, ...rows.map(row => row.value));
  return <div className="space-y-4">{rows.map((row, index) => <div key={row.label}>
    <div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="font-semibold text-slate-600">{row.label}</span><b className="text-slate-950">{row.display ?? row.value.toLocaleString()}</b></div>
    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${chartColors[index % chartColors.length]}`} style={{ width: `${Math.max(4, (row.value / max) * 100)}%` }} /></div>
  </div>)}</div>;
}

export default function ExecutiveVisualizations() {
  const { state, metrics } = useBakeryStore();
  const branchRows = state.branches.filter(branch => branch.type !== 'central-kitchen').map(branch => {
    const sales = state.bills.filter(bill => bill.branchId === branch.id).reduce((sum, bill) => sum + bill.grandTotal, 0);
    const stock = state.finishedStocks.filter(item => item.branchId === branch.id).reduce((sum, item) => sum + item.qty * item.costPerUnit, 0);
    return { label: branch.name, value: sales || stock, display: sales ? money(sales) : `${money(stock)} stock` };
  });
  const channels = ['walk-in', 'swiggy', 'zomato', 'website', 'qr', 'phone', 'wholesale'].map(channel => ({
    label: channel.replace('-', ' '),
    value: state.bills.filter(bill => bill.orderChannel === channel).length + state.onlineOrders.filter(order => order.platform.toLowerCase() === channel).length
  }));
  const production = ['pending-admin-approval', 'prep', 'mixing', 'baking', 'qc', 'packing', 'completed'].map(status => ({
    label: status.replaceAll('-', ' '),
    value: state.productionPlans.filter(plan => plan.status === status).length
  }));
  const inventoryHealth = Math.max(0, Math.round(((state.ingredients.length - metrics.lowIngredients.length) / Math.max(1, state.ingredients.length)) * 100));
  const orderHealth = Math.max(0, 100 - state.onlineOrders.filter(order => order.status === 'new').length * 8);

  return <div className="space-y-5">
    <section className="border border-slate-800 bg-[#151a1f] p-5 text-white shadow-lg">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><div className="flex items-center gap-2 text-xs font-bold text-[#e6bc72]"><BarChart3 className="size-4" />OWNER AND ADMIN INTELLIGENCE</div><h2 className="mt-2 text-2xl font-extrabold">Business visualization studio</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Live visual summaries across branches, billing channels, production, inventory, customers and fulfilment.</p></div>
        <div className="flex gap-2"><Pill tone="green">Live calculations</Pill><Pill tone="blue">All branches</Pill></div>
      </div>
    </section>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Metric icon={CircleDollarSign} label="Sales today" value={money(metrics.salesToday)} helper="All paid and credit bills." tone="green" />
      <Metric icon={ShoppingBag} label="Orders tracked" value={String(state.bills.length + state.onlineOrders.length + state.advanceOrders.length)} helper="POS, online and advance." tone="blue" />
      <Metric icon={Factory} label="Production batches" value={String(state.productionPlans.length)} helper="All active and completed batches." tone="orange" />
      <Metric icon={Boxes} label="Inventory health" value={`${inventoryHealth}%`} helper={`${metrics.lowIngredients.length} materials need attention.`} tone={inventoryHealth > 80 ? 'green' : 'amber'} />
    </div>

    <div className="grid gap-5 xl:grid-cols-2">
      <Card title="Branch value comparison" description="Sales value is shown where available; otherwise current stock value is used."><HorizontalBars rows={branchRows} /></Card>
      <Card title="Sales and order channels" description="Compare walk-in and digital demand without reading a report table."><HorizontalBars rows={channels} /></Card>
      <Card title="Production pipeline" description="Batch volume from approval through packing and completion."><HorizontalBars rows={production} /></Card>
      <Card title="Operational health" description="Fast visual checks for inventory, order response and counter readiness.">
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            { label: 'Inventory', value: inventoryHealth, color: '#10b981' },
            { label: 'Order response', value: orderHealth, color: '#0ea5e9' },
            { label: 'Counters open', value: Math.round((state.counterSessions.filter(item => item.status === 'open').length / Math.max(1, state.branches.filter(item => item.type !== 'central-kitchen').length)) * 100), color: '#d3993f' }
          ].map(item => <div key={item.label} className="text-center">
            <div className="mx-auto grid size-28 place-items-center rounded-full" style={{ background: `conic-gradient(${item.color} ${item.value}%, #e2e8f0 0)` }}><div className="grid size-20 place-items-center rounded-full bg-white"><b className="text-xl text-slate-950">{item.value}%</b></div></div>
            <p className="mt-3 text-xs font-bold text-slate-600">{item.label}</p>
          </div>)}
        </div>
      </Card>
    </div>

    <Card title="Management signals" description="Priorities are calculated from live operational state.">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Low raw materials', value: metrics.lowIngredients.length, tone: metrics.lowIngredients.length ? 'amber' : 'green' },
          { label: 'Production approvals', value: metrics.pendingProduction.length, tone: metrics.pendingProduction.length ? 'amber' : 'green' },
          { label: 'New online orders', value: state.onlineOrders.filter(order => order.status === 'new').length, tone: 'blue' },
          { label: 'Advance deliveries', value: state.advanceOrders.filter(order => !['delivered', 'cancelled'].includes(order.status)).length, tone: 'purple' }
        ].map(signal => <div key={signal.label} className="border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-600">{signal.label}</span><TrendingUp className="size-4 text-slate-400" /></div><b className="mt-2 block text-2xl text-slate-950">{signal.value}</b><div className="mt-3"><Pill tone={signal.tone as 'amber' | 'green' | 'blue' | 'purple'}>{signal.value ? 'Review now' : 'Healthy'}</Pill></div></div>)}
      </div>
    </Card>
  </div>;
}
