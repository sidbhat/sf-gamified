/**
 * Script to convert hardcoded prompts in quests.json to i18n promptKey references
 * This ensures all Joule prompts can be translated to German and other languages
 */

const fs = require('fs');
const path = require('path');

// Mapping of English prompts to their i18n keys
const promptMapping = {
  "View my leave balance": "prompts.viewLeaveBalance",
  "Show me my goals": "prompts.showMyGoals",
  "Show me my cost center": "prompts.showMyCostCenter",
  "What is the company policy on rental cars?": "prompts.rentalCarPolicy",
  "Request time off for tomorrow": "prompts.requestTimeOff",
  "View my assigned learning": "prompts.viewAssignedLearning",
  "View my email": "prompts.viewEmail",
  "View my job": "prompts.viewJob",
  "View my birthday": "prompts.viewBirthday",
  "Show my pending approvals": "prompts.showPendingApprovals",
  "Show my direct reports": "prompts.showDirectReports",
  "Give Spot Award": "prompts.giveSpotAward",
  "Jada Baker": "prompts.employeeName",
  "1": "prompts.awardAmount",
  "Thanks for your help with the client presentation!": "prompts.awardMessage",
  "Give feedback": "prompts.giveFeedback",
  "View team's hire dates": "prompts.viewTeamHireDates",
  "Show me compensation insight": "prompts.showCompensationInsight",
  "Show me some workforce metrics": "prompts.showWorkforceMetrics",
  "Request feedback": "prompts.requestFeedback",
  "View worker profile": "prompts.viewWorkerProfile",
  "Show me open sales orders": "prompts.showOpenSalesOrders",
  "Show me sales orders that are not yet delivered?": "prompts.showNotDeliveredOrders",
  "Find sales order items with ship-to party USCU-CUS23": "prompts.findShipToParty",
  "Show me all sales orders from Intelli corp": "prompts.showIntelliCorpOrders",
  "show me status of sales order 470909": "prompts.showOrderStatus",
  "Show me all billing documents for customer USCU-CUS23": "prompts.showCustomerBilling",
  "Show me billing documents for sales organization 1010": "prompts.showSalesOrgBilling",
  "Find billing documents with payment terms 0001": "prompts.findPaymentTermsBilling",
  "Show me all billing documents with net amount higher than 10.000 USD": "prompts.showHighValueBilling",
  "Show me all billing documents for customer USCU-P-005": "prompts.showBillingRequests",
  "Show me all billing documents request for reference document 1000000022": "prompts.showRefDocumentBilling",
  "Show me billing documents for product PC_SUPP_1": "prompts.showProductBilling",
  "Show me billing documents for sales organization 1710": "prompts.showOrg1710Billing",
  "Show me all billing documents with issues": "prompts.showBillingIssues",
  "Purchase order items for material TG0011": "prompts.poMaterial",
  "Find PO items for plant 1710": "prompts.poPlant",
  "What is the item category for po item 4500000012/00030": "prompts.poItemCategory",
  "Show me pos by Supplier ID 17300001": "prompts.poSupplier",
  "Show pos for purch group 001": "prompts.poPurchGroup",
  "Show me purchase requisition items with value 100 EUR": "prompts.prValueFilter",
  "Find req itms for purch group 001": "prompts.prPurchGroup",
  "Show me the follow-on document status of PR 10438000": "prompts.prFollowOnStatus",
  "Show outbound deliveries due for shipping": "prompts.deliveryDueShipping",
  "Show me delivery 80000048": "prompts.deliveryLookup",
  "Find delivery document 80000048": "prompts.deliveryDocument",
  "Show overall picking status for delivery document 80000048": "prompts.deliveryPickingStatus",
  "Are there deliveries ready for picking?": "prompts.deliveryReadyPicking",
  "What's the planned goods issue date for delivery 80000048": "prompts.deliveryGoodsIssueDate"
};

// Read quests.json
const questsPath = path.join(__dirname, '..', 'src', 'config', 'quests.json');
const questsData = JSON.parse(fs.readFileSync(questsPath, 'utf8'));

// Convert all prompts to promptKeys
let conversionsCount = 0;
questsData.quests.forEach(quest => {
  quest.steps.forEach(step => {
    if (step.prompt && promptMapping[step.prompt]) {
      console.log(`Converting: "${step.prompt}" → "${promptMapping[step.prompt]}"`);
      step.promptKey = promptMapping[step.prompt];
      delete step.prompt;
      conversionsCount++;
    }
  });
});

// Write updated quests.json
fs.writeFileSync(questsPath, JSON.stringify(questsData, null, 2), 'utf8');

console.log(`\n✅ Conversion complete!`);
console.log(`📊 Total conversions: ${conversionsCount}`);
console.log(`📁 Updated file: ${questsPath}`);
