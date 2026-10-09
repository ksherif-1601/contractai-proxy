// ContractAI core: templates, AI instructions, generation and quality checks.
// Shared by index.html (the app) and test.html (the template test runner).
// Legal citations follow /contractai/jurisdiction-rubric.md (UAE pack, verified 2026-10-07).

var PROXY_URL = 'https://contractai-proxy.vercel.app/api/proxy';
var MODEL = 'claude-sonnet-4-6';
var MAX_TOKENS = 8000;

var COUNTRIES = [
  { name: 'United Arab Emirates', live: true },
  { name: 'Saudi Arabia', live: false },
  { name: 'Qatar', live: false },
  { name: 'Kuwait', live: false },
  { name: 'Bahrain', live: false },
  { name: 'Oman', live: false }
];
var EMIRATES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];

var COUNTRY_FIELDS = [
  { id: 'country', label: 'Which country is this contract for?', type: 'country' },
  { id: 'emirate', label: 'Emirate', type: 'select', options: EMIRATES }
];

var DOC_TYPES = [
  { id:'nda', icon:'🤝', name:'Non-Disclosure Agreement', desc:'Protect confidential information', partyFields:['disclosing_party','receiving_party'], fields:[
    {id:'disclosing_party',label:'Disclosing party name',type:'text',placeholder:'Your name or company name'},
    {id:'receiving_party',label:'Receiving party name',type:'text',placeholder:'Other party name or company'},
    {id:'purpose',label:'Purpose of disclosure',type:'text',placeholder:'e.g. Exploring a potential business partnership'},
    {id:'duration',label:'Confidentiality period',type:'select',options:['1 year','2 years','3 years','5 years','Indefinite']},
    {id:'mutual',label:'Is this mutual?',type:'select',options:['Yes — mutual NDA','No — one-way NDA']},
    {id:'effective_date',label:'Effective date',type:'text',optional:true},
    {id:'party1_address',label:'Disclosing party address',type:'text',placeholder:'Full business address',optional:true},
    {id:'party1_email',label:'Disclosing party email',type:'text',placeholder:'contact@company.com',optional:true},
    {id:'party1_signatory',label:'Disclosing party signatory name & title',type:'text',placeholder:'e.g. Ahmed Al Rashid, Managing Director',optional:true},
    {id:'party2_address',label:'Receiving party address',type:'text',placeholder:'Full business address',optional:true},
    {id:'party2_email',label:'Receiving party email',type:'text',placeholder:'contact@company.com',optional:true},
    {id:'party2_signatory',label:'Receiving party signatory name & title',type:'text',placeholder:'e.g. Sarah Johnson, Founder',optional:true}
  ]},
  { id:'freelance', icon:'📋', name:'Freelance Service Agreement', desc:'Client contracts for freelancers', partyFields:['freelancer_name','client_name'], fields:[
    {id:'freelancer_name',label:'Your name or business name',type:'text',placeholder:'Your name or studio name'},
    {id:'client_name',label:'Client name or company',type:'text',placeholder:'Client\'s full name or company'},
    {id:'services',label:'Services to be provided',type:'textarea',placeholder:'Describe the work you will do'},
    {id:'total_fee',label:'Total project fee',type:'text',placeholder:'e.g. AED 15,000'},
    {id:'payment_terms',label:'Payment terms',type:'select',options:['50% upfront, 50% on delivery','100% upfront','Monthly retainer','Net 30 on invoice','Milestone-based']},
    {id:'timeline',label:'Project timeline',type:'text',placeholder:'e.g. 4 weeks from project kickoff'},
    {id:'revisions',label:'Revision rounds included',type:'select',options:['1 round','2 rounds','3 rounds','Unlimited (within scope)','None']},
    {id:'effective_date',label:'Effective date',type:'text',optional:true},
    {id:'freelancer_address',label:'Your address',type:'text',placeholder:'Your business address',optional:true},
    {id:'freelancer_email',label:'Your email',type:'text',placeholder:'you@example.com',optional:true},
    {id:'client_address',label:'Client address',type:'text',placeholder:'Client business address',optional:true},
    {id:'client_email',label:'Client email',type:'text',placeholder:'client@example.com',optional:true},
    {id:'client_signatory',label:'Client signatory name & title',type:'text',placeholder:'e.g. John Smith, CEO',optional:true}
  ]},
  { id:'contractor', icon:'👤', name:'Independent Contractor Agreement', desc:'Contractor vs employee clarity', partyFields:['company_name','contractor_name'], fields:[
    {id:'company_name',label:'Company or client name',type:'text',placeholder:'Company hiring the contractor'},
    {id:'contractor_name',label:'Contractor name',type:'text',placeholder:'Individual or business name'},
    {id:'services',label:'Scope of work',type:'textarea',placeholder:'Describe the services the contractor will provide'},
    {id:'rate',label:'Compensation rate',type:'text',placeholder:'e.g. AED 250/hour or AED 18,000/month'},
    {id:'start_date',label:'Start date',type:'text'},
    {id:'duration',label:'Contract duration',type:'select',options:['3 months','6 months','12 months','Ongoing','Project-based']},
    {id:'ip',label:'Who owns the work product?',type:'select',options:['Client owns all IP','Contractor retains IP','Shared ownership']},
    {id:'company_address',label:'Company address',type:'text',placeholder:'Company business address',optional:true},
    {id:'company_email',label:'Company email',type:'text',placeholder:'company@example.com',optional:true},
    {id:'company_signatory',label:'Company signatory name & title',type:'text',placeholder:'e.g. John Smith, CEO',optional:true},
    {id:'contractor_address',label:'Contractor address',type:'text',placeholder:'Contractor address',optional:true},
    {id:'contractor_email',label:'Contractor email',type:'text',placeholder:'contractor@example.com',optional:true}
  ]},
  { id:'tos', icon:'🌐', name:'Terms of Service', desc:'Website, app or SaaS ToS', partyFields:['company_name'], fields:[
    {id:'company_name',label:'Company or product name',type:'text',placeholder:'Your company or product name'},
    {id:'website_url',label:'Website or app URL',type:'text',placeholder:'https://yoursite.com'},
    {id:'service_description',label:'What does your service do?',type:'textarea',placeholder:'Briefly describe your product or service'},
    {id:'user_age',label:'Minimum user age',type:'select',options:['18 years old','16 years old','13 years old','No minimum']},
    {id:'payments',label:'Does your service involve payments?',type:'select',options:['Yes — subscription','Yes — one-time purchases','No — free service','Freemium']},
    {id:'contact_email',label:'Contact email for legal notices',type:'text',placeholder:'legal@yourcompany.com'},
    {id:'effective_date',label:'Effective date',type:'text',optional:true},
    {id:'company_address',label:'Company registered address',type:'text',placeholder:'Full registered address',optional:true}
  ]},
  { id:'consulting', icon:'💼', name:'Consulting Agreement', desc:'Retainer and advisory contracts', partyFields:['consultant_name','client_name'], fields:[
    {id:'consultant_name',label:'Consultant or advisor name',type:'text',placeholder:'Your name or company'},
    {id:'client_name',label:'Client name or company',type:'text',placeholder:'Client\'s full name or company'},
    {id:'services',label:'Consulting services',type:'textarea',placeholder:'Describe the advisory services you will provide'},
    {id:'fee',label:'Consulting fee',type:'text',placeholder:'e.g. AED 15,000/month retainer or AED 1,200/hour'},
    {id:'term',label:'Engagement length',type:'select',options:['3 months','6 months','12 months','Ongoing — 30 days notice to terminate']},
    {id:'exclusivity',label:'Exclusivity',type:'select',options:['Non-exclusive','Exclusive in this industry','Fully exclusive']},
    {id:'effective_date',label:'Effective date',type:'text',optional:true},
    {id:'consultant_address',label:'Your address',type:'text',placeholder:'Your business address',optional:true},
    {id:'consultant_email',label:'Your email',type:'text',placeholder:'you@example.com',optional:true},
    {id:'client_address',label:'Client address',type:'text',placeholder:'Client business address',optional:true},
    {id:'client_email',label:'Client email',type:'text',placeholder:'client@example.com',optional:true},
    {id:'client_signatory',label:'Client signatory name & title',type:'text',placeholder:'e.g. John Smith, CEO',optional:true}
  ]},
  { id:'partnership', icon:'🤜', name:'Partnership Agreement', desc:'Business partnership terms', partyFields:['partner1','partner2'], fields:[
    {id:'partner1',label:'Partner 1 full name',type:'text',placeholder:'First partner\'s name'},
    {id:'partner2',label:'Partner 2 full name',type:'text',placeholder:'Second partner\'s name'},
    {id:'business_name',label:'Business or venture name',type:'text',placeholder:'The name of the partnership or venture'},
    {id:'contributions',label:'What each partner contributes',type:'textarea',placeholder:'e.g. Partner 1: AED 60,000 cash. Partner 2: AED 40,000 cash plus full-time operations work'},
    {id:'split',label:'Profit or ownership split',type:'text',placeholder:'e.g. 60/40 or 50/50'},
    {id:'roles',label:'Describe each partner\'s role',type:'textarea',placeholder:'e.g. Partner 1 handles operations; Partner 2 handles sales'},
    {id:'dissolution',label:'What happens if one partner exits?',type:'select',options:['Buy-out at agreed valuation','Equal split of assets','30-day notice then wind down','To be negotiated at time of exit']},
    {id:'effective_date',label:'Effective date',type:'text',optional:true},
    {id:'partner1_address',label:'Partner 1 address',type:'text',placeholder:'Address',optional:true},
    {id:'partner1_email',label:'Partner 1 email',type:'text',placeholder:'partner1@example.com',optional:true},
    {id:'partner2_address',label:'Partner 2 address',type:'text',placeholder:'Address',optional:true},
    {id:'partner2_email',label:'Partner 2 email',type:'text',placeholder:'partner2@example.com',optional:true}
  ]}
];

