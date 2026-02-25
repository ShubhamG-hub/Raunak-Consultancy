const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

async function migrate() {
    try {
        console.log('Cleaning up existing services...');
        await db.query('DELETE FROM services');

        const insurancePlans = [
            {
                title: 'Retirement & Pension Plan',
                slug: 'retirement-life-plan',
                icon: 'Clock',
                description: 'Secure your golden years with guaranteed lifelong pension and risk-free cash flow.',
                details: 'Comprehensive Life Pension planning incorporating inflation-adjusted annuities and SWP strategies. We focus on "Asset-to-Income" conversion to ensure a guaranteed, risk-free cash flow that sustains your premium lifestyle throughout your golden years.',
                features: 'Guaranteed Life Pension|Inflation-Adjusted SWP|Annuity Maximization|Longevity Risk Shield',
                color: '#f59e0b',
                calc_id: 'retirement'
            },
            {
                title: 'Children Education Plan',
                slug: 'children-education-plan',
                icon: 'GraduationCap',
                description: 'Secure your child\'s career aspirations with inflation-proof education funding.',
                details: 'Strategic Education Inflation Guard to secure your child\'s career aspirations. We utilize goal-based equity strategies and Waiver of Premium (WOP) riders to ensure the educational corpus remains intact under all circumstances.',
                features: 'Education Inflation Guard|Waiver of Premium (WOP)|Career Milestone Funding|Goal-Locked Equity Funds',
                color: '#14b8a6',
                calc_id: 'child'
            },
            {
                title: 'Children Marriage Plan',
                slug: 'children-marriage-plan',
                icon: 'Award',
                description: 'Plan ahead for your child\'s special day with dedicated marriage savings plans.',
                details: 'Tailored investment solutions designed to build a substantial corpus for your child\'s wedding. We combine growth-oriented assets with capital protection to ensure the celebration is exactly as you envisioned.',
                features: 'Lump Sum Wealth Creation|Capital Protection Guarantee|Flexible Tenure Options|Tax-Free Maturity Benefits',
                color: '#f43f5e',
                calc_id: 'child'
            },
            {
                title: 'Health & Mediclaim Plan',
                slug: 'health-mediclaim-plan',
                icon: 'HeartPulse',
                description: 'Comprehensive medical coverage to protect your savings from rising healthcare costs.',
                details: 'Optimized healthcare coverage strategies. We help you navigate Family Floaters, Super Top-ups, and Critical Illness riders to protect your retirement corpus from medical inflation and unforeseen hospitalization costs.',
                features: 'Medical Inflation Guard|Family Floater Audit|Critical Illness Protection|Cashless Network Access',
                color: '#ec4899',
                calc_id: null
            },
            {
                title: 'LIC Endowment / FD Plan',
                slug: 'fixed-deposit-plan',
                icon: 'Briefcase',
                description: 'Safe and guaranteed returns on your lump sum investments with life cover.',
                details: 'Traditional saving-cum-protection plans offering guaranteed returns. Ideal for low-risk investors seeking capital safety along with financial security for their family.',
                features: 'Capital Safety Guarantee|Guaranteed Additions|Loan Facility Available|Tax Benefits u/s 80C',
                color: '#6366f1',
                calc_id: 'lumpsum'
            },
            {
                title: 'Mutual Fund & SIP',
                slug: 'mutual-fund-sip-plan',
                icon: 'TrendingUp',
                description: 'Strategic wealth creation through scientific asset allocation and compounding.',
                details: 'Strategic wealth creation utilizing Scientific Asset Allocation and Mean-Variance Optimization. We leverage Rupee Cost Averaging to mitigate market volatility, ensuring your SIP and Lumpsum portfolios achieve targeted financial milestones.',
                features: 'Scientific Asset Allocation|Rupee Cost Averaging|Mean-Variance Optimization|Goal-Linkage Monitoring',
                color: '#3b82f6',
                calc_id: 'sip'
            },
            {
                title: 'Term Insurance (High Cover)',
                slug: 'term-insurance-plan',
                icon: 'ShieldCheck',
                description: 'Pure life protection with high sum assured at very affordable premiums.',
                details: 'Strict adherence to Human Life Value (HLV) principles to eliminate the "Insurance Mirage". We specialize in high-cover Term plans and riders, ensuring adequate Sum Assured to maintain your family\'s financial dignity.',
                features: 'Human Life Value (HLV) Audit|Death Claim Assistance|Accidental Death Rider|Critical Illness Add-on',
                color: '#10b981',
                calc_id: 'hlv'
            },
            {
                title: 'Tax Saving (Sec 80C)',
                slug: 'tax-saving-plan',
                icon: 'Calculator',
                description: 'Smart investment options to reduce tax liability and grow wealth.',
                details: 'Proactive tax optimization for individuals and businesses. Beyond basic Section 80C, we manage capital gains, 80D medical deductions, and strategic wealth preservation to ensure legally minimized liabilities.',
                features: '80C & 80D Optimization|Capital Gains Strategy|Tax-Loss Harvesting|Compliance Management',
                color: '#8b5cf6',
                calc_id: 'tax'
            }
        ];

        const policyServices = [
            {
                title: 'New Policy Registration',
                slug: 'new-policy-registration',
                icon: 'ShieldCheck',
                description: 'Assistance with new policy applications and documentation.',
                details: 'Expert assistance in selecting the right policy and completing the necessary documentation. We ensure a smooth onboarding process with proper risk assessment and advice.',
                features: 'Needs-Based Analysis|e-KYC Documentation|Application Tracking|Personalized Quote Comparison',
                color: '#10b981'
            },
            {
                title: 'Policy Revival (Lapsed)',
                slug: 'policy-revival',
                icon: 'RefreshCw',
                description: 'Help in reviving lapsed policies with minimal hassle.',
                details: 'Don\'t let your valuable life cover go to waste. We assist in calculating arrears, arranging health certificates, and processing the revival of lapsed policies even after years.',
                features: 'Interest Penalty Calculation|Health Checkup Assistance|Document Preparation|Fast-Track Processing',
                color: '#3b82f6'
            },
            {
                title: 'Loan on Policy',
                slug: 'loan-on-policy',
                icon: 'Coins',
                description: 'Avail quick loans against your existing insurance policies.',
                details: 'Financial emergencies can arise anytime. We help you leverage your existing LIC policies to get quick loans at lower interest rates than traditional personal loans.',
                features: 'Eligibility Check|Low Interest Rates|No Credit Score Required|Quick Disbursement Support',
                color: '#f59e0b'
            },
            {
                title: 'Maturity Claim Payout',
                slug: 'policy-maturity-claim',
                icon: 'CheckCircle2',
                description: 'Smooth processing of policy maturity benefits and payouts.',
                details: 'Ensuring you receive your hard-earned maturity benefits on time. We handle the paperwork and coordination with the branch to ensure direct credit to your bank account.',
                features: 'Advance Maturity Notification|Document Verification|NEFT Registration Support|Payout Status Tracking',
                color: '#10b981'
            },
            {
                title: 'Death Claim Settlement',
                slug: 'policy-death-claim',
                icon: 'Activity',
                description: 'Compassionate assistance for death claim settlements.',
                details: 'In difficult times, we stand by the grieving family. Our dedicated team handles the entire claim process with sensitivity, ensuring the family receives the financial support without stress.',
                features: 'Compassionate Support|Prioritized Documentation|Hassle-Free Settlement|Legal & Succession Guidance',
                color: '#ef4444'
            },
            {
                title: 'Address & Contact Update',
                slug: 'policy-address-change',
                icon: 'MapPin',
                description: 'Updating your contact details across all policy records.',
                details: 'Keep your records current to receive important communications and premium reminders. We help update address, mobile number, and email across multiple policy records.',
                features: 'Universal Update Service|KYC Document Collection|System Synchronisation|Email & SMS Verification',
                color: '#6366f1'
            },
            {
                title: 'Nomination & Ownership',
                slug: 'change-in-nomination',
                icon: 'Users',
                description: 'Ensuring your beneficiaries are correctly updated in your policies.',
                details: 'Protect your loved ones by ensuring proper nomination. We assist in adding, changing, or updating nominees and handles assignments for various purposes.',
                features: 'Nominee Audit|Legal Heir Guidance|Assignment Processing|Beneficiary Verification',
                color: '#8b5cf6'
            },
            {
                title: 'Premium Payment Alerts',
                slug: 'lic-premium-reminder',
                icon: 'Bell',
                description: 'Timely alerts for your upcoming LIC premium payments.',
                details: 'Avoid late fees and policy lapses with our premium reminder service. We provide personalized alerts via WhatsApp, SMS, and Email multiple days before the due date.',
                features: 'WhatsApp Integration|Grace Period Alerts|Online Payment Links|Payment History Tracking',
                color: '#f59e0b'
            },
            {
                title: 'Policy Audit & Status',
                slug: 'lic-policy-status',
                icon: 'Info',
                description: 'Detailed audit of your current portfolio and policy status.',
                details: 'Are you adequately insured? A professional audit helps identify gaps in your portfolio, current surrender values, and loan availability across all your life insurance policies.',
                features: 'Comprehensive Gap Analysis|Surrender Value Calculation|Loan Availability Check|Vesting Date Monitoring',
                color: '#0ea5e9'
            },
            {
                title: 'Tax Certificate (ITR)',
                slug: 'lic-tax-certificate',
                icon: 'FileText',
                description: 'Obtain consolidated tax certificates for your ITR filings.',
                details: 'Streamline your tax filing process. We provide consolidated premium certificates for all your policies, ready to be presented for Section 80C deductions.',
                features: 'Consolidated Reporting|Digi-Locker Ready|Annual Premium Statement|Instant PDF Generation',
                color: '#64748b'
            }
        ];

        console.log('Inserting Insurance & Investment Plans...');
        for (let i = 0; i < insurancePlans.length; i++) {
            const s = insurancePlans[i];
            await db.query(
                'INSERT INTO services (id, slug, title, description, icon, category, order_index, active, details, features, color, calc_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [uuidv4(), s.slug, s.title, s.description, s.icon, 'Insurance & Investment Plans', i, true, s.details, s.features, s.color, s.calc_id]
            );
        }

        console.log('Inserting Policy Support & Services...');
        for (let i = 0; i < policyServices.length; i++) {
            const s = policyServices[i];
            await db.query(
                'INSERT INTO services (id, slug, title, description, icon, category, order_index, active, details, features, color, calc_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [uuidv4(), s.slug, s.title, s.description, s.icon, 'Policy Support & Services', i + 100, true, s.details, s.features, s.color, null]
            );
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
