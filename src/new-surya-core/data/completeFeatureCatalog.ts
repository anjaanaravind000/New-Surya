export type DashboardId = 'admin' | 'branch' | 'branch-incharge' | 'kitchen' | 'stock-audit';

export type FeatureModule = {
  id: string;
  name: string;
  group: string;
  dashboard: DashboardId;
  description: string;
  recordLabel?: string;
  partyLabel?: string;
  valueLabel?: string;
  integration?: boolean;
  intelligence?: boolean;
  settings?: boolean;
};

const adminGroups: Record<string, string[]> = {
  Overview: ['Executive Dashboard','Live Operations','Business Health','Alerts','Approvals','Activity Timeline','Custom Dashboard Layout','Widget Library','Revenue Trend','Branch Comparison','Category Performance','Hourly Sales','Product Leaderboard','Production Status','Inventory Health','Upcoming Orders','Delivery Map','Staff Attendance Monitor','Customer Loyalty Activity','System Status','AI Recommendations'],
  'Sales & Billing': ['Sales','Bills','Refunds','Returns','Voids','Payment Reconciliation','Cash Management','Daily Closures','Online Orders','Advance Orders','Marketplace Reconciliation','Delivery Management','Customer-facing Display','Cash Denomination Control','Cash Drawer Control','Bill Printing','Original & Duplicate Marking','Offline Billing Sync','Settlement Reconciliation','Payment Method Configuration','Aggregator Payouts','Delivery Settlement','Hold & Recall Monitoring','Split Payment Audit'],
  'Products & Pricing': ['Product Master','Categories','Variants','Add-ons','Modifiers','Price Books','Branch Pricing','Online Pricing','Tax Setup','Combo Builder','Menu Availability','Product Images','Digital Menu','Bulk Product Editing','Bulk Price Update','Bulk Branch Assignment','Bulk Category Change','Bulk Activation','Bulk Image Upload','Product Duplication','Variant Matrix','Price Comparison','Product Profitability','Product Lifecycle','Seasonal Scheduling','3D Product Preview','Cake Customisation Builder','Allergen & Nutrition','Shelf Life & Storage','Barcode & HSN','Upsell & Cross-sell'],
  'Recipes & Production': ['Recipe Management','BOM','Recipe Costing','Yield Management','Production Planning','Production Calendar','Production Approval','Batch Management','Kitchen Capacity','Oven Scheduling','Packing Planning','Dispatch Planning','Recipe Scaling','Recipe Version Control','Unit Conversion','Labour Costing','Energy Costing','Overhead Allocation','Production Intelligence','Festival Demand Planning','Weather Adjustment','Minimum Display Planning','Production Stage Timers','QC Routing','Kitchen Time Estimation','Packaging Requirement Calculation'],
  'Inventory & Procurement': ['Raw Materials','Semi-finished Products','Finished Goods','Packaging Materials','Consumables','Cleaning Supplies','Assets','Returnable Crates','Stock Ledger','Stock Transfer','Stock Adjustment','Purchase Requisition','Purchase Orders','Goods Receipt','Suppliers','Supplier Contracts','Supplier Pricing','Supplier Performance','Expiry Management','Waste','Stock Audit','Reserved Stock','Damaged Stock','Expired Stock','Quarantine Stock','In-transit Stock','Minimum & Maximum Stock','Reorder & Safety Stock','Batch & Lot Tracking','FEFO/FIFO Configuration','Warehouse Map','Stock Ageing','RFQ','Supplier Quotations','Quotation Comparison','Invoice Matching','Supplier Returns','GRN Barcode & Labels','Dispatch Route Control','Proof of Delivery','Donation & Rework'],
  'Customers & Marketing': ['Customer Master','CRM','Loyalty','Wallet','Gift Cards','Promotions','Coupons','Campaigns','Customer Segments','Birthday Campaigns','Anniversary Campaigns','Referrals','Feedback','Reviews','WhatsApp Marketing','Wholesale Orders','Corporate Orders','Customer Lifetime Value','Retention Analysis','Membership Tiers','Paid Membership','Cashback','Prepaid Balance','Promotional Balance','Digital Vouchers','Visit Rewards','Spend Rewards','Referral Rewards','Promotion Simulator','Promotion Conflict Checker','Campaign Budget','Campaign Analytics','Customer Allergies & Preferences','Credit Limits & Terms','Recurring & Standing Orders','Multi-address Delivery'],
  'Staff & Operations': ['Users','Roles','Permissions','Attendance','Shifts','Payroll-ready Records','Performance','Training','Tasks','Checklists','Incident Management'],
  'Finance & Compliance': ['Income','Expenses','Petty Cash','Cash Book','Bank Book','Accounts Receivable','Accounts Payable','Credit Ledger','Credit Ageing','P&L','Branch P&L','GST','Tax Reports','Invoice Compliance','FSSAI','Food Safety','Recall Management','Batch Traceability','Audit Logs','Settlement Reconciliation','Accounting Export','Temperature Logs','Cleaning Logs','Pest-control Logs','Equipment Maintenance','Staff Hygiene','Incident Reports','Corrective Actions','Licence Expiry Alerts','Supplier Certificates','Ingredient Traceability','Product Traceability','Recall Customer Search','Returned & Destroyed Stock'],
  'Reports & Intelligence': ['Sales Reports','Product Reports','Branch Reports','Production Reports','Inventory Reports','Waste Reports','Supplier Reports','Customer Reports','Staff Reports','Financial Reports','Custom Report Builder','BI Dashboard','Forecasting','AI Insights','Saved Reports','Scheduled Reports','Favourite Reports','CSV Export','Excel Export','PDF Export','Print Centre','Drill-down Reports','Shareable Views','Cohort Analysis','Heatmaps','Waterfall Analysis','Funnel Analysis','Confidence & Impact Review'],
  System: ['Branches','Devices','Printers','Integrations','Notifications','Approval Centre','Backup','Import & Export','API Configuration','Branding','Application Settings','Appearance','Accessibility','Security','Data Management','Debug Centre','Audit Trail','Global Search','Command Palette','Sync Status','Online/Offline Status','Notification Preferences','Integration Logs','Test Connection','Thermal Printer','KOT Printer','Label Printer','Barcode Scanner','Weighing Scale','Cash Drawer','Customer Display Device','Biometric Attendance','Maps Adapter','Payment Adapter','Marketplace Adapter','Messaging Adapter','Label Template Designer','Reprint Tracking'],
};