// ---------- AI instructions ----------

function baseInstructions(emirate) {
  return 'You are ContractAI, a senior UAE legal drafter producing documents that match the quality of mid-tier law firm work. ' +
    'Output ONLY the document (no preamble, no markdown, no commentary). Use ALL CAPS section headers. ' +
    'Use the ACTUAL party names, addresses, emails, dates and signatory details provided, and respect every value the user entered (durations, fees, dates). ' +
    'Never use placeholders such as [Party A], [DATE] or XXX; if a value was not given, leave a blank line (________).\n\n' +
    'DRAFTING STANDARDS:\n' +
    '- Use "shall" for obligations. Define every capitalised term before using it.\n' +
    '- Clauses of 2 to 4 sentences, precise and without filler. Aim for 3,000 to 4,500 words so every section fits. Never truncate.\n' +
    '- Draft ONLY the document type requested. Do not import clauses from other contract types (no NDA-style Disclosing/Receiving Party roles, confidentiality-only structure or fixed liquidated-damages amounts unless the section list below asks for them).\n\n' +
    'UAE LAW (cite only these; never cite any other law number):\n' +
    '- Governing law: the laws of the United Arab Emirates as applied in the Emirate of ' + emirate + ', including the Civil Transactions Law, Federal Decree-Law No. 25 of 2025 (in force from 1 June 2026). Never cite Federal Law No. 5 of 1985, which was repealed.\n' +
    '- Agreed compensation (liquidated damages), where used, must be stated as a genuine pre-estimate of loss and must acknowledge that a court may adjust it under the Civil Transactions Law.\n' +
    '- Electronic signatures and counterparts: Federal Decree-Law No. 46 of 2021 on Electronic Transactions and Trust Services.\n' +
    '- Personal data: Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data.\n' +
    '- Trade secrets: Federal Law No. 11 of 2021 on Industrial Property Rights (undisclosed information). Never cite Federal Law No. 36 of 2021 for trade secrets; that is the Trademarks law.\n' +
    '- Labour: Federal Decree-Law No. 33 of 2021 on Labour Relations, as amended.\n' +
    '- Companies: Federal Decree-Law No. 32 of 2021 on Commercial Companies, as amended by Federal Decree-Law No. 20 of 2025.\n' +
    '- Disputes: good-faith negotiation for 15 days, then arbitration under the DIAC Arbitration Rules, seated in Dubai, in English, one arbitrator, under Federal Law No. 6 of 2018 as amended by Federal Decree-Law No. 15 of 2023 (hearings may be held remotely). Either party may seek urgent interim relief from a competent court. ' +
    'Where the parties prefer courts, they may instead opt in to the DIFC Courts by written agreement under Article 5(A)(2) of Dubai Law No. 12 of 2004 as amended by Dubai Law No. 16 of 2011; mention this as an alternative only in one sentence.\n' +
    '- Include a language clause: the English text governs; if an Arabic translation is required by a court or authority, it is for convenience and the parties shall cooperate on it.\n';
}

