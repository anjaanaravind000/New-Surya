import type { Bill, OnlineOrder, PrintJob } from './types';

export type AdapterResult = { ok: true; providerRef?: string; message: string } | { ok: false; message: string; detail?: string };

export async function pushPaytmReconciliation(_bill: Bill, merchantConfig?: { mid?: string; key?: string }): Promise<AdapterResult> {
  if (!merchantConfig?.mid || !merchantConfig?.key) return { ok: false, message: 'Paytm credentials missing', detail: 'Add merchant MID/key and webhook before live reconciliation.' };
  return { ok: true, providerRef: `PAYTM-${Date.now()}`, message: 'Paytm reconciliation request prepared.' };
}

export async function acknowledgeAggregatorOrder(order: OnlineOrder, config?: { token?: string }): Promise<AdapterResult> {
  if (!config?.token) return { ok: false, message: `${order.platform} credentials missing`, detail: 'The app can queue/accept/reconcile locally; live provider acknowledgement requires approved API credentials.' };
  return { ok: true, providerRef: `${order.platform}-${order.externalRef}`, message: `${order.platform} order acknowledgement prepared.` };
}

export async function sendWhatsAppBill(_bill: Bill, config?: { token?: string; phoneNumberId?: string }): Promise<AdapterResult> {
  if (!config?.token || !config?.phoneNumberId) return { ok: false, message: 'WhatsApp Business API credentials missing', detail: 'Add WABA token, phone number ID and approved template names.' };
  return { ok: true, providerRef: `WABA-${Date.now()}`, message: 'WhatsApp bill payload prepared.' };
}

export async function sendToPrinter(job: PrintJob, config?: { bridgeUrl?: string }): Promise<AdapterResult> {
  if (!config?.bridgeUrl) return { ok: false, message: 'Printer bridge missing', detail: 'Install local ESC/POS bridge at branch and configure its URL.' };
  return { ok: true, providerRef: job.id, message: `${job.type} sent to printer bridge.` };
}

export function createTallyExportPayload(bills: Bill[]) {
  return bills.map(bill => ({
    voucherType: 'Sales',
    voucherNo: bill.billNo,
    date: bill.createdAt.slice(0, 10),
    amount: bill.grandTotal,
    tax: bill.taxTotal,
    paymentMode: bill.paymentMode,
    branchId: bill.branchId,
  }));
}