const branchGroups: Record<string, string[]> = {
  'Counter & Billing': ['Fast Billing','New Bill','Held Bills','Recall Bill','Merge Bills','Split Bill','Duplicate Bill','Quote','Pro Forma Invoice','Refund','Exchange','Void','Reprint','Product Grid','Category Wrap','Favourites','Recently Sold','Popular Products','Barcode Search','Voice-ready Search','Independent Cart','Direct Quantity Entry','Weight Entry','Item Notes','Modifiers','Drag Reorder','Stock Warning','Grams & Kilograms','Original & Discounted Price'],
  'Customers & Value': ['Customer Search','Customer Profile','Customer Credit','Wallet Payment','Gift Card Payment','Coupons','Loyalty Points','Promotion Progress','Recommended Add-ons','Threshold Discount Prompt','Customer Purchase History','Wallet Balance','Loyalty Balance','Eligible Product Suggestions','Upsell & Cross-sell'],
  'Orders & Channels': ['Advance Orders','Cake Customisation','Party Orders','Online Orders','Phone Orders','QR Orders','Marketplace Orders','Delivery Orders','Route Planning','Proof of Delivery'],
  Payments: ['Cash','UPI','Card','Paytm','Bank Transfer','Credit','Online Payment','QR Payment','Split Payment','Partial Payment','Payment Reconciliation','Amount Tendered','Change Due','Quick Cash Buttons','Denomination Calculator','Cash Drawer Prompt','Cash Variance Warning'],
  'Branch Stock': ['Live Stock','Incoming Stock','Goods Receipt','Batch & Expiry','Returns','Damage','Waste','Stock Transfer','Stock Request'],
  'Counter Control': ['Counter Opening','Cash Drawer','Denomination Calculator','Cash Variance','Daily Closure','Bill History','Payment Correction','Devices','Offline Queue','Customer Display','Duplicate Sync Prevention','Print History','Original/Reprint Mark','Shift Control','Customer Thank-you Display'],
  'Wholesale & Credit': ['Shop Master','Customer Price Lists','Wholesale Orders','Recurring Orders','Credit Ledger','Collections','Payment Reminders','Account Statements','Delivery Challans'],
};

const inchargeGroups: Record<string, string[]> = {
  Overview: ['Branch Overview','Counter Status','Live Billing','Sales Target','Business Health','Opening Checklist','Closure Checklist'],
  People: ['Staff Attendance','Shifts','Staff Tasks','Performance','Training','Incidents','Cleaning Checklist'],
  Stock: ['Stock Health','Incoming Stock','Goods Receipt','Transfer Requests','Expiry','Waste','Returns','Local Purchase'],
  Customers: ['Online Orders','Advance Cake Orders','Customer Complaints','Credit Collection','Customer Feedback'],
  Finance: ['Cash Closure','UPI Reconciliation','Card Reconciliation','Branch Expenses','Petty Cash','Bank Deposits','Supplier Payments'],
  Control: ['Approvals','Discount Overrides','Refund Approvals','Stock Adjustments','Price Changes','Branch Reports','Daily Closure','Audit Trail','Equipment Issues','Counter Device Status','Opening Confirmation','Closure Confirmation','Before & After Approval Review','Notification Assignment','Snooze & Resolve'],
  Procurement: ['Suppliers','Purchase Requisitions','Purchase Orders','Purchase Invoices','Purchase Returns','Quotation Comparison','Supplier Performance'],
};