var ENDING_SIGNED =
  '\nSIGNATURE AND DISCLAIMER (always last, never truncated):\n' +
  'IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.\n' +
  'Then, for each party: party name on its own line, then "By: ________________________ (signature)", Name, Title, Date, Address, Email, each pre-filled from the details provided, or a blank line where not given.\n' +
  'Then "--- END OF AGREEMENT ---" and then exactly: "DISCLAIMER: This document is AI-generated for informational purposes only and does not constitute legal advice. Each party should consult a qualified UAE lawyer before signing."';

var ENDING_TOS =
  '\nENDING (always last, never truncated): a CONTACT US section with the legal notice email and address provided, then exactly: "DISCLAIMER: This document is AI-generated for informational purposes only and does not constitute legal advice. Have a qualified UAE lawyer review these Terms before publishing them."';

var SECTIONS = {
  nda:
    'MANDATORY SECTIONS, in order:\n' +
    '1) TITLE AND PARTIES: full legal names, addresses, effective date. Mutual or one-way exactly as the user chose.\n' +
    '2) RECITALS: 3 to 4 WHEREAS clauses.\n' +
    '3) DEFINITIONS: Confidential Information, Disclosing Party, Receiving Party, Representatives, Purpose, Trade Secret, Affiliate, Material Breach (an unauthorised disclosure or misuse, or a breach not cured within the cure period), Business Day (Monday to Friday excluding UAE public holidays).\n' +
    '4) CORE OBLIGATIONS: standard of care defined precisely; use only for the Purpose; disclosure only to Representatives bound by equivalent duties; security standards (encryption at rest and in transit, AES-256 or equivalent, role-based access controls, staff confidentiality training); incident notice within 48 hours; return or destruction within 10 Business Days with written certification; reasonable audit right on notice; sub-contractor flow-down; no reverse engineering; legally compelled disclosure procedure.\n' +
    '5) INTELLECTUAL PROPERTY: no licence, each party keeps its IP, jointly developed IP needs a separate written agreement.\n' +
    '6) NON-SOLICITATION: during the Term and 12 months after, no soliciting the other\'s employees, contractors or clients introduced through the Purpose.\n' +
    '7) EXCLUSIONS: the 5 standard exclusions; burden of proof on the Receiving Party; aggregated anonymised data exception; residual knowledge limited to unaided memory and never applying to Trade Secrets.\n' +
    '8) TERM AND TERMINATION: the EXACT confidentiality period chosen; termination for convenience on 30 days\' notice; for cause after a 10 Business Day cure period; survival; Trade Secrets protected for as long as they remain trade secrets.\n' +
    '9) BREACH AND REMEDIES: irreparable harm; injunctive relief; damages; agreed compensation of USD 25,000 per Material Breach involving a single document or item and USD 100,000 per Material Breach involving bulk data, client records or Trade Secrets, or actual damages if greater, stated as a genuine pre-estimate of loss that a court may adjust under the Civil Transactions Law; indemnity; duty to mitigate; reasonable legal costs to the prevailing party; cumulative remedies; no liability cap for wilful breach or breach of confidentiality.\n' +
    '10) GOVERNING LAW, citing the trade secrets law listed above.\n' +
    '11) DISPUTE RESOLUTION as set out above.\n' +
    '12) GENERAL PROVISIONS: entire agreement, written amendments, severability, no waiver, assignment only with consent (merger exception), notices by email and courier using the details provided, force majeure (natural disasters, pandemic, war, terrorism, governmental action, infrastructure failure), counterparts and electronic signatures, language, no partnership or agency.',

  freelance:
    'MANDATORY SECTIONS, in order:\n' +
    '1) TITLE, PARTIES (Freelancer and Client) AND EFFECTIVE DATE.\n' +
    '2) RECITALS: 2 to 3 WHEREAS clauses.\n' +
    '3) DEFINITIONS: Services, Deliverables, Project Fee, Revision Round, Change Request, Acceptance, Business Day, Pre-existing Materials.\n' +
    '4) SCOPE OF SERVICES: the services described, an explicit out-of-scope statement, and a change-request process with a written quote.\n' +
    '5) TIMELINE AND CLIENT RESPONSIBILITIES: the timeline provided; client feedback within 5 Business Days; client delays extend deadlines.\n' +
    '6) REVISIONS AND ACCEPTANCE: the revision rounds chosen; extra rounds billed at a stated day rate; deemed acceptance after 7 Business Days without written objection.\n' +
    '7) FEES AND PAYMENT: the fee and payment terms provided; invoices due within 14 days; late payment consequence; deposit non-refundable once work starts; right to pause work for non-payment; VAT added where the Freelancer is VAT-registered.\n' +
    '8) INTELLECTUAL PROPERTY: ownership of the Deliverables transfers to the Client ONLY on full payment; the Freelancer keeps Pre-existing Materials and grants a licence to use them in the Deliverables; portfolio use allowed unless the Client objects in writing.\n' +
    '9) CONFIDENTIALITY: one short mutual clause.\n' +
    '10) INDEPENDENT CONTRACTOR STATUS: no employment, partnership or agency; the Freelancer holds their own licence or freelance permit.\n' +
    '11) WARRANTIES AND LIABILITY: work is original; liability capped at fees paid; no indirect losses.\n' +
    '12) TERMINATION: either party on 14 days\' notice; Client pays for work done plus a kill fee of 25% of the unpaid balance; immediate termination for material breach not cured within 10 Business Days.\n' +
    '13) GOVERNING LAW AND DISPUTE RESOLUTION as set out above.\n' +
    '14) GENERAL PROVISIONS: entire agreement, amendment, notices, assignment, severability, force majeure, counterparts and electronic signatures, language.',

  contractor:
    'MANDATORY SECTIONS, in order:\n' +
    '1) TITLE, PARTIES (Company and Contractor) AND EFFECTIVE DATE (the start date provided).\n' +
    '2) RECITALS.\n' +
    '3) DEFINITIONS: Services, Work Product, Fees, Term, Business Day, Confidential Information.\n' +
    '4) SERVICES AND TERM: scope, start date and duration as provided; renewal by written agreement.\n' +
    '5) INDEPENDENT CONTRACTOR RELATIONSHIP (the heart of this document): the Contractor controls the manner, means and hours of work; there is no employment relationship; the Labour Relations Law (Federal Decree-Law No. 33 of 2021, as amended) does not apply; no salary, end-of-service gratuity, annual leave, visa sponsorship or employee benefits; the Contractor may work for others; the Contractor holds and maintains their own trade licence or freelance permit.\n' +
    '6) TOOLS, EXPENSES AND TAXES: own equipment; only pre-approved expenses; the Contractor is responsible for their own taxes and VAT.\n' +
    '7) FEES AND INVOICING: the rate provided; monthly invoices (with timesheets for hourly rates); payment within 30 days.\n' +
    '8) INTELLECTUAL PROPERTY: per the ownership option chosen; where the Company owns IP, assignment on payment; the Contractor\'s pre-existing tools excluded.\n' +
    '9) CONFIDENTIALITY: proportionate, surviving 2 years.\n' +
    '10) NON-SOLICITATION: no soliciting the Company\'s employees for 6 months after the Term. No broad non-compete.\n' +
    '11) LIABILITY AND INDEMNITY: mutual, capped at fees paid in the prior 6 months except for fraud or wilful misconduct.\n' +
    '12) TERMINATION: either party on 14 days\' notice; immediately for uncured material breach; payment for work done.\n' +
    '13) GOVERNING LAW AND DISPUTE RESOLUTION as set out above.\n' +
    '14) GENERAL PROVISIONS.\n' +
    'Do NOT include probation, salary, fixed working hours or other employment terms.',

  tos:
    'THIS DOCUMENT IS DIFFERENT: these are Terms of Service published by the company to its users, not a two-party contract. Write in the second person to the user ("you") and refer to the company by name or as "we".\n' +
    'MANDATORY SECTIONS, in order:\n' +
    '1) TITLE, company name, website or app URL, and "Last updated" date (the effective date provided).\n' +
    '2) ACCEPTANCE OF TERMS AND ELIGIBILITY: the minimum age chosen.\n' +
    '3) DEFINITIONS: Service, Account, User Content, Subscription, Fees.\n' +
    '4) ACCOUNTS: accurate information, credential security, responsibility for activity.\n' +
    '5) ACCEPTABLE USE: a list of prohibited conduct (unlawful use, scraping, reverse engineering, malware, infringing content).\n' +
    '6) FEES, SUBSCRIPTIONS AND REFUNDS: only if the service involves payments; billing cycle, auto-renewal and how to cancel, price changes on 30 days\' notice, refund policy.\n' +
    '7) USER CONTENT: the user keeps ownership; a limited licence to the company to host and operate the Service; removal of unlawful content.\n' +
    '8) OUR INTELLECTUAL PROPERTY.\n' +
    '9) PRIVACY: refers to a separate Privacy Policy; personal data processed in line with Federal Decree-Law No. 45 of 2021.\n' +
    '10) SERVICE CHANGES AND AVAILABILITY.\n' +
    '11) DISCLAIMERS: the Service is provided "as is" to the extent permitted by UAE law.\n' +
    '12) LIMITATION OF LIABILITY: capped at fees paid in the prior 12 months; no indirect losses; nothing limits liability that cannot be limited under UAE law.\n' +
    '13) INDEMNITY by the user.\n' +
    '14) SUSPENSION AND TERMINATION.\n' +
    '15) CHANGES TO THESE TERMS: notice by email or in-app; continued use is acceptance.\n' +
    '16) GOVERNING LAW AND DISPUTE RESOLUTION as set out above.\n' +
    'Do NOT include signature blocks, IN WITNESS WHEREOF, WHEREAS recitals, mutual confidentiality, or liquidated damages.',

  consulting:
    'MANDATORY SECTIONS, in order:\n' +
    '1) TITLE, PARTIES (Consultant and Client) AND EFFECTIVE DATE.\n' +
    '2) RECITALS.\n' +
    '3) DEFINITIONS: Services, Deliverables, Retainer, Included Hours, Additional Hours, Business Day, Confidential Information.\n' +
    '4) SERVICES: the advisory services provided; the Client makes its own decisions; the Consultant does not guarantee any particular result.\n' +
    '5) FEES: the fee provided; for a retainer, included hours per month, unused hours do not roll over, overage rate, payment monthly in advance; for hourly fees, monthly invoicing.\n' +
    '6) EXPENSES: reimbursed only if pre-approved in writing.\n' +
    '7) EXCLUSIVITY AND CONFLICTS: per the exclusivity option chosen; disclosure of conflicts.\n' +
    '8) CONFIDENTIALITY: proportionate, surviving 3 years.\n' +
    '9) INTELLECTUAL PROPERTY: the Client owns the Deliverables on payment; the Consultant keeps general know-how, methods and templates.\n' +
    '10) INDEPENDENT CONTRACTOR STATUS.\n' +
    '11) LIABILITY: capped at fees paid in the prior 3 months; no indirect losses; carve-outs for fraud and wilful misconduct.\n' +
    '12) TERM AND TERMINATION: the engagement length chosen; 30 days\' notice; immediately for uncured material breach; fees due to the termination date.\n' +
    '13) GOVERNING LAW AND DISPUTE RESOLUTION as set out above.\n' +
    '14) GENERAL PROVISIONS.',

  partnership:
    'MANDATORY SECTIONS, in order:\n' +
    '1) TITLE, PARTNERS AND EFFECTIVE DATE.\n' +
    '2) RECITALS.\n' +
    '3) IMPORTANT NOTICE near the top: a business carried on in the UAE must hold the appropriate trade licence and, where it is a company, be incorporated under the Commercial Companies Law (Federal Decree-Law No. 32 of 2021, as amended by Federal Decree-Law No. 20 of 2025) or the relevant free zone rules; this agreement governs the partners\' relationship alongside that licence and any memorandum or articles of association, which prevail as to third parties if they conflict.\n' +
    '4) DEFINITIONS: Business, Capital Contribution, Net Profit, Net Loss, Major Decision, Deadlock, Exit Event, Fair Market Value.\n' +
    '5) BUSINESS, NAME AND PLACE OF BUSINESS.\n' +
    '6) CAPITAL CONTRIBUTIONS: exactly as the user described; process for additional capital; no interest on capital.\n' +
    '7) PROFIT, LOSS AND DISTRIBUTIONS: the split provided; distribution timing; books, records and annual accounts; each partner\'s access to records.\n' +
    '8) ROLES AND MANAGEMENT: the roles provided; day-to-day authority; Major Decisions (borrowing, spending above a stated threshold, new partners, sale of the business) need unanimous consent.\n' +
    '9) DEADLOCK: good-faith negotiation, then mediation, then a buy-sell mechanism or dissolution.\n' +
    '10) PARTNER EXIT: per the exit option chosen; voluntary withdrawal notice; death or incapacity; right of first refusal on any transfer; valuation at Fair Market Value set by an independent valuer if not agreed.\n' +
    '11) DUTIES: good faith; time commitment; no competing business during the partnership and for 12 months after exit within the UAE.\n' +
    '12) CONFIDENTIALITY: one short clause.\n' +
    '13) DISSOLUTION AND WINDING UP.\n' +
    '14) GOVERNING LAW AND DISPUTE RESOLUTION as set out above.\n' +
    '15) GENERAL PROVISIONS.\n' +
    'Do NOT make confidentiality the main body or include liquidated-damages amounts.'
};

