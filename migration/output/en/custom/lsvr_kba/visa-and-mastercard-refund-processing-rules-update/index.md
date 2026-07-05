---
title: "Visa and MasterCard Refund Processing Rules Update"
date: 2026-04-03
---

1. ## Core Background of Rule Update
    

To bolster the security of refund transactions, enhance cardholders' refund experience, and mitigate fraud and chargeback risks, Visa and MasterCard have rolled out phased updates to their refund processing rules since 2019. Under the revised rules, acquirers and their processors must ensure all refund transactions are authorized online by the issuer before clearing submission.

This update only modifies the technical refund processing workflows on the acquirer side and issuer side. By subjecting refund transactions to real-time issuer authorization, it enables the interception of abnormal and invalid refunds at the source, effectively reducing subsequent chargeback incidents. Merchants can now monitor refund statuses in real time, proactively reach out to consumers with failed refund attempts, and complete refunds through alternative channels. Meanwhile, issuers are required to display pending refund authorization details to cardholders via online banking or mobile apps, allowing cardholders to track refund progress in real time.

### Mandatory Effective Timelines

- **Visa**: Fully implemented globally from April 18, 2020; fines for unauthorized refund transactions will be enforced starting July 1, 2020.
    
- **MasterCard**: Effective from October 18, 2024; fines commence from May 1, 2025.
    

2. ## Comparison of Refund Processes Before and After the Update
    

|    |   Previous refund rule (Direct clearing model)   |   New refund rule (Mandatory authorization model)   |
| --- | --- | --- |
|   Core Workflow   |   Merchant initiates refund → Acquirer processes clearing → Issuer credits cardholder's account   |   Merchant initiates refund → Submit authorization request → Issuer approves → Clearing and posting   |
|   Status Visibility & Feedback   |   No real-time feedback; refund outcome only known after clearing   |   Real-time approval result (Approved/Declined) with corresponding reason returned immediately   |
|   Permitted Exceptions of Industries & Scenarios   |   /   |   Visa：Optional for airlines and mass transit merchants.  MasterCard：  - Additional information on permitted exceptions is found in Section 5.11.3, "Obtain an Authorization," of the Mastercard Rules and Section 3.3, "Obtainingan Authorization," of the Transaction Processing Rules      - Collections-only processing      - Rebates      - Airline transactions      - Reversal transactions      - Bridged transactions      - Aggregated transit transactions      - Merchant and acquirer funded installments        |

3. ## Merchant Benefits
    

- Improves customer experience and satisfaction
    
- Reduces customer service inquiries related to lack of real-time information about a refund status
    
- Provides real-time issuer account validation
    
- Minimizes related chargebacks
    

4. ## Actions for Oceanpayment Merchants
    

1. No changes are required to your current refund workflow. Oceanpayment has already completed full system upgrades to ensure full compliance with card scheme requirements.
    
2. Refund authorizations may be declined by issuing banks for reasons such as invalid account numbers, invalid account types, or expired cards. Merchants should track failed refund transactions, promptly reach out to affected customers, and perform the refund using another method when necessary.