const kitchenGroups: Record<string, string[]> = {
  'Kitchen Home': ['Production Overview','Today Target','Urgent Orders','Delayed Batches','Staff on Shift','Dispatch Deadline'],
  Production: ['Production Queue','Bake Planner','Recipe Viewer','Ingredient Picking','Mixing','Oven Board','Cooling','Cake Decoration','Batch Management','Yield Management','Requested Stage','Awaiting Approval Stage','Approved Stage','Ingredients Allocated Stage','Baking Stage','Quality Check Stage','Ready for Dispatch Stage','On Hold & Rejected Stage','Stage Timers','Delay Warnings','Team Assignment','Produced & Rejected Quantity'],
  Quality: ['Quality Control','Rework','Rejected Batches','Waste','Temperature Log','Allergen Checks','Photo Evidence','Corrective Actions','Weight Check','Size & Shape Check','Colour & Texture Check','Taste Check','Decoration Check','Packaging & Label Check','Expiry & Batch Check','Customer Customisation Check','Passed with Note','Inspector Sign-off','QC Trend Analytics'],
  Materials: ['Raw Materials','Inventory','Suppliers','Purchase Orders','Goods Receipt','Invoices','Expiry Management','FEFO/FIFO','Recipe Requirements'],
  Packing: ['Finished Stock','Packaging','Packing Queue','Labels','Transfer In','Transfer Out','Dispatch','Crates','Leftovers','Packing Billing','Picking List','Batch Allocation','Dispatch Note','Vehicle & Driver','Route & ETA','Proof of Delivery','Shortage & Damage','Return Crates','Bulk Label Print','Online Order Labels','Cake Order Labels'],
  Equipment: ['Oven Management','Kitchen Capacity','Maintenance','Breakdowns','Cleaning Schedule','Energy Usage'],
  Management: ['Production Reports','Waste Reports','QC Trends','Staff Tasks','Daily Closure','Recipe Management','Costing & Margin','Production Forecasting','Demand Recommendations'],
};

const auditGroups: Record<string, string[]> = {
  'Audit Planning': ['Planned Audits','Surprise Audits','Cycle Counts','Full Counts','Blind Count','Recount','Audit Calendar','Auditor Assignment','Branch Scope','Category Scope','Count Freeze'],
  Counting: ['Ingredient Counts','Finished Goods Counts','Packaging Counts','Batch Counts','Barcode Scanning','Evidence Upload'],
  'Variance & Approval': ['Variance Review','Variance Heatmap','High-risk Items','Frequent Variance','Financial Impact','Suspicious Patterns','Ledger Posting','Evidence Review','Recount Approval','Before & After Comparison','Authorized Posting','Variance Reason Analysis'],
  'Ordering & Receiving': ['Place Order','Live Order Status','Placed Orders','Packing Alerts','Purchase Order','Purchase Invoice','Purchase Return','Incoming Verification','Branch Request','Admin Approval','Picking Confirmation','Dispatch Confirmation','Vehicle & Route','Branch Receipt','Shortage & Damage Evidence','Return Crate Confirmation'],
  'Stock Control': ['Stock Movements','Daily Stock Take','Advance Orders','Shortage','Damage','Rejection','Return Crates','Order Closure'],
  Analytics: ['Auditor Performance','Location Comparison','Stock Ageing','Expiry Timeline','Fast/Slow Moving','Audit History','Audit Reports'],
};

const dashboardGroups: Record<DashboardId, Record<string, string[]>> = {
  admin: adminGroups,
  branch: branchGroups,
  'branch-incharge': inchargeGroups,
  kitchen: kitchenGroups,
  'stock-audit': auditGroups,
};

function slug(value: string) {
  return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function descriptionFor(name: string, group: string) {
  return `${name} workspace for controlled ${group.toLowerCase()} activity, approvals, status tracking, evidence, reporting and audit history.`;
}

export const completeFeatureCatalog: FeatureModule[] = (Object.entries(dashboardGroups) as Array<[DashboardId, Record<string, string[]>]>).flatMap(([dashboard, groups]) =>
  Object.entries(groups).flatMap(([group, names]) => names.map(name => ({
    id: `${dashboard}-${slug(name)}`,
    name,
    group,
    dashboard,
    description: descriptionFor(name, group),
    integration: name === 'Integrations' || ['Devices','Printers','API Configuration'].includes(name),
    intelligence: ['AI Insights','Forecasting','BI Dashboard','Business Health','Suspicious Patterns'].includes(name),
    settings: ['Application Settings','Branding','Permissions','Roles','Tax Setup'].includes(name),
  })))
);

export function modulesForDashboard(dashboard: DashboardId) {
  return completeFeatureCatalog.filter(module => module.dashboard === dashboard);
}

export function groupsForDashboard(dashboard: DashboardId) {
  return dashboardGroups[dashboard];
}