function buildSystemPrompt(docId, emirate) {
  return baseInstructions(emirate || 'Dubai') + '\n' + SECTIONS[docId] + '\n' + (docId === 'tos' ? ENDING_TOS : ENDING_SIGNED);
}

function allFields(d) { return COUNTRY_FIELDS.concat(d.fields); }

function buildUserPrompt(d, values) {
  var details = d.fields.map(function (f) { return f.label + ': ' + (values[f.id] || 'Not specified'); }).join('\n');
  return 'Draft a complete ' + d.name + ' governed by the laws of the United Arab Emirates (Emirate of ' + (values.emirate || 'Dubai') + ').\n\n' +
    'Details provided by the user:\n' + details + '\n\n' +
    'Follow the mandatory section list in your instructions exactly and in order. Complete every section and end with the required ending.';
}

// ---------- Quality checks (rubric Part A + Part B, automated subset) ----------

function has(text, re) { return re.test(text); }

function checkDocument(d, text, values, stopReason) {
  var results = [];
  function add(id, label, pass, critical) { results.push({ id: id, label: label, pass: !!pass, critical: critical !== false }); }
  var lower = text.toLowerCase();

  add('A1', 'Complete, not cut off, ends with the disclaimer', stopReason !== 'max_tokens' && /DISCLAIMER:/.test(text.slice(-1500)));
  add('A2', 'No placeholders like [Party A] or [DATE]', !/\[(?:party|date|name|insert|client|company|address|email|signatory|title|amount)[^\]]*\]|XXX/i.test(text));
  add('A2b', 'Uses the party names entered', d.partyFields.every(function (k) { return !values[k] || lower.indexOf(String(values[k]).toLowerCase().split(/[ ,]/)[0]) !== -1; }));
  add('A4', 'Governed by UAE law', has(text, /United Arab Emirates|UAE/));
  add('A5', 'No repealed or wrong law citations', !/No\.?\s*\(?5\)?\s*of\s*1985|No\.?\s*\(?36\)?\s*of\s*2021/i.test(text));
  add('A6', 'Dispute route is DIAC arbitration', has(text, /DIAC|Dubai International Arbitration Cent/i));
  add('A13', 'Cites the UAE e-signature law', has(text, /46\s*of\s*2021/), false);

  if (d.id !== 'nda') {
    add('A9', 'No NDA clauses in a non-NDA document', !/Disclosing Party|Receiving Party|USD\s*25,000|USD\s*100,000/.test(text));
  }

  var B = {
    nda: [
      ['B-nda1', 'Defines Confidential Information', /"?Confidential Information"?\s+(means|shall mean)/i],
      ['B-nda2', 'Return or destruction of information', /return|destr/i],
      ['B-nda3', 'Agreed damages framed as a pre-estimate a court may adjust', /pre-estimate/i]
    ],
    freelance: [
      ['B-fr1', 'Out-of-scope statement', /out[- ]of[- ]scope|outside (the )?scope/i],
      ['B-fr2', 'IP passes only on full payment', /(full|final|complete) payment|paid in full/i],
      ['B-fr3', 'Revision limit', /revision/i]
    ],
    contractor: [
      ['B-co1', 'States no employment relationship', /not (an? )?employee|no employment relationship|does not create (an? )?employment/i],
      ['B-co2', 'Excludes the UAE Labour Law', /33\s*of\s*2021/],
      ['B-co3', 'No gratuity or employee benefits', /gratuity/i],
      ['B-co4', 'No probation period', null]
    ],
    tos: [
      ['B-tos1', 'No signature blocks', null],
      ['B-tos2', 'Acceptable use rules', /acceptable use|prohibited/i],
      ['B-tos3', 'Cites the UAE data protection law', /45\s*of\s*2021/],
      ['B-tos4', 'Explains how to cancel', /cancel/i]
    ],
    consulting: [
      ['B-cn1', 'No guarantee of results', /(not|no) guarantee|does not guarantee|without guarantee/i],
      ['B-cn2', 'Retainer or fee mechanics', /retainer|invoice/i],
      ['B-cn3', 'Liability cap', /liabilit/i]
    ],
    partnership: [
      ['B-pa1', 'Capital contributions', /capital contribution/i],
      ['B-pa2', 'Deadlock clause', /deadlock/i],
      ['B-pa3', 'Licence / Companies Law notice', /32\s*of\s*2021/],
      ['B-pa4', 'Exit valuation method', /valuation|fair market value/i]
    ]
  }[d.id] || [];

  B.forEach(function (b) {
    var pass;
    if (b[0] === 'B-co4') pass = !/probation/i.test(text);
    else if (b[0] === 'B-tos1') pass = !/IN WITNESS WHEREOF/.test(text);
    else pass = b[2].test(text);
    add(b[0], b[1], pass, true);
  });

  var criticalFails = results.filter(function (r) { return r.critical && !r.pass; });
  return { results: results, passed: criticalFails.length === 0, criticalFails: criticalFails };
}

// ---------- Generation (one automatic retry if the checks fail) ----------

function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

async function postToProxy(body) {
  // A dropped connection (computer asleep, Wi-Fi change, gateway timeout without CORS headers)
  // surfaces as a bare TypeError "Failed to fetch". Retry those once before giving up.
  for (var attempt = 1; ; attempt++) {
    try {
      return await fetch(PROXY_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body });
    } catch (e) {
      if (attempt >= 2) throw new Error('The connection dropped while the document was being written. Check your internet connection, keep this tab open and try again.');
      await wait(3000);
    }
  }
}

async function callModel(system, userContent) {
  var res = await postToProxy(JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, system: system, messages: [{ role: 'user', content: userContent }] }));
  var data;
  try { data = await res.json(); } catch (e) { throw new Error('The server returned an unexpected response (' + res.status + '). Please try again.'); }
  if (data.error) throw new Error(typeof data.error === 'string' ? data.error : (data.error.message || data.error.type || 'Request failed'));
  var text = '';
  (data.content || []).forEach(function (c) { if (c.type === 'text') text += c.text; });
  if (!text) throw new Error('No content returned');
  return { text: text, stopReason: data.stop_reason };
}

async function generateChecked(d, values) {
  var system = buildSystemPrompt(d.id, values.emirate);
  var user = buildUserPrompt(d, values);
  var first = await callModel(system, user);
  var check = checkDocument(d, first.text, values, first.stopReason);
  if (check.passed) return { text: first.text, check: check, attempts: 1 };

  var fixNote = user + '\n\nIMPORTANT: a previous draft failed these quality checks, so make sure the new draft satisfies them: ' +
    check.criticalFails.map(function (f) { return f.label; }).join('; ') + '.';
  var second = await callModel(system, fixNote);
  var check2 = checkDocument(d, second.text, values, second.stopReason);
  return { text: second.text, check: check2, attempts: 2, firstCheck: check };
}

// ---------- Downloads ----------

function loadScript(src) {
  return new Promise(function (resolve, reject) {
    if (document.querySelector('script[data-src="' + src + '"]')) return resolve();
    var s = document.createElement('script');
    s.src = src; s.dataset.src = src; s.onload = resolve; s.onerror = function () { reject(new Error('Could not load ' + src)); };
    document.head.appendChild(s);
  });
}

function isHeading(line) {
  var t = line.trim();
  return t.length > 2 && t.length < 120 && t === t.toUpperCase() && /[A-Z]/.test(t);
}

function safeFileName(name) { return name.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 80) || 'ContractAI-document'; }

async function downloadPdf(text, baseName) {
  await loadScript('vendor/jspdf.umd.min.js');
  var doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'a4' });
  var margin = 64, width = doc.internal.pageSize.getWidth() - margin * 2, pageH = doc.internal.pageSize.getHeight();
  var y = margin, size = 10.5, lh = size * 1.5;
  text.split('\n').forEach(function (line) {
    var heading = isHeading(line);
    doc.setFont('times', heading ? 'bold' : 'normal');
    doc.setFontSize(heading ? 11.5 : size);
    var wrapped = line.trim() === '' ? [''] : doc.splitTextToSize(line, width);
    if (heading && y > margin) y += lh * 0.4;
    wrapped.forEach(function (w) {
      if (y > pageH - margin) { doc.addPage(); y = margin; }
      doc.text(w, margin, y); y += lh;
    });
  });
  var pages = doc.getNumberOfPages();
  for (var p = 1; p <= pages; p++) {
    doc.setPage(p); doc.setFont('times', 'normal'); doc.setFontSize(8.5);
    doc.text('Page ' + p + ' of ' + pages, doc.internal.pageSize.getWidth() / 2, pageH - 30, { align: 'center' });
  }
  doc.save(safeFileName(baseName) + '.pdf');
}

async function downloadDocx(text, baseName) {
  await loadScript('vendor/docx.umd.js');
  var D = window.docx;
  var paras = text.split('\n').map(function (line) {
    var heading = isHeading(line);
    return new D.Paragraph({
      spacing: { after: 120, before: heading ? 240 : 0 },
      children: [new D.TextRun({ text: line, bold: heading, font: 'Times New Roman', size: heading ? 23 : 21 })]
    });
  });
  var file = new D.Document({ sections: [{ properties: {}, children: paras }] });
  var blob = await D.Packer.toBlob(file);
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = safeFileName(baseName) + '.docx';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
}
